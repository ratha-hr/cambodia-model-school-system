import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  ClipboardPaste, 
  Check, 
  AlertCircle, 
  X, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { parsePastedTSV, toKhmerNum } from '../utils/gradeCalculations';

export default function ExcelPasteModal({
  currentMonth,
  students,
  subjects,
  monthGrades,
  onBatchUpdateScores,
  onClose
}) {
  const [rawText, setRawText] = useState('');
  const [pasteMode, setPasteMode] = useState('grid'); // 'grid' (all subjects), 'single_subject' (1 column), 'smart_match' (with ID/Name)
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [startRowIndex, setStartRowIndex] = useState(0);
  const [startColIndex, setStartColIndex] = useState(0);
  const [hasHeader, setHasHeader] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  // When raw text changes, parse it immediately
  const handleTextChange = (text) => {
    setRawText(text);
    if (!text.trim()) {
      setPreviewData([]);
      setStatusMessage(null);
      return;
    }

    const parsed = parsePastedTSV(text);
    setPreviewData(parsed);

    // Auto-detect if first row looks like a header (contains non-numeric words)
    if (parsed.length > 1) {
      const firstRowHasWords = parsed[0].some(cell => isNaN(parseFloat(cell)) && cell.length > 0);
      const secondRowHasNumbers = parsed[1].some(cell => !isNaN(parseFloat(cell)));
      if (firstRowHasWords && secondRowHasNumbers) {
        setHasHeader(true);
      }
    }
  };

  // Direct paste from system clipboard button
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        handleTextChange(text);
        setStatusMessage({ type: 'success', text: 'បានទទួលទិន្នន័យពី Clipboard ដោយជោគជ័យ!' });
      } else {
        alert('សូមចុចក្នុងប្រអប់អត្ថបទ រួចចុចបញ្ជា Ctrl + V ដើម្បីបិទភ្ជាប់។');
      }
    } catch (e) {
      alert('សូមចុចក្នុងប្រអប់អត្ថបទ រួចចុចបញ្ជា Ctrl + V ដើម្បីបិទភ្ជាប់។');
    }
  };

  // Apply the pasted data to the actual gradebook
  const handleApply = () => {
    if (!previewData.length) {
      alert('មិនទាន់មានទិន្នន័យដើម្បីបញ្ចូលនៅឡើយទេ!');
      return;
    }

    const rowsToProcess = hasHeader ? previewData.slice(1) : previewData;
    const newGrades = { ...monthGrades };
    let updatedCellsCount = 0;

    if (pasteMode === 'single_subject') {
      // Paste 1 column into a specific subject
      const targetSubject = subjects.find(s => s.id === selectedSubjectId);
      const maxScore = targetSubject?.max || 100;

      rowsToProcess.forEach((row, rIdx) => {
        const studentIndex = startRowIndex + rIdx;
        if (studentIndex < students.length) {
          const student = students[studentIndex];
          const rawVal = row[0]; // first column of row
          if (rawVal !== undefined && rawVal !== null && rawVal.trim() !== '') {
            let num = parseFloat(rawVal.replace(/[^0-9.]/g, ''));
            if (!isNaN(num)) {
              num = Math.min(maxScore, Math.max(0, num));
              newGrades[student.id] = newGrades[student.id] || {};
              newGrades[student.id][selectedSubjectId] = num;
              updatedCellsCount++;
            }
          }
        }
      });
    } else if (pasteMode === 'grid') {
      // Paste matrix starting at startRowIndex and startColIndex
      rowsToProcess.forEach((row, rIdx) => {
        const studentIndex = startRowIndex + rIdx;
        if (studentIndex < students.length) {
          const student = students[studentIndex];
          newGrades[student.id] = newGrades[student.id] || {};

          row.forEach((cellVal, cIdx) => {
            const subjectIndex = startColIndex + cIdx;
            if (subjectIndex < subjects.length) {
              const targetSubject = subjects[subjectIndex];
              const maxScore = targetSubject.max;

              if (cellVal !== undefined && cellVal !== null && cellVal.trim() !== '') {
                let num = parseFloat(cellVal.replace(/[^0-9.]/g, ''));
                if (!isNaN(num)) {
                  num = Math.min(maxScore, Math.max(0, num));
                  newGrades[student.id][targetSubject.id] = num;
                  updatedCellsCount++;
                }
              }
            }
          });
        }
      });
    } else if (pasteMode === 'smart_match') {
      // Smart Match: Check if row contains Student ID or Name in column 0 or 1
      rowsToProcess.forEach(row => {
        if (!row || row.length < 2) return;
        const candidateIdOrName = (row[0] || '').trim();
        const candidateName2 = (row[1] || '').trim();

        const student = students.find(s => 
          s.id === candidateIdOrName || 
          s.name === candidateIdOrName || 
          s.name === candidateName2 ||
          s.id === candidateName2
        );

        if (student) {
          newGrades[student.id] = newGrades[student.id] || {};
          // Scores usually start from col 2 or col 4
          const scoreColumns = row.slice(row.length >= subjects.length + 2 ? 2 : 1);
          scoreColumns.forEach((val, cIdx) => {
            if (cIdx < subjects.length) {
              const targetSubject = subjects[cIdx];
              let num = parseFloat((val || '').replace(/[^0-9.]/g, ''));
              if (!isNaN(num)) {
                num = Math.min(targetSubject.max, Math.max(0, num));
                newGrades[student.id][targetSubject.id] = num;
                updatedCellsCount++;
              }
            }
          });
        }
      });
    }

    onBatchUpdateScores(currentMonth.id, newGrades);
    alert(`បានបញ្ចូលពិន្ទុចំនួន ${toKhmerNum(updatedCellsCount)} ប្រអប់ដោយជោគជ័យ!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <ClipboardPaste className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  ជំនួយការបិទភ្ជាប់ទិន្នន័យពី Excel (Excel Paste Assistant)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  {currentMonth.name}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                ចម្លងពី Microsoft Excel ឬ Google Sheets (Ctrl+C) ហើយបិទភ្ជាប់ (Ctrl+V) នៅទីនេះបានយ៉ាងរហ័ស
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Instructions Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-700">
              <p className="font-semibold text-blue-900">
                របៀបប្រើប្រាស់ងាយស្រួល ៣ ជំហាន៖
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>បើកឯកសារ Excel របស់លោកគ្រូអ្នកគ្រូ រួចជ្រើសរើស (Highlight) ពិន្ទុដែលចង់ចម្លង ហើយចុច <strong className="text-slate-800">Ctrl + C</strong></li>
                <li>ត្រឡប់មកទីនេះ ចុចប៊ូតុង <strong className="text-emerald-700">«បិទភ្ជាប់ពី Clipboard»</strong> ឬចុចក្នុងប្រអប់ខាងក្រោមហើយចុច <strong className="text-slate-800">Ctrl + V</strong></li>
                <li>ពិនិត្យមើលតារាងគំរូខាងក្រោម រួចចុច <strong className="text-emerald-700">«បញ្ចូលទិន្នន័យទៅក្នុងតារាង»</strong> ជាការស្រេច!</li>
              </ol>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block text-xs">
              ទម្រង់នៃការបិទភ្ជាប់ (Paste Mode)៖
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPasteMode('grid')}
                className={`p-3 rounded-xl border text-left transition ${
                  pasteMode === 'grid'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>១. បិទភ្ជាប់តារាងគ្រប់មុខវិជ្ជា</span>
                  {pasteMode === 'grid' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">
                  បិទភ្ជាប់ជួរដេក និងជួរឈរជាច្រើនមុខវិជ្ជាស្របគ្នាតែម្តង
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPasteMode('single_subject')}
                className={`p-3 rounded-xl border text-left transition ${
                  pasteMode === 'single_subject'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>២. បិទភ្ជាប់ ១ មុខវិជ្ជាជាក់លាក់</span>
                  {pasteMode === 'single_subject' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">
                  បិទភ្ជាប់តែ ១ ជួរឈរពិន្ទុសម្រាប់មុខវិជ្ជាណាមួយ
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPasteMode('smart_match')}
                className={`p-3 rounded-xl border text-left transition ${
                  pasteMode === 'smart_match'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>៣. ផ្គូផ្គងស្វ័យប្រវត្តិតាមឈ្មោះ/អត្តលេខ</span>
                  {pasteMode === 'smart_match' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">
                  ឆ្លាតវៃ៖ ស្វែងរកឈ្មោះ ឬអត្តលេខសិស្សដោយស្វ័យប្រវត្តិ
                </p>
              </button>
            </div>
          </div>

          {/* Additional Options based on mode */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {pasteMode === 'single_subject' && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">មុខវិជ្ជាគោលដៅ៖</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (ពិន្ទុពេញ {s.max})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {pasteMode === 'grid' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">ចាប់ផ្តើមពីមុខវិជ្ជា៖</span>
                  <select
                    value={startColIndex}
                    onChange={(e) => setStartColIndex(parseInt(e.target.value, 10))}
                    className="px-2 py-1 rounded-lg border border-slate-300 bg-white"
                  >
                    {subjects.map((s, idx) => (
                      <option key={s.id} value={idx}>{idx + 1}. {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">ចាប់ផ្តើមពីសិស្ស៖</span>
              <select
                value={startRowIndex}
                onChange={(e) => setStartRowIndex(parseInt(e.target.value, 10))}
                className="px-2 py-1 rounded-lg border border-slate-300 bg-white"
              >
                {students.map((s, idx) => (
                  <option key={s.id} value={idx}>ល.រ {idx + 1}: {s.name}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer ml-auto font-medium text-slate-700">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>ជួរទី ១ ជាចំណងជើង (រំលងកុំបញ្ចូលជាពិន្ទុ)</span>
            </label>
          </div>

          {/* Paste Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs">
                ប្រអប់បិទភ្ជាប់ទិន្នន័យ (Paste Box)៖
              </label>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg text-xs font-semibold transition"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-700" />
                <span>បិទភ្ជាប់ពី Clipboard ភ្លាមៗ</span>
              </button>
            </div>
            
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="ចុចទីនេះ ហើយចុចបញ្ជា Ctrl + V ដើម្បីបិទភ្ជាប់ទិន្នន័យដែលបានចម្លងពី Excel..."
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 placeholder:text-slate-400"
            />
          </div>

          {/* Preview of Parsed Data */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    តារាងមើលទិន្នន័យមុននឹងបញ្ចូល (បានរកឃើញ {toKhmerNum(previewData.length)} ជួរដេក និង {toKhmerNum(previewData[0]?.length || 0)} ជួរឈរ)
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {hasHeader ? `ជួរដេកពិន្ទុជាក់ស្តែង៖ ${toKhmerNum(previewData.length - 1)} ជួរ` : ''}
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2 border-r border-slate-200 text-center w-12">#</th>
                      {Array.from({ length: Math.min(10, previewData[0]?.length || 1) }).map((_, colIdx) => (
                        <th key={colIdx} className="p-2 border-r border-slate-200 text-center">
                          {pasteMode === 'single_subject' && colIdx === 0
                            ? subjects.find(s => s.id === selectedSubjectId)?.name || 'ពិន្ទុ'
                            : (pasteMode === 'grid' && subjects[startColIndex + colIdx]
                                ? subjects[startColIndex + colIdx].name
                                : `ជួរឈរ ${colIdx + 1}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {previewData.slice(0, 8).map((row, rIdx) => {
                      const isHeaderRow = hasHeader && rIdx === 0;
                      return (
                        <tr 
                          key={rIdx} 
                          className={isHeaderRow ? 'bg-amber-50/60 font-sans italic text-amber-900' : 'hover:bg-slate-50'}
                        >
                          <td className="p-1.5 text-center text-slate-400 border-r border-slate-200">
                            {isHeaderRow ? 'ចំណងជើង' : rIdx + (hasHeader ? 0 : 1)}
                          </td>
                          {row.slice(0, 10).map((cell, cIdx) => (
                            <td key={cIdx} className="p-1.5 text-center border-r border-slate-200 truncate max-w-[120px]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!previewData.length}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Check className="w-4 h-4" />
            <span>បញ្ចូលទិន្នន័យទៅក្នុងតារាងភ្លាមៗ</span>
          </button>
        </div>

      </div>
    </div>
  );
}
