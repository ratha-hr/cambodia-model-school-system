import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  AlertCircle, 
  Calendar, 
  Printer, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Copy, 
  Check, 
  PhoneCall, 
  Sparkles, 
  Grid, 
  List,
  AlertTriangle,
  Download
} from 'lucide-react';
import { toKhmerNum } from '../utils/gradeCalculations';
import * as XLSX from 'xlsx';

export default function AttendanceTracker({
  info,
  students,
  currentMonth,
  attendanceData = {},
  onUpdateAttendance
}) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'matrix'
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Month attendance record: { [day]: { [studentId]: 'present' | 'permission' | 'absent' | 'late' } }
  const monthAttendance = attendanceData[currentMonth.id] || {};

  const currentDayRecords = monthAttendance[selectedDay] || {};

  const handleSetStatus = (studentId, status) => {
    const updatedDay = {
      ...(monthAttendance[selectedDay] || {}),
      [studentId]: status
    };
    onUpdateAttendance(currentMonth.id, selectedDay, updatedDay);
  };

  const handleMarkAllPresent = () => {
    const updated = { ...(monthAttendance[selectedDay] || {}) };
    students.forEach(s => {
      updated[s.id] = 'present';
    });
    onUpdateAttendance(currentMonth.id, selectedDay, updated);
  };

  // Monthly summary per student
  const studentStats = useMemo(() => {
    return students.map(s => {
      let presentCount = 0;
      let permissionCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      for (let d = 1; d <= 26; d++) {
        const st = monthAttendance[d]?.[s.id] || 'present';
        if (st === 'present') presentCount++;
        else if (st === 'permission') permissionCount++;
        else if (st === 'absent') absentCount++;
        else if (st === 'late') lateCount++;
      }

      const totalDays = 26;
      const rate = Math.round((presentCount / totalDays) * 100);
      const hasRisk = absentCount >= 2;

      return {
        student: s,
        presentCount,
        permissionCount,
        absentCount,
        lateCount,
        rate,
        hasRisk
      };
    });
  }, [students, monthAttendance]);

  const filteredStats = useMemo(() => {
    return studentStats.filter(st => 
      st.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.student.id.includes(searchTerm)
    );
  }, [studentStats, searchTerm]);

  const atRiskCount = studentStats.filter(s => s.hasRisk).length;

  // Copy Attendance Matrix to Excel
  const handleCopyAttendanceToExcel = async () => {
    const headers = [
      "ល.រ", "អត្តលេខ", "គោត្តនាម-នាម", "ភេទ",
      ...Array.from({ length: 26 }, (_, i) => `ថ្ងៃទី${i + 1}`),
      "វត្តមាន (P)", "ច្បាប់ (C)", "ឥតច្បាប់ (A)", "យឺត (L)", "អត្រាវត្តមាន (%)"
    ];

    const rows = students.map((s, idx) => {
      const dayStatuses = Array.from({ length: 26 }, (_, i) => {
        const st = monthAttendance[i + 1]?.[s.id] || 'present';
        return st === 'present' ? 'P' : st === 'permission' ? 'C' : st === 'absent' ? 'A' : 'L';
      });

      const stObj = studentStats.find(item => item.student.id === s.id);

      return [
        idx + 1,
        s.id,
        s.name,
        s.gender,
        ...dayStatuses,
        stObj?.presentCount || 0,
        stObj?.permissionCount || 0,
        stObj?.absentCount || 0,
        stObj?.lateCount || 0,
        `${stObj?.rate || 100}%`
      ];
    });

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

  // Export Attendance to Excel file
  const handleExportExcel = () => {
    const headers = [
      "ល.រ", "អត្តលេខ", "គោត្តនាម-នាម", "ភេទ",
      ...Array.from({ length: 26 }, (_, i) => `ថ្ងៃទី${i + 1}`),
      "វត្តមាន", "ច្បាប់", "ឥតច្បាប់", "យឺត", "អត្រាវត្តមាន (%)"
    ];

    const rows = students.map((s, idx) => {
      const dayStatuses = Array.from({ length: 26 }, (_, i) => {
        const st = monthAttendance[i + 1]?.[s.id] || 'present';
        return st === 'present' ? 'P' : st === 'permission' ? 'C' : st === 'absent' ? 'A' : 'L';
      });

      const stObj = studentStats.find(item => item.student.id === s.id);

      return [
        idx + 1,
        s.id,
        s.name,
        s.gender,
        ...dayStatuses,
        stObj?.presentCount || 0,
        stObj?.permissionCount || 0,
        stObj?.absentCount || 0,
        stObj?.lateCount || 0,
        `${stObj?.rate || 100}%`
      ];
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      [`តារាងស្រង់វត្តមានសិស្សប្រចាំ ${currentMonth.name} - ${info.schoolName}`],
      [`ថ្នាក់ ${info.gradeLevel} "${info.classSection}" ឆ្នាំសិក្សា ${info.schoolYear}`],
      [],
      headers,
      ...rows
    ]);
    XLSX.utils.book_append_sheet(wb, ws, `វត្តមាន-${currentMonth.name}`);
    XLSX.writeFile(wb, `វត្តមាន_${currentMonth.name}_${info.classSection}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Attendance Header & Early Warning Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  ការកត់ត្រាវត្តមានសិស្សប្រចាំថ្ងៃ (Daily Attendance Tracking)
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                  ស្តង់ដាគំរូ MoEYS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {info.schoolName} • ថ្នាក់ {info.gradeLevel} "{info.classSection}" • ប្រចាំ <strong className="text-slate-700">{currentMonth.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Daily vs Matrix */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'daily' ? 'bg-white text-teal-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                កត់វត្តមានប្រចាំថ្ងៃ
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'matrix' ? 'bg-white text-teal-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                តារាងវត្តមានប្រចាំខែ (២៦ថ្ងៃ)
              </button>
            </div>

            {/* Copy to Excel */}
            <button
              onClick={handleCopyAttendanceToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition"
              title="ចម្លងតារាងវត្តមានទៅបិទភ្ជាប់ក្នុង Excel"
            >
              {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{copiedNotice ? 'បានចម្លង!' : 'ចម្លងទៅ Excel'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.xlsx</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              title="បោះពុម្ព"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropout Risk Alert Banner (MoEYS Standard Model School) */}
        {atRiskCount > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-900 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>ការប្រកាសអាសន្នទប់ស្កាត់ការបោះបង់ការសិក្សា៖</strong> មានសិស្សចំនួន <strong>{toKhmerNum(atRiskCount)} នាក់</strong> មានអវត្តមានឥតច្បាប់ចាប់ពី ២ថ្ងៃឡើងទៅ។ គ្រូបន្ទុកថ្នាក់គួរទាក់ទងមាតាបិតាជាបន្ទាន់!
              </span>
            </div>
            <span className="text-[11px] font-bold text-red-700 bg-white px-2.5 py-0.5 rounded-full border border-red-200 shadow-sm">
              ស្តង់ដាទី ៤
            </span>
          </div>
        )}
      </div>

      {/* Main Content: Daily Mode vs Matrix Mode */}
      {viewMode === 'daily' ? (
        /* 1. Daily Roll Call View */
        <div className="space-y-4">
          
          {/* Day Selector Strip */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap mr-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>ជ្រើសរើសថ្ងៃ៖</span>
                </span>
                {Array.from({ length: 26 }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center shrink-0 ${
                      selectedDay === day
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Quick Action: Mark All Present */}
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 rounded-xl text-xs font-bold transition shrink-0"
              >
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>វត្តមានទាំងអស់ថ្ងៃទី {toKhmerNum(selectedDay)}</span>
              </button>
            </div>
          </div>

          {/* Daily Student List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះ ឬអត្តលេខ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                ថ្ងៃទី <strong>{toKhmerNum(selectedDay)}</strong> នៃ {currentMonth.name} • សិស្ស {toKhmerNum(filteredStats.length)} នាក់
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredStats.map((item, idx) => {
                const s = item.student;
                const status = currentDayRecords[s.id] || 'present';

                return (
                  <div key={s.id} className="p-3 hover:bg-slate-50/70 transition flex items-center justify-between gap-3 text-xs">
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400 w-6 text-center">{toKhmerNum(idx + 1)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            s.gender === 'ស្រី' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {s.gender}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          អត្តលេខ៖ <span className="font-mono">{s.id}</span> • វត្តមានសរុបខែនេះ៖ <strong className="text-teal-700">{toKhmerNum(item.rate)}%</strong>
                        </p>
                      </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Present */}
                      <button
                        onClick={() => handleSetStatus(s.id, 'present')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1 ${
                          status === 'present'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>វត្តមាន (P)</span>
                      </button>

                      {/* Permission */}
                      <button
                        onClick={() => handleSetStatus(s.id, 'permission')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1 ${
                          status === 'permission'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>ច្បាប់ (C)</span>
                      </button>

                      {/* Late */}
                      <button
                        onClick={() => handleSetStatus(s.id, 'late')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1 ${
                          status === 'late'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>យឺត (L)</span>
                      </button>

                      {/* Absent */}
                      <button
                        onClick={() => handleSetStatus(s.id, 'absent')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1 ${
                          status === 'absent'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ឥតច្បាប់ (A)</span>
                      </button>

                      {/* Quick call if absent */}
                      {status === 'absent' && s.phone && (
                        <a
                          href={`tel:${s.phone}`}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg ml-1"
                          title="ទូរស័ព្ទទៅអាណាព្យាបាល"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* 2. Full Monthly Attendance Matrix View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[620px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-20 border-b border-slate-200">
                <tr>
                  <th className="sticky left-0 z-30 bg-slate-100 p-2 text-center w-10 border-r border-slate-200">ល.រ</th>
                  <th className="sticky left-10 z-30 bg-slate-100 p-2 text-center w-20 border-r border-slate-200">អត្តលេខ</th>
                  <th className="sticky left-30 z-30 bg-slate-100 p-2 min-w-[140px] border-r border-slate-200">គោត្តនាម-នាម</th>
                  <th className="sticky left-[230px] z-30 bg-slate-100 p-2 text-center w-12 border-r border-slate-200">ភេទ</th>

                  {/* 26 Days Columns */}
                  {Array.from({ length: 26 }, (_, i) => i + 1).map(day => (
                    <th key={day} className="p-1.5 text-center font-mono border-r border-slate-200 min-w-[28px] max-w-[32px]">
                      {day}
                    </th>
                  ))}

                  {/* Summary Totals */}
                  <th className="p-2 text-center bg-emerald-50 text-emerald-900 border-r border-slate-200 min-w-[45px]">P</th>
                  <th className="p-2 text-center bg-amber-50 text-amber-900 border-r border-slate-200 min-w-[45px]">C</th>
                  <th className="p-2 text-center bg-red-50 text-red-900 border-r border-slate-200 min-w-[45px]">A</th>
                  <th className="p-2 text-center bg-blue-50 text-blue-900 border-r border-slate-200 min-w-[45px]">L</th>
                  <th className="p-2 text-center bg-teal-50 text-teal-950 font-bold min-w-[70px]">អត្រា (%)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-sans">
                {studentStats.map((item, idx) => {
                  const s = item.student;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="sticky left-0 z-10 bg-white p-1.5 text-center font-mono text-slate-400 border-r border-slate-200">
                        {toKhmerNum(idx + 1)}
                      </td>
                      <td className="sticky left-10 z-10 bg-white p-1.5 text-center font-mono text-slate-700 border-r border-slate-200">
                        {s.id}
                      </td>
                      <td className="sticky left-30 z-10 bg-white p-1.5 font-bold text-slate-900 border-r border-slate-200 truncate max-w-[140px]">
                        {s.name}
                      </td>
                      <td className={`sticky left-[230px] z-10 bg-white p-1.5 text-center font-medium border-r border-slate-200 ${
                        s.gender === 'ស្រី' ? 'text-pink-600' : 'text-blue-600'
                      }`}>
                        {s.gender}
                      </td>

                      {/* 26 Day Statuses */}
                      {Array.from({ length: 26 }, (_, i) => i + 1).map(day => {
                        const st = monthAttendance[day]?.[s.id] || 'present';
                        const code = st === 'present' ? 'P' : st === 'permission' ? 'C' : st === 'absent' ? 'A' : 'L';
                        const color = 
                          st === 'present' ? 'text-slate-400' :
                          st === 'permission' ? 'bg-amber-100 text-amber-800 font-bold' :
                          st === 'absent' ? 'bg-red-100 text-red-700 font-bold' :
                          'bg-blue-100 text-blue-700 font-bold';

                        return (
                          <td 
                            key={day} 
                            onClick={() => {
                              setSelectedDay(day);
                              const next = st === 'present' ? 'permission' : st === 'permission' ? 'absent' : st === 'absent' ? 'late' : 'present';
                              handleSetStatus(s.id, next);
                            }}
                            className={`p-1 text-center font-mono border-r border-slate-200 cursor-pointer hover:bg-teal-50 ${color}`}
                            title={`ថ្ងៃទី ${day}៖ ${st}`}
                          >
                            {code}
                          </td>
                        );
                      })}

                      <td className="p-1.5 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40 border-r border-slate-200">
                        {item.presentCount}
                      </td>
                      <td className="p-1.5 text-center font-mono text-amber-700 bg-amber-50/40 border-r border-slate-200">
                        {item.permissionCount}
                      </td>
                      <td className="p-1.5 text-center font-mono font-bold text-red-700 bg-red-50/40 border-r border-slate-200">
                        {item.absentCount}
                      </td>
                      <td className="p-1.5 text-center font-mono text-blue-700 bg-blue-50/40 border-r border-slate-200">
                        {item.lateCount}
                      </td>
                      <td className="p-1.5 text-center font-mono font-bold text-teal-900 bg-teal-50/40">
                        <span className={`px-1.5 py-0.5 rounded ${
                          item.rate >= 90 ? 'text-emerald-700 font-bold' : (item.rate >= 80 ? 'text-blue-700' : 'text-red-700 bg-red-100 font-black')
                        }`}>
                          {item.rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
