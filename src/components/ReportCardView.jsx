import React, { useState } from 'react';
import { Printer, ChevronLeft, ChevronRight, User, Award, CheckCircle2, Share2 } from 'lucide-react';
import { calculateRankings, toKhmerNum } from '../utils/gradeCalculations';

export default function ReportCardView({
  info,
  students,
  subjects,
  currentMonth,
  grades
}) {
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
  const [batchPrintMode, setBatchPrintMode] = useState(false);

  const monthGrades = grades[currentMonth.id] || {};
  const rankings = calculateRankings(students, monthGrades, subjects);

  const currentStudent = students[selectedStudentIdx] || students[0];
  const currentStats = rankings[currentStudent?.id] || {};
  const currentGrades = monthGrades[currentStudent?.id] || {};

  const handlePrev = () => {
    setSelectedStudentIdx(prev => (prev > 0 ? prev - 1 : students.length - 1));
  };

  const handleNext = () => {
    setSelectedStudentIdx(prev => (prev < students.length - 1 ? prev + 1 : 0));
  };

  // Render a Single Report Card for a Student
  const renderCard = (student, stats, sGrades, isPrintAll = false) => {
    return (
      <div 
        key={student.id} 
        className={`bg-white border border-slate-300 rounded-xl p-8 max-w-[210mm] mx-auto text-slate-800 shadow-sm ${
          isPrintAll ? 'print-page-break my-6' : ''
        }`}
        style={{ minHeight: '270mm' }}
      >
        {/* Official Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div className="text-center font-bold text-xs space-y-1">
            <p className="text-slate-700">{info.province}</p>
            <p className="text-slate-700">{info.district}</p>
            <p className="font-moul text-blue-900 text-sm mt-1">{info.schoolName}</p>
          </div>

          <div className="text-center space-y-1">
            <h1 className="font-moul text-base text-blue-950">ព្រះរាជាណាចក្រកម្ពុជា</h1>
            <h2 className="font-moul text-sm text-blue-950">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
            <div className="w-24 h-0.5 bg-blue-900 mx-auto mt-1"></div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-4">
          <h3 className="font-moul text-base text-slate-900">
            ព្រឹត្តិបត្រពិន្ទុ និងការតាមដានការសិក្សា
          </h3>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            ប្រចាំ {currentMonth.name} • ឆ្នាំសិក្សា {info.schoolYear}
          </p>
        </div>

        {/* Student Biodata Box */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
          <div>
            <span className="text-slate-500 block">គោត្តនាម-នាម៖</span>
            <strong className="text-sm font-bold text-slate-900">{student.name}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">អត្តលេខសិស្ស៖</span>
            <strong className="font-mono text-slate-800">{student.id}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">ភេទ / អាយុ៖</span>
            <strong className="text-slate-800">{student.gender} • {student.age} ឆ្នាំ</strong>
          </div>
          <div>
            <span className="text-slate-500 block">ថ្នាក់រៀន៖</span>
            <strong className="text-slate-800">{info.gradeLevel} "{info.classSection}"</strong>
          </div>
        </div>

        {/* Subjects & Scores Table */}
        <table className="w-full text-xs border-collapse border border-slate-400 mb-4">
          <thead className="bg-slate-100 font-bold text-slate-800">
            <tr>
              <th className="border border-slate-400 p-2 text-center w-12">ល.រ</th>
              <th className="border border-slate-400 p-2 text-left">មុខវិជ្ជា</th>
              <th className="border border-slate-400 p-2 text-center w-20">ពិន្ទុអតិបរមា</th>
              <th className="border border-slate-400 p-2 text-center w-16">មេគុណ</th>
              <th className="border border-slate-400 p-2 text-center w-24">ពិន្ទុទទួលបាន</th>
              <th className="border border-slate-400 p-2 text-center w-24">ពិន្ទុគុណមេគុណ</th>
              <th className="border border-slate-400 p-2 text-center min-w-[100px]">ការវាយតម្លៃ</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, idx) => {
              const raw = sGrades[sub.id];
              const score = (raw !== undefined && raw !== null && raw !== '') ? parseFloat(raw) : null;
              const weighted = score !== null ? (score * sub.coef).toFixed(1) : '-';
              const isLow = score !== null && score < (sub.max * 0.5);

              return (
                <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{toKhmerNum(idx + 1)}</td>
                  <td className="border border-slate-300 p-1.5 font-medium">{sub.name}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{sub.max}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">x{sub.coef}</td>
                  <td className={`border border-slate-300 p-1.5 text-center font-mono font-bold ${
                    isLow ? 'text-red-600 bg-red-50' : 'text-slate-800'
                  }`}>
                    {score !== null ? score : '-'}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono font-bold text-slate-900">
                    {weighted}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center text-[11px]">
                    {score !== null ? (score >= sub.max * 0.85 ? 'ល្អប្រសើរ' : score >= sub.max * 0.7 ? 'ល្អ' : score >= sub.max * 0.5 ? 'មធ្យម' : 'ខ្សោយ') : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900">
            <tr>
              <td colSpan={4} className="border border-slate-400 p-2 text-right">
                ពិន្ទុសរុប និងមធ្យមភាគ៖
              </td>
              <td className="border border-slate-400 p-2 text-center font-mono font-bold text-sm text-slate-900">
                {stats.rawTotal || 0}
              </td>
              <td className="border border-slate-400 p-2 text-center font-mono font-bold text-sm text-blue-900">
                {stats.weightedTotal || 0}
              </td>
              <td className="border border-slate-400 p-2 text-center font-bold text-blue-800">
                មធ្យមភាគ៖ {stats.average50?.toFixed(2) || '0.00'}/៥០
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Results Summary & Behavioral Evaluation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
            <span className="text-blue-700 block text-[11px]">ចំណាត់ថ្នាក់ក្នុងថ្នាក់</span>
            <div className="text-xl font-bold text-blue-900 font-mono mt-0.5">
              លេខ {toKhmerNum(stats.rank || '-')} <span className="text-xs font-normal">/ {toKhmerNum(students.length)} នាក់</span>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
            <span className="text-emerald-700 block text-[11px]">និទ្ទេស និងលទ្ធផល</span>
            <div className="text-lg font-bold text-emerald-900 mt-0.5">
              និទ្ទេស {stats.gradeLetter} ({stats.isPassed ? 'ជាប់' : 'ធ្លាក់'})
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-center">
            <span className="text-purple-700 block text-[11px]">អាកប្បកិរិយា / វិន័យ</span>
            <div className="text-lg font-bold text-purple-900 mt-0.5">
              {student.conduct || 'ល្អ'}
            </div>
          </div>
        </div>

        {/* Teacher Comments */}
        <div className="border border-slate-300 rounded-lg p-3 text-xs mb-8">
          <strong className="text-slate-800 block mb-1">មតិយោបល់របស់គ្រូបន្ទុកថ្នាក់៖</strong>
          <p className="text-slate-600 italic">
            {stats.isPassed
              ? `សិស្ស ${student.name} មានការខិតខំប្រឹងប្រែងរៀនសូត្របានល្អ មានវិន័យ និងសីលធម៌សមរម្យ។ សូមបន្តការខិតខំប្រឹងប្រែងបន្ថែមទៀត!`
              : `សិស្ស ${student.name} ត្រូវការការយកចិត្តទុកដាក់ពង្រឹងការរៀនសូត្របន្ថែមលើមុខវិជ្ជាខ្សោយ និងចូលរៀនឱ្យបានទៀងទាត់។ សូមមាតាបិតាជួយជំរុញបន្ថែម!`}
          </p>
        </div>

        {/* Signatures Area */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs mt-10">
          <div>
            <p className="font-bold text-slate-800">បានឃើញ និងឯកភាព</p>
            <p className="font-semibold text-slate-700">នាយកសាលា</p>
            <div className="h-20 flex items-end justify-center">
              <span className="text-slate-400 font-mono text-[10px]">(ហត្ថលេខា និងត្រា)</span>
            </div>
            <p className="font-bold text-slate-900 mt-2">{info.principalName}</p>
          </div>

          <div>
            <p className="font-bold text-slate-800">មាតាបិតា ឬអាណាព្យាបាល</p>
            <p className="text-slate-500">បានពិនិត្យត្រឹមត្រូវ</p>
            <div className="h-20 flex items-end justify-center">
              <span className="text-slate-400 font-mono text-[10px]">(ហត្ថលេខា ឬស្នាមមេដៃ)</span>
            </div>
            <p className="text-slate-700 mt-2">{student.father || student.mother || '........................'}</p>
          </div>

          <div>
            <p className="text-slate-500">ធ្វើនៅ {info.location}, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...</p>
            <p className="font-semibold text-slate-700">គ្រូបន្ទុកថ្នាក់</p>
            <div className="h-20 flex items-end justify-center">
              <span className="text-slate-400 font-mono text-[10px]">(ហត្ថលេខា)</span>
            </div>
            <p className="font-bold text-slate-900 mt-2">{info.teacherName}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="no-print bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              ព្រឹត្តិបត្រពិន្ទុផ្លូវការ MoEYS (Student Report Card)
            </h2>
            <p className="text-xs text-slate-500">
              ទម្រង់ស្តង់ដាសាលារៀនគំរូ អាចបោះពុម្ពជាក្រដាស A4 ឬផ្ញើជូនមាតាបិតា
            </p>
          </div>
        </div>

        {/* Student Navigation & Print Actions */}
        <div className="flex items-center gap-2">
          {!batchPrintMode && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={handlePrev}
                className="p-1 hover:bg-white rounded text-slate-600"
                title="សិស្សមុន"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={selectedStudentIdx}
                onChange={(e) => setSelectedStudentIdx(parseInt(e.target.value))}
                className="bg-transparent font-medium text-xs px-2 py-0.5 focus:outline-none"
              >
                {students.map((s, idx) => (
                  <option key={s.id} value={idx}>
                    {idx + 1}. {s.name} ({s.gender})
                  </option>
                ))}
              </select>
              <button
                onClick={handleNext}
                className="p-1 hover:bg-white rounded text-slate-600"
                title="សិស្សបន្ទាប់"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => setBatchPrintMode(!batchPrintMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              batchPrintMode ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {batchPrintMode ? 'បង្ហាញតែម្នាក់' : `បោះពុម្ពទាំងអស់ (${students.length}នាក់)`}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ព A4</span>
          </button>
        </div>
      </div>

      {/* Report Cards Rendering */}
      {batchPrintMode ? (
        <div className="space-y-6">
          {students.map((student) => {
            const stats = rankings[student.id] || {};
            const sGrades = monthGrades[student.id] || {};
            return renderCard(student, stats, sGrades, true);
          })}
        </div>
      ) : (
        renderCard(currentStudent, currentStats, currentGrades)
      )}
    </div>
  );
}
