import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  Shield, 
  Award, 
  Download, 
  Copy, 
  Check, 
  Grid, 
  List, 
  Printer,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { toKhmerNum } from '../utils/gradeCalculations';
import * as XLSX from 'xlsx';

export default function StudentRegistryView({
  info,
  students,
  onSaveStudent,
  onDeleteStudent,
  onOpenEditStudentModal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all'); // all, female, male
  const [specialFilter, setSpecialFilter] = useState('all'); // all, poor, scholarship, orphan, disabled
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.includes(searchTerm) ||
        (s.father && s.father.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.mother && s.mother.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (genderFilter === 'female' && s.gender !== 'ស្រី') return false;
      if (genderFilter === 'male' && s.gender !== 'ប្រុស') return false;

      if (specialFilter === 'poor' && !s.poor) return false;
      if (specialFilter === 'scholarship' && !s.scholarship) return false;
      if (specialFilter === 'orphan' && !s.orphan) return false;
      if (specialFilter === 'disabled' && !s.disabled) return false;

      return true;
    });
  }, [students, searchTerm, genderFilter, specialFilter]);

  // Statistics
  const total = students.length;
  const female = students.filter(s => s.gender === 'ស្រី').length;
  const poor = students.filter(s => s.poor).length;
  const scholarship = students.filter(s => s.scholarship).length;
  const orphan = students.filter(s => s.orphan).length;

  // Copy students to clipboard (Excel TSV)
  const handleCopyStudentsToExcel = async () => {
    const headers = [
      "ល.រ", "អត្តលេខ", "គោត្តនាម-នាម", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", "អាយុ",
      "ទីកន្លែងកំណើត", "អាសយដ្ឋានបច្ចុប្បន្ន", "ឪពុក", "មុខរបរ", "ទូរស័ព្ទឪពុក",
      "ម្តាយ", "មុខរបរ", "ទូរស័ព្ទម្តាយ", "ស្ថានភាពពិសេស", "អាកប្បកិរិយា"
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.id,
      s.name,
      s.gender,
      s.dob,
      s.age,
      s.birthplace,
      s.address,
      s.father,
      s.fatherJob,
      s.fatherPhone,
      s.mother,
      s.motherJob,
      s.motherPhone,
      [s.poor ? 'ក្រីក្រ' : '', s.scholarship ? 'អាហារូបករណ៍' : '', s.orphan ? 'កំព្រា' : ''].filter(Boolean).join(', '),
      s.conduct || 'ល្អ'
    ]);

    const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\r\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tsv);
      } else {
        const ta = document.createElement('textarea');
        ta.value = tsv;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    } catch (e) {
      alert('កំហុសក្នុងការចម្លងទៅ Clipboard');
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = [
      "ល.រ", "អត្តលេខ", "គោត្តនាម-នាម", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", "អាយុ",
      "ទីកន្លែងកំណើត", "អាសយដ្ឋានបច្ចុប្បន្ន", "ឪពុក", "មុខរបរ", "ទូរស័ព្ទឪពុក",
      "ម្តាយ", "មុខរបរ", "ទូរស័ព្ទម្តាយ", "ស្ថានភាពពិសេស", "អាកប្បកិរិយា"
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.id,
      s.name,
      s.gender,
      s.dob,
      s.age,
      s.birthplace,
      s.address,
      s.father,
      s.fatherJob,
      s.fatherPhone,
      s.mother,
      s.motherJob,
      s.motherPhone,
      [s.poor ? 'ក្រីក្រ' : '', s.scholarship ? 'អាហារូបករណ៍' : '', s.orphan ? 'កំព្រា' : ''].filter(Boolean).join(', '),
      s.conduct || 'ល្អ'
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      [`បញ្ជីព័ត៌មានប្រវត្តិរូបសិស្ស - ${info.schoolName}`],
      [`ថ្នាក់ ${info.gradeLevel} "${info.classSection}" ឆ្នាំសិក្សា ${info.schoolYear}`],
      [],
      headers,
      ...rows
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "បញ្ជីសិស្ស");
    XLSX.writeFile(wb, `បញ្ជីសិស្ស_${info.gradeLevel}_${info.classSection}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & School Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  បញ្ជីព័ត៌មានប្រវត្តិរូបសិស្ស (Student Directory &amp; Biodata)
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  ស្តង់ដាគំរូ MoEYS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {info.schoolName} • ថ្នាក់ {info.gradeLevel} "{info.classSection}" • ឆ្នាំសិក្សា {info.schoolYear}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyStudentsToExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition"
              title="ចម្លងបញ្ជីសិស្សទៅបិទភ្ជាប់ក្នុង Excel"
            >
              {copiedNotice ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-600" />}
              <span>{copiedNotice ? 'បានចម្លងរួចរាល់!' : 'ចម្លងទៅ Excel'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>ទាញយក Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => onOpenEditStudentModal(null, true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមសិស្សថ្មី</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Pill Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">សិស្សសរុប</span>
            <span className="font-extrabold text-slate-900 text-base font-mono">{toKhmerNum(total)} នាក់</span>
          </div>
          <div className="bg-pink-50/70 p-2.5 rounded-xl border border-pink-100">
            <span className="text-pink-700 block">សិស្សស្រី</span>
            <span className="font-extrabold text-pink-900 text-base font-mono">{toKhmerNum(female)} នាក់</span>
          </div>
          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
            <span className="text-amber-700 block">សិស្សក្រីក្រ</span>
            <span className="font-extrabold text-amber-900 text-base font-mono">{toKhmerNum(poor)} នាក់</span>
          </div>
          <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
            <span className="text-blue-700 block">អាហារូបករណ៍</span>
            <span className="font-extrabold text-blue-900 text-base font-mono">{toKhmerNum(scholarship)} នាក់</span>
          </div>
          <div className="bg-purple-50/70 p-2.5 rounded-xl border border-purple-100">
            <span className="text-purple-700 block">សិស្សកំព្រា</span>
            <span className="font-extrabold text-purple-900 text-base font-mono">{toKhmerNum(orphan)} នាក់</span>
          </div>
        </div>
      </div>

      {/* Search, Filters and View Toggle Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, ឪពុកម្តាយ, ភូមិ/ឃុំ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {[
              { id: 'all', label: 'ទាំងអស់' },
              { id: 'female', label: 'ស្រី' },
              { id: 'male', label: 'ប្រុស' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setGenderFilter(f.id)}
                className={`px-3 py-1 rounded-lg transition ${
                  genderFilter === f.id
                    ? 'bg-white text-blue-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Special Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            {[
              { id: 'all', label: 'ស្ថានភាពទូទៅ' },
              { id: 'poor', label: 'ក្រីក្រ' },
              { id: 'scholarship', label: 'អាហារូបករណ៍' },
              { id: 'orphan', label: 'កំព្រា' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSpecialFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  specialFilter === f.id
                    ? 'bg-white text-blue-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle: Grid vs Table */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'grid' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="ទិដ្ឋភាពកាត (Cards)"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'table' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="ទិដ្ឋភាពតារាង (Table)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Student Directory Content */}
      {viewMode === 'grid' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
              មិនមានសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between space-y-3 relative overflow-hidden group"
              >
                {/* Card Header with Avatar & Name */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base font-moul shadow-inner ${
                      student.gender === 'ស្រី'
                        ? 'bg-pink-100 text-pink-700 border border-pink-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          student.gender === 'ស្រី' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {student.gender}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        អត្តលេខ៖ <strong>{student.id}</strong> • ល.រ {toKhmerNum(student.no)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditStudentModal(student, false)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="កែប្រែព័ត៌មាន"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`តើអ្នកពិតជាចង់លុបសិស្ស "${student.name}" មែនទេ?`)) {
                          onDeleteStudent(student.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="លុប"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>កើត៖ {student.dob || 'មិនបញ្ជាក់'} ({student.age || 12} ឆ្នាំ)</span>
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate" title={student.address}>
                      {student.address || 'កំពង់ត្រឡាច, កំពង់ឆ្នាំង'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">
                      ឪពុក៖ <strong className="text-slate-700">{student.father || 'មិនបញ្ជាក់'}</strong>
                    </span>
                    <span className="text-slate-500">
                      ម្តាយ៖ <strong className="text-slate-700">{student.mother || 'មិនបញ្ជាក់'}</strong>
                    </span>
                  </div>
                </div>

                {/* Badges & Quick Action */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex flex-wrap items-center gap-1">
                    {student.poor && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        ក្រីក្រ
                      </span>
                    )}
                    {student.scholarship && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                        អាហារូបករណ៍
                      </span>
                    )}
                    {student.orphan && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                        កំព្រា
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      វិន័យ៖ {student.conduct || 'ល្អ'}
                    </span>
                  </div>

                  {student.phone ? (
                    <a
                      href={`tel:${student.phone}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-xs font-semibold transition"
                    >
                      <PhoneCall className="w-3 h-3 text-teal-600" />
                      <span>{student.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">គ្មានលេខ</span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-12 border-r border-slate-200">ល.រ</th>
                  <th className="p-2.5 text-center w-20 border-r border-slate-200">អត្តលេខ</th>
                  <th className="p-2.5 min-w-[150px] border-r border-slate-200">គោត្តនាម-នាម</th>
                  <th className="p-2.5 text-center w-14 border-r border-slate-200">ភេទ</th>
                  <th className="p-2.5 text-center w-24 border-r border-slate-200">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th className="p-2.5 text-center w-16 border-r border-slate-200">អាយុ</th>
                  <th className="p-2.5 min-w-[180px] border-r border-slate-200">អាសយដ្ឋានបច្ចុប្បន្ន</th>
                  <th className="p-2.5 min-w-[120px] border-r border-slate-200">ឪពុក</th>
                  <th className="p-2.5 min-w-[120px] border-r border-slate-200">ម្តាយ</th>
                  <th className="p-2.5 text-center min-w-[110px] border-r border-slate-200">ទូរស័ព្ទ</th>
                  <th className="p-2.5 text-center min-w-[100px] border-r border-slate-200">ស្ថានភាពពិសេស</th>
                  <th className="p-2.5 text-center w-20">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="p-2 text-center font-mono text-slate-500 border-r border-slate-200">
                      {toKhmerNum(idx + 1)}
                    </td>
                    <td className="p-2 text-center font-mono font-medium text-slate-800 border-r border-slate-200">
                      {student.id}
                    </td>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                      {student.name}
                    </td>
                    <td className={`p-2 text-center font-medium border-r border-slate-200 ${
                      student.gender === 'ស្រី' ? 'text-pink-600' : 'text-blue-600'
                    }`}>
                      {student.gender}
                    </td>
                    <td className="p-2 text-center font-mono text-slate-600 border-r border-slate-200">
                      {student.dob || '-'}
                    </td>
                    <td className="p-2 text-center font-mono text-slate-700 border-r border-slate-200">
                      {toKhmerNum(student.age || 12)}
                    </td>
                    <td className="p-2 text-slate-600 border-r border-slate-200 truncate max-w-[200px]" title={student.address}>
                      {student.address || '-'}
                    </td>
                    <td className="p-2 text-slate-700 border-r border-slate-200">
                      {student.father || '-'}
                    </td>
                    <td className="p-2 text-slate-700 border-r border-slate-200">
                      {student.mother || '-'}
                    </td>
                    <td className="p-2 text-center font-mono text-blue-600 border-r border-slate-200">
                      {student.phone ? (
                        <a href={`tel:${student.phone}`} className="hover:underline">
                          {student.phone}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="p-2 text-center border-r border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        {student.poor && <span className="px-1 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800">ក្រ</span>}
                        {student.scholarship && <span className="px-1 py-0.2 rounded text-[10px] bg-blue-100 text-blue-800">អាហារូប</span>}
                        {student.orphan && <span className="px-1 py-0.2 rounded text-[10px] bg-purple-100 text-purple-800">កំព្រា</span>}
                        {!student.poor && !student.scholarship && !student.orphan && <span className="text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenEditStudentModal(student, false)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="កែប្រែ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`តើអ្នកពិតជាចង់លុបសិស្ស "${student.name}" មែនទេ?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="លុប"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
