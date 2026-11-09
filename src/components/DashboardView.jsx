import React from 'react';
import { 
  Users, 
  Award, 
  UserCheck, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Sparkles, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  HeartHandshake, 
  GraduationCap,
  ClipboardPaste,
  PhoneCall,
  FolderGit2,
  Landmark
} from 'lucide-react';
import { calculateRankings, toKhmerNum } from '../utils/gradeCalculations';
import { exportToMoEYSExcel } from '../utils/excelHandler';

export default function DashboardView({
  info,
  students,
  subjects,
  currentMonth,
  months,
  grades,
  onNavigateTab,
  onOpenPasteModal,
  onOpenCertificateModal,
  onOpenStudentModal,
  onOpenGitHubSync,
  attendanceRecords = {}
}) {
  const monthGrades = grades[currentMonth.id] || {};
  const rankings = calculateRankings(students, monthGrades, subjects);

  // Statistics
  const totalStudents = students.length;
  const femaleCount = students.filter(s => s.gender === 'ស្រី').length;
  const poorCount = students.filter(s => s.poor).length;
  const scholarshipCount = students.filter(s => s.scholarship).length;
  const orphanCount = students.filter(s => s.orphan).length;

  let passedCount = 0;
  let passedFemaleCount = 0;
  let sumAvg = 0;
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

  students.forEach(s => {
    const st = rankings[s.id];
    if (st) {
      if (st.isPassed) {
        passedCount++;
        if (s.gender === 'ស្រី') passedFemaleCount++;
      }
      sumAvg += st.average50 || 0;
      if (gradeCounts[st.gradeLetter] !== undefined) {
        gradeCounts[st.gradeLetter]++;
      }
    }
  });

  const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;
  const classAvg = totalStudents > 0 ? (sumAvg / totalStudents).toFixed(2) : 0;
  const slowLearnerCount = totalStudents - passedCount;

  // Top 5 Students
  const topStudents = Object.keys(rankings)
    .map(id => ({ student: students.find(s => s.id === id), stats: rankings[id] }))
    .filter(item => item.student && item.stats.rank <= 5)
    .sort((a, b) => a.stats.rank - b.stats.rank);

  // At-Risk & Slow Learners for Remedial Watchlist
  const slowLearners = Object.keys(rankings)
    .map(id => {
      const student = students.find(s => s.id === id);
      const stats = rankings[id];
      const sGrades = monthGrades[id] || {};
      const weakSubs = subjects.filter(sub => {
        const val = sGrades[sub.id];
        return val !== undefined && val !== null && val < (sub.max * 0.5);
      });
      return { student, stats, weakSubs };
    })
    .filter(item => item.student && item.stats && (item.stats.isSlowLearner || item.weakSubs.length >= 2))
    .sort((a, b) => (a.stats.average50 || 0) - (b.stats.average50 || 0))
    .slice(0, 5);

  // Subject Averages
  const subjectAverages = subjects.slice(0, 6).map(sub => {
    let sum = 0;
    let count = 0;
    students.forEach(s => {
      const val = monthGrades[s.id]?.[sub.id];
      if (val !== undefined && val !== null) {
        sum += parseFloat(val);
        count++;
      }
    });
    const avg = count > 0 ? (sum / count).toFixed(1) : 0;
    const pct = sub.max > 0 ? Math.round((avg / sub.max) * 100) : 0;
    return { ...sub, avg, pct };
  });

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background graphics */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                <span>ស្តង់ដាសាលារៀនគំរូ MoEYS</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/20">
                ឆ្នាំសិក្សា {info.schoolYear}
              </span>
              <span className="text-xs text-slate-300">
                {info.province} • {info.district}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-moul tracking-wide text-white">
              {info.schoolName}
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              ប្រព័ន្ធគ្រប់គ្រងបន្ទុកថ្នាក់រៀនកម្រិតវិទ្យាល័យ/អនុវិទ្យាល័យ ថ្នាក់ទី <strong className="text-amber-300">{info.gradeLevel} "{info.classSection}"</strong> • គ្រូបន្ទុកថ្នាក់៖ <strong className="text-white">{info.teacherName}</strong> ({info.teacherPhone})
            </p>
          </div>

          {/* Quick Action Buttons inside Hero */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('classroom')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <Landmark className="w-4 h-4" />
              <span>ការងារបន្ទុកថ្នាក់</span>
            </button>

            {onOpenGitHubSync && (
              <button
                onClick={onOpenGitHubSync}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 shadow-md transition transform hover:-translate-y-0.5"
              >
                <FolderGit2 className="w-4 h-4 text-emerald-400" />
                <span>GitHub Database</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('excel')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/30 transition transform hover:-translate-y-0.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>តារាងស្រង់ពិន្ទុ</span>
            </button>

            <button
              onClick={() => onNavigateTab('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/30 transition transform hover:-translate-y-0.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>កត់វត្តមានថ្ងៃនេះ</span>
            </button>

            <button
              onClick={onOpenCertificateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/30 transition transform hover:-translate-y-0.5"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>ប័ណ្ណសរសើរ Top 5</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Total Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">សិស្សសរុប</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {toKhmerNum(totalStudents)} <span className="text-xs font-medium text-slate-500">នាក់</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ស្រី <strong className="text-pink-600 font-mono">{toKhmerNum(femaleCount)}</strong> • ប្រុស <strong className="text-blue-600 font-mono">{toKhmerNum(totalStudents - femaleCount)}</strong>
          </p>
        </div>

        {/* Metric 2: Pass Rate */}
        <div 
          onClick={() => onNavigateTab('excel')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer hover:border-emerald-300"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">អត្រាជាប់</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">
            {toKhmerNum(passRate)}%
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
            {passRate >= 60 ? '✓ លើសស្តង់ដា (≥៦០%)' : '⚠ ក្រោមស្តង់ដា'}
          </p>
        </div>

        {/* Metric 3: Class Average */}
        <div 
          onClick={() => onNavigateTab('excel')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer hover:border-indigo-300"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">មធ្យមភាគថ្នាក់</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 font-mono">
            {toKhmerNum(classAvg)} <span className="text-xs font-normal text-slate-400">/ ៥០</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ស្មើនឹង <strong className="text-indigo-900 font-mono">{toKhmerNum(((classAvg / 50) * 10).toFixed(2))}</strong> / ១០
          </p>
        </div>

        {/* Metric 4: Slow Learners (Remedial) */}
        <div 
          onClick={() => onNavigateTab('honor')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer hover:border-red-300"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">សិស្សរៀនយឺត</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 font-mono">
            {toKhmerNum(slowLearnerCount)} <span className="text-xs font-medium text-slate-500">នាក់</span>
          </div>
          <p className="text-[11px] text-red-700 mt-1 font-medium">
            ត្រូវការបំប៉នជាប្រចាំ
          </p>
        </div>

        {/* Metric 5: Model School Standards */}
        <div 
          onClick={() => onNavigateTab('standards')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer hover:border-amber-300"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">ស្តង់ដាគំរូ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">
            ៥ ផ្កាយ
          </div>
          <p className="text-[11px] text-amber-800 mt-1 font-semibold">
            សម្រេចបាន ៨៨% នៃសូចនាករ
          </p>
        </div>

        {/* Metric 6: Vulnerable Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer hover:border-purple-300"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">សិស្សងាយរងគ្រោះ</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-700 font-mono">
            {toKhmerNum(poorCount + scholarshipCount + orphanCount)} <span className="text-xs font-medium text-slate-500">នាក់</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ក្រីក្រ {toKhmerNum(poorCount)} • អាហារូបករណ៍ {toKhmerNum(scholarshipCount)}
          </p>
        </div>
      </div>

      {/* Main Grid: Grade Distribution & Core Subject Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Academic Analysis */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Grade Distribution Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  ការបែងចែកនិទ្ទេសសិស្ស (Grade Distribution)
                </h3>
                <p className="text-xs text-slate-500">
                  ប្រចាំ {currentMonth.name} • សរុបសិស្ស {toKhmerNum(totalStudents)} នាក់
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                ស្តង់ដា MoEYS A-F
              </span>
            </div>

            {/* Bars for A, B, C, D, E, F */}
            <div className="space-y-3">
              {[
                { label: 'A', name: 'ល្អប្រសើរ (≥ ៨៥%)', count: gradeCounts.A, color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                { label: 'B', name: 'ល្អណាស់ (៧៥% - ៨៤%)', count: gradeCounts.B, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
                { label: 'C', name: 'ល្អ (៦៥% - ៧៤%)', count: gradeCounts.C, color: 'bg-teal-500', bg: 'bg-teal-50', text: 'text-teal-700' },
                { label: 'D', name: 'ល្អបង្គួរ (៥៥% - ៦៤%)', count: gradeCounts.D, color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
                { label: 'E', name: 'មធ្យម (៥០% - ៥៤%)', count: gradeCounts.E, color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
                { label: 'F', name: 'ធ្លាក់/ខ្សោយ (&lt; ៥០%)', count: gradeCounts.F, color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
              ].map(item => {
                const pct = totalStudents > 0 ? Math.round((item.count / totalStudents) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${item.bg} ${item.text}`}>
                          {item.label}
                        </span>
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <div className="font-mono font-bold text-slate-800">
                        {toKhmerNum(item.count)} នាក់ <span className="font-normal text-slate-400">({toKhmerNum(pct)}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Subject Averages Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  ពិន្ទុមធ្យមតាមមុខវិជ្ជាស្នូល (Subject Performance)
                </h3>
                <p className="text-xs text-slate-500">
                  តាមដានមុខវិជ្ជាដែលសិស្សខ្លាំង និងមុខវិជ្ជាដែលត្រូវការការជួយបន្ថែម
                </p>
              </div>
              <button 
                onClick={() => onNavigateTab('excel')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <span>មើលលម្អិត</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjectAverages.map(sub => (
                <div key={sub.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate">{sub.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Max: {sub.max}</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    {toKhmerNum(sub.avg)} <span className="text-xs font-normal text-slate-400">/ {sub.max}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        sub.pct >= 70 ? 'bg-emerald-500' : (sub.pct >= 50 ? 'bg-blue-500' : 'bg-red-500')
                      }`}
                      style={{ width: `${sub.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Top Achievers & Remedial Watchlist */}
        <div className="space-y-6">
          
          {/* Top 5 Honor Roll Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  តារាងកិត្តិយស (Top 5 Achievers)
                </h3>
              </div>
              <button
                onClick={onOpenCertificateModal}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                ប័ណ្ណសរសើរ
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {topStudents.map((item, idx) => {
                const rank = item.stats.rank;
                return (
                  <div key={item.student.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        rank === 1 ? 'bg-amber-400 text-slate-950 font-black' :
                        rank === 2 ? 'bg-slate-300 text-slate-800' :
                        rank === 3 ? 'bg-amber-200 text-amber-950' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {toKhmerNum(rank)}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{item.student.name}</p>
                        <p className="text-[11px] text-slate-400">អត្តលេខ៖ {item.student.id} • {item.student.gender}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-blue-700 block">
                        {toKhmerNum(item.stats.average50)}/៥០
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        និទ្ទេស {item.stats.gradeLetter}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigateTab('honor')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs text-center transition"
            >
              មើលតារាងកិត្តិយសពេញលេញ &gt;
            </button>
          </div>

          {/* Remedial & At-Risk Watchlist */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  សិស្សត្រូវការបំប៉នបន្ទាន់ ({toKhmerNum(slowLearners.length)})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('honor')}
                className="text-xs text-red-600 font-bold"
              >
                កម្មវិធីបំប៉ន
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              សិស្សដែលមានមធ្យមភាគក្រោម ៥០% ឬខ្សោយលើសពី ២ មុខវិជ្ជា៖
            </p>

            <div className="space-y-2">
              {slowLearners.map(item => (
                <div key={item.student.id} className="p-2.5 rounded-xl bg-red-50/50 border border-red-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{item.student.name}</p>
                    <p className="text-[11px] text-red-600 font-medium">
                      ខ្សោយ៖ {item.weakSubs.map(s => s.name).join(', ') || 'ទូទៅ'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-red-700 block">
                      {toKhmerNum(item.stats?.average50 || 0)}/៥០
                    </span>
                    {item.student.phone && (
                      <a 
                        href={`tel:${item.student.phone}`}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 justify-end"
                      >
                        <PhoneCall className="w-3 h-3 inline" />
                        <span>ទាក់ទង</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('honor')}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-xs text-center transition"
            >
              រៀបចំក្រុមស្វ័យសិក្សា &gt;
            </button>
          </div>

        </div>

      </div>

      {/* Excel Quick Copy / Paste Assistant Highlight Box */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
            <ClipboardPaste className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">
              ចម្លងទិន្នន័យទៅ/ពី Microsoft Excel ដោយស្រួល (One-Click Excel Copy &amp; Paste)
            </h4>
            <p className="text-xs text-emerald-200">
              លោកគ្រូអ្នកគ្រូអាចចម្លងទិន្នន័យទាំងមូលទៅ Excel ឬចម្លងពី Excel មកបិទភ្ជាប់ (Paste) ក្នុងប្រព័ន្ធនេះបានភ្លាមៗ!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPasteModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition"
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>បិទភ្ជាប់ពី Excel</span>
          </button>

          <button
            onClick={() => exportToMoEYSExcel(info, students, subjects, currentMonth, monthGrades)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>ទាញយក Excel (.xlsx)</span>
          </button>
        </div>
      </div>

    </div>
  );
}
