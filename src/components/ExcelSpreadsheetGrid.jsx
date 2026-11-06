import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  Printer, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Copy,
  ClipboardPaste,
  Check,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Layers,
  HelpCircle
} from 'lucide-react';
import { 
  calculateRankings, 
  calculateSemesterResults, 
  calculateAnnualResults, 
  toKhmerNum,
  copyTableToClipboard,
  copyScoresToClipboard,
  parsePastedTSV
} from '../utils/gradeCalculations';
import { exportToMoEYSExcel, importFromExcelFile } from '../utils/excelHandler';

export default function ExcelSpreadsheetGrid({
  info,
  students,
  subjects,
  currentMonth,
  months,
  onSelectMonth,
  grades,
  onUpdateScore,
  onBatchUpdateScores,
  onImportStudents,
  onOpenPasteModal
}) {
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 }); // col: 0..subjects.length-1
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, female, pass, fail, top5, slow
  const [sortField, setSortField] = useState('rank'); // rank, name, id, total
  const [sortAsc, setSortAsc] = useState(true);
  const [activeCellEditVal, setActiveCellEditVal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState('');
  const [copiedType, setCopiedType] = useState(null);
  
  // Sheet View Mode: 'monthly' | 'sem1' | 'sem2' | 'annual'
  const [viewMode, setViewMode] = useState('monthly');

  const gridRef = useRef(null);
  const fileInputRef = useRef(null);

  const monthGrades = grades[currentMonth.id] || {};
  
  // Rankings for current active month
  const rankings = useMemo(() => {
    return calculateRankings(students, monthGrades, subjects);
  }, [students, monthGrades, subjects]);

  // Semester & Annual Results
  const sem1Results = useMemo(() => {
    return calculateSemesterResults(students, subjects, grades, months, 1);
  }, [students, subjects, grades, months]);

  const sem2Results = useMemo(() => {
    return calculateSemesterResults(students, subjects, grades, months, 2);
  }, [students, subjects, grades, months]);

  const annualResults = useMemo(() => {
    return calculateAnnualResults(students, subjects, grades, months);
  }, [students, subjects, grades, months]);

  // Filtered & Sorted student list
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const stats = rankings[s.id] || {};
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              s.id.includes(searchTerm);
        if (!matchesSearch) return false;

        if (filterType === 'female') return s.gender === 'ស្រី';
        if (filterType === 'pass') return stats.isPassed;
        if (filterType === 'fail') return !stats.isPassed;
        if (filterType === 'top5') return stats.rank && stats.rank <= 5;
        if (filterType === 'slow') return stats.isSlowLearner;
        return true;
      })
      .sort((a, b) => {
        const statsA = rankings[a.id] || {};
        const statsB = rankings[b.id] || {};
        let result = 0;
        if (sortField === 'rank') {
          result = (statsA.rank || 999) - (statsB.rank || 999);
        } else if (sortField === 'total') {
          result = (statsB.rawTotal || 0) - (statsA.rawTotal || 0);
        } else if (sortField === 'name') {
          result = a.name.localeCompare(b.name, 'km');
        } else if (sortField === 'id') {
          result = a.id.localeCompare(b.id);
        }
        return sortAsc ? result : -result;
      });
  }, [students, rankings, searchTerm, filterType, sortField, sortAsc]);

  // Statistics Summary
  const statsSummary = useMemo(() => {
    const total = students.length;
    const female = students.filter(s => s.gender === 'ស្រី').length;
    let passed = 0;
    let passedFemale = 0;
    let sumAverage = 0;

    students.forEach(s => {
      const st = rankings[s.id];
      if (st && st.isPassed) {
        passed++;
        if (s.gender === 'ស្រី') passedFemale++;
      }
      if (st && st.average50) {
        sumAverage += st.average50;
      }
    });

    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    const classAvg = total > 0 ? (sumAverage / total).toFixed(2) : 0;

    return { total, female, passed, passedFemale, passRate, classAvg };
  }, [students, rankings]);

  // Active cell info for Excel formula bar
  const activeStudent = filteredStudents[selectedCell.row] || filteredStudents[0];
  const activeSubject = subjects[selectedCell.col] || subjects[0];
  const activeVal = activeStudent && activeSubject 
    ? (monthGrades[activeStudent.id]?.[activeSubject.id] ?? '') 
    : '';

  // Direct paste handler from Excel into grid
  const handleGridPaste = (e) => {
    if (viewMode !== 'monthly') return;
    const pasteText = e.clipboardData.getData('text');
    if (!pasteText) return;

    const rows = parsePastedTSV(pasteText);
    if (!rows.length) return;

    // Check if this is multi-cell data from Excel
    if (rows.length > 1 || rows[0].length > 1 || !isNaN(parseFloat(rows[0][0]))) {
      e.preventDefault();
      const newGrades = { ...monthGrades };
      let updatedCount = 0;

      rows.forEach((row, rOffset) => {
        const targetStudentIdx = selectedCell.row + rOffset;
        if (targetStudentIdx < filteredStudents.length) {
          const student = filteredStudents[targetStudentIdx];
          newGrades[student.id] = newGrades[student.id] || {};

          row.forEach((cell, cOffset) => {
            const targetSubjectIdx = selectedCell.col + cOffset;
            if (targetSubjectIdx < subjects.length) {
              const sub = subjects[targetSubjectIdx];
              let num = parseFloat(cell.replace(/[^0-9.]/g, ''));
              if (!isNaN(num)) {
                num = Math.min(sub.max, Math.max(0, num));
                newGrades[student.id][sub.id] = num;
                updatedCount++;
              }
            }
          });
        }
      });

      if (updatedCount > 0) {
        onBatchUpdateScores(currentMonth.id, newGrades);
        setNotification(`បានបិទភ្ជាប់ពិន្ទុ ${toKhmerNum(updatedCount)} ប្រអប់ពី Excel ដោយជោគជ័យ!`);
        setTimeout(() => setNotification(''), 4000);
      }
    }
  };

  // Keyboard navigation like real Microsoft Excel
  const handleKeyDown = (e) => {
    // If pressing Ctrl+C on active cell
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      if (activeVal !== '') {
        navigator.clipboard?.writeText(String(activeVal));
        setNotification(`បានចម្លងពិន្ទុ ${activeVal} ទៅ Clipboard!`);
        setTimeout(() => setNotification(''), 2000);
      }
      return;
    }

    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsEditing(false);
        // Move down like Excel
        if (selectedCell.row < filteredStudents.length - 1) {
          setSelectedCell(prev => ({ ...prev, row: prev.row + 1 }));
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setIsEditing(false);
        if (e.shiftKey) {
          if (selectedCell.col > 0) setSelectedCell(prev => ({ ...prev, col: prev.col - 1 }));
        } else {
          if (selectedCell.col < subjects.length - 1) setSelectedCell(prev => ({ ...prev, col: prev.col + 1 }));
        }
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedCell.row > 0) setSelectedCell(prev => ({ ...prev, row: prev.row - 1 }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectedCell.row < filteredStudents.length - 1) setSelectedCell(prev => ({ ...prev, row: prev.row + 1 }));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (selectedCell.col > 0) setSelectedCell(prev => ({ ...prev, col: prev.col - 1 }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (selectedCell.col < subjects.length - 1) setSelectedCell(prev => ({ ...prev, col: prev.col + 1 }));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(true);
      setActiveCellEditVal(String(activeVal));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (selectedCell.col > 0) setSelectedCell(prev => ({ ...prev, col: prev.col - 1 }));
      } else {
        if (selectedCell.col < subjects.length - 1) setSelectedCell(prev => ({ ...prev, col: prev.col + 1 }));
      }
    } else if (/^[0-9.]$/.test(e.key)) {
      // Start typing directly into active cell
      setIsEditing(true);
      setActiveCellEditVal(e.key);
    }
  };

  const handleCellSave = (studentId, subjectId, val) => {
    let num = parseFloat(val);
    const sub = subjects.find(s => s.id === subjectId);
    const max = sub?.max || 100;

    if (val === '' || isNaN(num)) {
      onUpdateScore(currentMonth.id, studentId, subjectId, null);
    } else {
      if (num < 0) num = 0;
      if (num > max) num = max;
      onUpdateScore(currentMonth.id, studentId, subjectId, num);
    }
    setIsEditing(false);
  };

  // Copy Full Table to Clipboard
  const handleCopyFullTable = async () => {
    const success = await copyTableToClipboard(students, subjects, currentMonth, monthGrades, rankings);
    if (success) {
      setCopiedType('table');
      setNotification('បានចម្លងតារាងទាំងមូលទៅ Clipboard! លោកគ្រូអ្នកគ្រូអាចបើក Microsoft Excel ហើយចុច Ctrl + V បានភ្លាមៗ។');
      setTimeout(() => {
        setCopiedType(null);
        setNotification('');
      }, 5000);
    }
  };

  // Copy Only Scores to Clipboard
  const handleCopyScoresOnly = async () => {
    const success = await copyScoresToClipboard(students, subjects, monthGrades);
    if (success) {
      setCopiedType('scores');
      setNotification('បានចម្លងជួរឈរពិន្ទុគ្រប់មុខវិជ្ជាទៅ Clipboard រួចរាល់!');
      setTimeout(() => {
        setCopiedType(null);
        setNotification('');
      }, 4000);
    }
  };

  // Generate Sample Demo Scores
  const handleGenerateSampleScores = () => {
    const newGrades = { ...monthGrades };
    students.forEach((s, idx) => {
      newGrades[s.id] = newGrades[s.id] || {};
      const baseRatio = (idx % 6 === 0) ? 0.45 : (idx < 5 ? 0.92 : 0.70);
      subjects.forEach(sub => {
        const val = Math.round((sub.max * (baseRatio + (Math.random() * 0.18 - 0.08))) * 10) / 10;
        newGrades[s.id][sub.id] = Math.min(sub.max, Math.max(10, val));
      });
    });
    onBatchUpdateScores(currentMonth.id, newGrades);
    setNotification('បានបំពេញពិន្ទុគំរូដោយជោគជ័យ!');
    setTimeout(() => setNotification(''), 3000);
  };

  // Clear scores
  const handleClearScores = () => {
    if (window.confirm(`តើអ្នកពិតជាចង់សម្អាតពិន្ទុក្នុង "${currentMonth.name}" មែនទេ?`)) {
      onBatchUpdateScores(currentMonth.id, {});
      setNotification('បានសម្អាតពិន្ទុប្រចាំខែនេះរួចរាល់!');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // File Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      importFromExcelFile(
        file,
        (importedStudents) => {
          onImportStudents(importedStudents);
          setNotification(`បាននាំចូលសិស្សចំនួន ${toKhmerNum(importedStudents.length)} នាក់ពី Excel ដោយជោគជ័យ!`);
          setTimeout(() => setNotification(''), 4000);
        },
        (err) => {
          alert('កំហុស៖ ' + err);
        }
      );
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & School Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  តារាងស្រង់ពិន្ទុអេឡិចត្រូនិក (MoEYS Gradebook &amp; Spreadsheet)
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ស្តង់ដាគំរូ MoEYS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {info.schoolName} • ថ្នាក់ {info.gradeLevel} "{info.classSection}" • គ្រូបន្ទុកថ្នាក់៖ <strong className="text-slate-700">{info.teacherName}</strong>
              </p>
            </div>
          </div>

          {/* Month / Semester Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'monthly' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ពិន្ទុប្រចាំខែ
              </button>
              <button
                onClick={() => setViewMode('sem1')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'sem1' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                សរុបឆមាសទី ១
              </button>
              <button
                onClick={() => setViewMode('sem2')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'sem2' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                សរុបឆមាសទី ២
              </button>
              <button
                onClick={() => setViewMode('annual')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'annual' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                លទ្ធផលប្រចាំឆ្នាំ
              </button>
            </div>
          </div>
        </div>

        {/* Month Selector Tabs when in 'monthly' mode */}
        {viewMode === 'monthly' && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap mr-1">ខែសិក្សា៖</span>
            {months.map(m => (
              <button
                key={m.id}
                onClick={() => onSelectMonth(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  currentMonth.id === m.id
                    ? 'bg-blue-600 text-white shadow-sm font-bold ring-2 ring-blue-400/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        {/* Quick Stats Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[11px] text-slate-500 block">សិស្សសរុប</span>
            <div className="text-base font-bold text-slate-800 font-mono">
              {toKhmerNum(statsSummary.total)} នាក់ <span className="text-xs font-normal text-slate-500">(ស្រី {toKhmerNum(statsSummary.female)})</span>
            </div>
          </div>
          <div className="bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-100">
            <span className="text-[11px] text-emerald-700 block">សិស្សជាប់ (≥ ៥០%)</span>
            <div className="text-base font-bold text-emerald-800 font-mono">
              {toKhmerNum(statsSummary.passed)} នាក់ <span className="text-xs font-normal text-emerald-600">({toKhmerNum(statsSummary.passRate)}%)</span>
            </div>
          </div>
          <div className="bg-red-50/70 rounded-xl p-2.5 border border-red-100">
            <span className="text-[11px] text-red-700 block">សិស្សរៀនយឺត</span>
            <div className="text-base font-bold text-red-800 font-mono">
              {toKhmerNum(statsSummary.total - statsSummary.passed)} នាក់
            </div>
          </div>
          <div className="bg-blue-50/70 rounded-xl p-2.5 border border-blue-100">
            <span className="text-[11px] text-blue-700 block">មធ្យមភាគថ្នាក់ (៥០)</span>
            <div className="text-base font-bold text-blue-800 font-mono">
              {toKhmerNum(statsSummary.classAvg)} / ៥០
            </div>
          </div>
          <div className="bg-amber-50/70 rounded-xl p-2.5 border border-amber-100">
            <span className="text-[11px] text-amber-700 block">សិស្សឆ្នើម (A/B)</span>
            <div className="text-base font-bold text-amber-800 font-mono">
              {toKhmerNum(students.filter(s => ['A', 'B'].includes(rankings[s.id]?.gradeLetter)).length)} នាក់
            </div>
          </div>
          <div className="bg-purple-50/70 rounded-xl p-2.5 border border-purple-100">
            <span className="text-[11px] text-purple-700 block">ស្ថានភាព</span>
            <div className="text-xs font-semibold text-purple-800 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 inline" />
              គណនាស្វ័យប្រវត្តិ
            </div>
          </div>
        </div>
      </div>

      {/* Excel Formula Bar & Advanced Copy/Paste Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3.5 space-y-3">
        
        {/* Real Excel Formula Bar */}
        {viewMode === 'monthly' && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1 font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-inner min-w-[70px] justify-center">
              <span>R{selectedCell.row + 1}C{selectedCell.col + 1}</span>
            </div>
            <div className="font-serif italic font-bold text-slate-400 select-none px-1">
              fx
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              {activeStudent && activeSubject ? (
                <span className="text-xs text-slate-600 truncate">
                  <span className="font-semibold text-blue-700">{activeStudent.name}</span> &gt;{' '}
                  <span className="font-medium text-slate-800">{activeSubject.name}</span> (អតិបរមា: {activeSubject.max}, មេគុណ: {activeSubject.coef}) ={' '}
                  <span className="font-mono font-bold text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded">
                    {activeVal !== '' ? activeVal : 'ទទេ'}
                  </span>
                </span>
              ) : (
                <span className="text-slate-400">ជ្រើសរើសប្រអប់ដើម្បីកែប្រែ ឬបិទភ្ជាប់</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 hidden md:block">
              គន្លឹះ៖ ចុចលើប្រអប់ រួចចុច <strong>Ctrl + V</strong> ដើម្បីបិទភ្ជាប់ពី Excel ភ្លាមៗ
            </div>
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
              {[
                { id: 'all', label: 'ទាំងអស់' },
                { id: 'female', label: 'ស្រី' },
                { id: 'pass', label: 'ជាប់' },
                { id: 'fail', label: 'រៀនយឺត' },
                { id: 'top5', label: 'Top 5' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterType === f.id
                      ? 'bg-white text-blue-700 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>តម្រៀប៖</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="bg-transparent font-medium focus:outline-none text-slate-800"
              >
                <option value="rank">ចំណាត់ថ្នាក់</option>
                <option value="total">ពិន្ទុសរុប</option>
                <option value="name">ឈ្មោះសិស្ស</option>
                <option value="id">អត្តលេខ</option>
              </select>
              <button 
                onClick={() => setSortAsc(!sortAsc)}
                className="px-1 text-blue-600 font-bold hover:bg-slate-200 rounded"
              >
                {sortAsc ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Excel Copy / Paste Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Copy Table to Excel Button */}
            <button
              onClick={handleCopyFullTable}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
              title="ចម្លងតារាងទាំងអស់ដើម្បីបិទភ្ជាប់ក្នុង Excel (Ctrl+C)"
            >
              {copiedType === 'table' ? <Check className="w-3.5 h-3.5 text-blue-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'table' ? 'បានចម្លង!' : 'ចម្លងទៅ Excel'}</span>
            </button>

            {/* Copy Scores Only */}
            <button
              onClick={handleCopyScoresOnly}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              title="ចម្លងតែពិន្ទុសុទ្ធ (Scores only)"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>ចម្លងតែពិន្ទុ</span>
            </button>

            {/* Paste from Excel Assistant Modal */}
            <button
              onClick={onOpenPasteModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
              title="ជំនួយការបិទភ្ជាប់ពិន្ទុពី Excel"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>បិទភ្ជាប់ពី Excel</span>
            </button>

            {/* Generate Sample Scores */}
            <button
              onClick={handleGenerateSampleScores}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
              title="បំពេញពិន្ទុគំរូ"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">បំពេញគំរូ</span>
            </button>

            <button
              onClick={handleClearScores}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="សម្អាតពិន្ទុខែនេះ"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Import from Excel file */}
            <label className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer border border-slate-200 transition">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>នាំចូល</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".xlsx, .xlsm, .xls" 
                className="hidden" 
              />
            </label>

            {/* Export Excel .xlsx file */}
            <button
              onClick={() => exportToMoEYSExcel(info, students, subjects, currentMonth, monthGrades)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900 shadow-sm transition"
              title="ទាញយកជាឯកសារ Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.xlsx</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
              title="បោះពុម្ព"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs px-3.5 py-2 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-150">
            <span className="font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {notification}
            </span>
            <button onClick={() => setNotification('')} className="text-emerald-700 font-bold ml-2 hover:text-emerald-950">&times;</button>
          </div>
        )}
      </div>

      {/* The Spreadsheet Grid Table */}
      <div 
        ref={gridRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPaste={handleGridPaste}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden outline-none focus:ring-2 focus:ring-blue-400"
      >
        <div className="overflow-x-auto max-h-[660px] relative select-none">
          
          {/* 1. Monthly Score Table View */}
          {viewMode === 'monthly' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 sticky top-0 z-30 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="sticky left-0 z-40 bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-b border-slate-200 text-center w-12">
                    ល.រ
                  </th>
                  <th className="sticky left-12 z-40 bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-b border-slate-200 text-center w-20">
                    អត្តលេខ
                  </th>
                  <th className="sticky left-32 z-40 bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-b border-slate-200 min-w-[150px]">
                    គោត្តនាម-នាម
                  </th>
                  <th className="sticky left-[278px] z-40 bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-b border-slate-200 text-center w-14">
                    ភេទ
                  </th>

                  {/* Subject Columns Headers */}
                  {subjects.map((sub, sIdx) => (
                    <th 
                      key={sub.id} 
                      className={`p-2 font-bold text-center border-r border-b border-slate-200 min-w-[85px] transition-colors ${
                        selectedCell.col === sIdx ? 'bg-blue-50 text-blue-900 font-extrabold' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate text-xs">{sub.name}</div>
                      <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                        ពិន្ទុ {sub.max} (x{sub.coef})
                      </div>
                    </th>
                  ))}

                  {/* Computed Columns */}
                  <th className="p-2.5 font-bold text-center border-r border-b border-slate-200 bg-amber-50/80 text-amber-900 min-w-[75px]">
                    ពិន្ទុសរុប
                  </th>
                  <th className="p-2.5 font-bold text-center border-r border-b border-slate-200 bg-blue-50/80 text-blue-900 min-w-[85px]">
                    មធ្យមភាគ
                  </th>
                  <th className="p-2.5 font-bold text-center border-r border-b border-slate-200 bg-indigo-50/80 text-indigo-900 min-w-[75px]">
                    ចំណាត់ថ្នាក់
                  </th>
                  <th className="p-2.5 font-bold text-center border-r border-b border-slate-200 bg-purple-50/80 text-purple-900 min-w-[70px]">
                    និទ្ទេស
                  </th>
                  <th className="p-2.5 font-bold text-center border-b border-slate-200 bg-slate-50 text-slate-800 min-w-[65px]">
                    លទ្ធផល
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={subjects.length + 9} className="text-center py-12 text-slate-400">
                      មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, rIdx) => {
                    const sGrades = monthGrades[student.id] || {};
                    const stats = rankings[student.id] || {};
                    const isCurrentRowActive = selectedCell.row === rIdx;

                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-blue-50/40 transition-colors ${
                          isCurrentRowActive ? 'bg-blue-50/30' : (rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')
                        }`}
                      >
                        {/* Frozen Column 1: Row No */}
                        <td className="sticky left-0 z-20 bg-inherit p-2 text-center text-slate-500 font-mono border-r border-slate-200">
                          {toKhmerNum(student.no)}
                        </td>

                        {/* Frozen Column 2: Student ID */}
                        <td className="sticky left-12 z-20 bg-inherit p-2 text-center font-mono font-medium text-slate-700 border-r border-slate-200">
                          {student.id}
                        </td>

                        {/* Frozen Column 3: Name */}
                        <td className="sticky left-32 z-20 bg-inherit p-2 font-medium text-slate-800 border-r border-slate-200 truncate max-w-[150px]">
                          <div className="flex items-center gap-1.5">
                            {stats.rank && stats.rank <= 3 && (
                              <Award className={`w-3.5 h-3.5 ${
                                stats.rank === 1 ? 'text-amber-500' : stats.rank === 2 ? 'text-slate-400' : 'text-amber-700'
                              }`} />
                            )}
                            <span className="font-semibold">{student.name}</span>
                          </div>
                        </td>

                        {/* Frozen Column 4: Gender */}
                        <td className={`sticky left-[278px] z-20 bg-inherit p-2 text-center border-r border-slate-200 font-medium ${
                          student.gender === 'ស្រី' ? 'text-pink-600' : 'text-slate-700'
                        }`}>
                          {student.gender}
                        </td>

                        {/* Editable Subject Score Cells */}
                        {subjects.map((sub, cIdx) => {
                          const cellVal = sGrades[sub.id];
                          const isCellSelected = selectedCell.row === rIdx && selectedCell.col === cIdx;
                          const numVal = (cellVal !== undefined && cellVal !== null) ? parseFloat(cellVal) : null;
                          const isFailing = numVal !== null && numVal < (sub.max * 0.5);
                          const isHigh = numVal !== null && numVal >= (sub.max * 0.85);

                          return (
                            <td
                              key={sub.id}
                              onClick={() => {
                                setSelectedCell({ row: rIdx, col: cIdx });
                                setIsEditing(false);
                              }}
                              onDoubleClick={() => {
                                setSelectedCell({ row: rIdx, col: cIdx });
                                setIsEditing(true);
                                setActiveCellEditVal(cellVal !== undefined ? String(cellVal) : '');
                              }}
                              className={`p-1.5 text-center font-mono text-xs border-r border-slate-200 cursor-cell transition-all relative ${
                                isCellSelected ? 'excel-cell-active shadow-sm font-bold text-blue-900' : ''
                              } ${
                                !isCellSelected && isFailing ? 'bg-red-50 text-red-700 font-semibold' : ''
                              } ${
                                !isCellSelected && isHigh ? 'bg-emerald-50 text-emerald-800 font-semibold' : ''
                              }`}
                            >
                              {isCellSelected && isEditing ? (
                                <input
                                  autoFocus
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max={sub.max}
                                  value={activeCellEditVal}
                                  onChange={(e) => setActiveCellEditVal(e.target.value)}
                                  onBlur={() => handleCellSave(student.id, sub.id, activeCellEditVal)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellSave(student.id, sub.id, activeCellEditVal);
                                    } else if (e.key === 'Escape') {
                                      setIsEditing(false);
                                    }
                                  }}
                                  className="w-full text-center bg-white border border-blue-600 rounded px-1 py-0.5 font-mono text-xs outline-none shadow-sm"
                                />
                              ) : (
                                <span>{cellVal !== undefined && cellVal !== null ? cellVal : '-'}</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Total */}
                        <td className="p-2 text-center font-mono font-bold text-slate-800 bg-amber-50/40 border-r border-slate-200">
                          {stats.rawTotal || 0}
                        </td>

                        {/* Average */}
                        <td className="p-2 text-center font-mono font-bold text-blue-700 bg-blue-50/40 border-r border-slate-200">
                          {stats.average50?.toFixed(2) || '0.00'}
                        </td>

                        {/* Rank */}
                        <td className="p-2 text-center border-r border-slate-200 bg-indigo-50/40">
                          {stats.rank ? (
                            <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-full text-xs ${
                              stats.rank === 1 ? 'bg-amber-400 text-amber-950 font-extrabold shadow-sm' :
                              stats.rank === 2 ? 'bg-slate-300 text-slate-900' :
                              stats.rank === 3 ? 'bg-amber-200 text-amber-900' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {stats.rank}
                            </span>
                          ) : '-'}
                        </td>

                        {/* Grade */}
                        <td className="p-2 text-center border-r border-slate-200 bg-purple-50/40">
                          <span className={`inline-block font-mono font-bold px-1.5 py-0.5 rounded text-xs border ${stats.gradeColor}`}>
                            {stats.gradeLetter}
                          </span>
                        </td>

                        {/* Result */}
                        <td className="p-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            stats.isPassed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {stats.isPassed ? 'ជាប់' : 'ធ្លាក់'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* 2. Semester 1 / Semester 2 Summary View */}
          {(viewMode === 'sem1' || viewMode === 'sem2') && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 sticky top-0 z-30 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-12 border-r border-slate-200">ល.រ</th>
                  <th className="p-2.5 text-center w-20 border-r border-slate-200">អត្តលេខ</th>
                  <th className="p-2.5 min-w-[150px] border-r border-slate-200">គោត្តនាម-នាម</th>
                  <th className="p-2.5 text-center w-14 border-r border-slate-200">ភេទ</th>
                  {months.filter(m => m.semester === (viewMode === 'sem1' ? 1 : 2)).map(m => (
                    <th key={m.id} className="p-2.5 text-center border-r border-slate-200 min-w-[90px]">
                      {m.name}
                    </th>
                  ))}
                  <th className="p-2.5 text-center border-r border-slate-200 bg-blue-50 text-blue-900 font-bold min-w-[90px]">
                    មធ្យមភាគឆមាស (៥០)
                  </th>
                  <th className="p-2.5 text-center border-r border-slate-200 bg-indigo-50 text-indigo-900 font-bold min-w-[80px]">
                    ចំណាត់ថ្នាក់
                  </th>
                  <th className="p-2.5 text-center border-r border-slate-200 bg-purple-50 text-purple-900 font-bold min-w-[70px]">
                    និទ្ទេស
                  </th>
                  <th className="p-2.5 text-center min-w-[70px]">
                    លទ្ធផល
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {(viewMode === 'sem1' ? sem1Results : sem2Results).map((item, idx) => {
                  const s = item.student;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-2 text-center font-mono text-slate-500 border-r border-slate-200">{toKhmerNum(idx + 1)}</td>
                      <td className="p-2 text-center font-mono text-slate-700 border-r border-slate-200">{s.id}</td>
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-200">{s.name}</td>
                      <td className={`p-2 text-center border-r border-slate-200 ${s.gender === 'ស្រី' ? 'text-pink-600' : 'text-blue-600'}`}>{s.gender}</td>
                      {item.monthlyAvgs.map(m => (
                        <td key={m.monthId} className="p-2 text-center font-mono border-r border-slate-200">
                          {m.average50?.toFixed(2) || '-'}
                        </td>
                      ))}
                      <td className="p-2 text-center font-mono font-bold text-blue-700 bg-blue-50/50 border-r border-slate-200">
                        {item.semAvg50?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200 font-bold">
                        {item.rank}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded text-xs bg-slate-100">
                          {item.gradeLetter}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isPassed ? 'ជាប់' : 'ធ្លាក់'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* 3. Annual Overall Results View */}
          {viewMode === 'annual' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 sticky top-0 z-30 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-12 border-r border-slate-200">ល.រ</th>
                  <th className="p-2.5 text-center w-20 border-r border-slate-200">អត្តលេខ</th>
                  <th className="p-2.5 min-w-[150px] border-r border-slate-200">គោត្តនាម-នាម</th>
                  <th className="p-2.5 text-center w-14 border-r border-slate-200">ភេទ</th>
                  <th className="p-2.5 text-center border-r border-slate-200 min-w-[100px]">ម.ភាគ ឆមាសទី ១</th>
                  <th className="p-2.5 text-center border-r border-slate-200 min-w-[100px]">ម.ភាគ ឆមាសទី ២</th>
                  <th className="p-2.5 text-center border-r border-slate-200 bg-amber-50 text-amber-900 font-bold min-w-[110px]">
                    មធ្យមភាគប្រចាំឆ្នាំ
                  </th>
                  <th className="p-2.5 text-center border-r border-slate-200 bg-indigo-50 text-indigo-900 font-bold min-w-[80px]">
                    ចំណាត់ថ្នាក់
                  </th>
                  <th className="p-2.5 text-center border-r border-slate-200 bg-purple-50 text-purple-900 font-bold min-w-[70px]">
                    និទ្ទេស
                  </th>
                  <th className="p-2.5 text-center font-bold min-w-[90px] bg-emerald-50 text-emerald-950">
                    ការសម្រេច (MoEYS)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {annualResults.map((item, idx) => {
                  const s = item.student;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-2 text-center font-mono text-slate-500 border-r border-slate-200">{toKhmerNum(idx + 1)}</td>
                      <td className="p-2 text-center font-mono text-slate-700 border-r border-slate-200">{s.id}</td>
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-200">{s.name}</td>
                      <td className={`p-2 text-center border-r border-slate-200 ${s.gender === 'ស្រី' ? 'text-pink-600' : 'text-blue-600'}`}>{s.gender}</td>
                      <td className="p-2 text-center font-mono border-r border-slate-200">{item.sem1Avg50?.toFixed(2) || '0.00'}</td>
                      <td className="p-2 text-center font-mono border-r border-slate-200">{item.sem2Avg50?.toFixed(2) || '0.00'}</td>
                      <td className="p-2 text-center font-mono font-bold text-amber-800 bg-amber-50/50 border-r border-slate-200">
                        {item.annualAvg50?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200 font-bold">
                        {item.rank}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded text-xs bg-slate-100">
                          {item.gradeLetter}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.decision === 'ឡើងថ្នាក់'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {item.decision}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

        </div>

        {/* Bottom Status Bar like Excel */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">ស្ថានភាព៖ សន្លឹកកិច្ចការរួចរាល់ (Ready)</span>
            <span>• បង្ហាញសិស្ស {toKhmerNum(filteredStudents.length)} / {toKhmerNum(students.length)} នាក់</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>ពិន្ទុមធ្យមថ្នាក់៖ <strong className="text-blue-700">{toKhmerNum(statsSummary.classAvg)}</strong>/៥០</span>
            <span>អត្រាជាប់៖ <strong className="text-emerald-700">{toKhmerNum(statsSummary.passRate)}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
