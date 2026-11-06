import React, { useState } from 'react';
import { Award, Users, BookOpen, AlertTriangle, CheckCircle, ChevronRight, Sparkles, Printer } from 'lucide-react';
import { calculateRankings, toKhmerNum } from '../utils/gradeCalculations';

export default function HonorRollAndRemedial({
  info,
  students,
  subjects,
  currentMonth,
  grades,
  studyGroups
}) {
  const [activeTab, setActiveTab] = useState('honor'); // 'honor', 'remedial', 'groups'
  const monthGrades = grades[currentMonth.id] || {};
  const rankings = calculateRankings(students, monthGrades, subjects);

  // Top 5 Students
  const topStudents = Object.keys(rankings)
    .map(id => ({ student: students.find(s => s.id === id), stats: rankings[id] }))
    .filter(item => item.student && item.stats.rank <= 5)
    .sort((a, b) => a.stats.rank - b.stats.rank);

  // Slow learners (Average < 50% or failing subjects)
  const slowLearners = Object.keys(rankings)
    .map(id => {
      const student = students.find(s => s.id === id);
      const stats = rankings[id];
      const sGrades = monthGrades[id] || {};
      const weakSubjects = subjects.filter(sub => {
        const val = sGrades[sub.id];
        return val !== undefined && val !== null && val < (sub.max * 0.5);
      });
      return { student, stats, weakSubjects };
    })
    .filter(item => item.student && (item.stats.isSlowLearner || item.weakSubjects.length >= 2))
    .sort((a, b) => (a.stats.average50 || 0) - (b.stats.average50 || 0));

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                កិត្តិយស &amp; ការបំប៉នសិស្សរៀនយឺត (MoEYS Academic Focus)
              </h2>
              <p className="text-xs text-slate-500">
                ស្តង់ដាទី ១ នៃសាលារៀនគំរូ • {info.schoolName} • ថ្នាក់ {info.gradeLevel} "{info.classSection}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('honor')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTab === 'honor' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              តារាងកិត្តិយស (Top 5)
            </button>
            <button
              onClick={() => setActiveTab('remedial')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTab === 'remedial' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              បំប៉នសិស្សរៀនយឺត ({toKhmerNum(slowLearners.length)})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTab === 'groups' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ក្រុមស្វ័យសិក្សា (១០ ក្រុម)
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Honor Roll Top 5 */}
      {activeTab === 'honor' && (
        <div className="space-y-4">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topStudents.slice(0, 3).map((item, idx) => {
              const rank = item.stats.rank;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              return (
                <div
                  key={item.student.id}
                  className={`bg-white rounded-2xl shadow-sm border p-5 relative overflow-hidden flex flex-col justify-between transition hover:shadow-md ${
                    isFirst ? 'border-amber-400 ring-2 ring-amber-300/40 bg-gradient-to-b from-amber-50/30 to-white' :
                    isSecond ? 'border-slate-300' : 'border-amber-700/30'
                  }`}
                >
                  <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg opacity-15 bg-current">
                    {rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isFirst ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        isSecond ? 'bg-slate-200 text-slate-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        ចំណាត់ថ្នាក់លេខ {toKhmerNum(rank)}
                      </span>
                      <span className="font-mono text-xs text-slate-400">អត្តលេខ: {item.student.id}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-1">{item.student.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">
                      ភេទ៖ <strong className="text-slate-700">{item.student.gender}</strong> • អាយុ៖ {item.student.age} ឆ្នាំ
                    </p>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs mb-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">ពិន្ទុសរុប</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">{item.stats.rawTotal}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">មធ្យមភាគ</span>
                        <span className="font-mono font-bold text-blue-700 text-sm">{item.stats.average50?.toFixed(2)}/៥០</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">និទ្ទេស</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">{item.stats.gradeLetter} ({item.stats.gradeLabelKh})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">ភាគរយ</span>
                        <span className="font-mono font-bold text-purple-700 text-sm">{item.stats.percentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>សាលារៀនគំរូ</span>
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> សិស្សឆ្នើមប្រចាំខែ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Top 5 Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center justify-between">
              <span>បញ្ជីរាយនាមសិស្សទទួលបានចំណាត់ថ្នាក់កិត្តិយស (Top 5)</span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>បោះពុម្ពតារាងកិត្តិយស</span>
              </button>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-20">ចំណាត់ថ្នាក់</th>
                  <th className="p-2.5 text-center w-20">អត្តលេខ</th>
                  <th className="p-2.5 min-w-[140px]">គោត្តនាម-នាម</th>
                  <th className="p-2.5 text-center w-14">ភេទ</th>
                  <th className="p-2.5 text-center w-20">ពិន្ទុសរុប</th>
                  <th className="p-2.5 text-center w-24">មធ្យមភាគ (៥០)</th>
                  <th className="p-2.5 text-center w-20">ភាគរយ</th>
                  <th className="p-2.5 text-center w-24">និទ្ទេស</th>
                  <th className="p-2.5 text-center w-28">កិត្តិយស</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {topStudents.map((item) => (
                  <tr key={item.student.id} className="hover:bg-amber-50/30">
                    <td className="p-2 text-center">
                      <span className={`inline-block font-bold px-2 py-0.5 rounded-full text-xs ${
                        item.stats.rank === 1 ? 'bg-amber-400 text-amber-950 shadow-sm' :
                        item.stats.rank === 2 ? 'bg-slate-300 text-slate-900' :
                        item.stats.rank === 3 ? 'bg-amber-200 text-amber-900' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        លេខ {toKhmerNum(item.stats.rank)}
                      </span>
                    </td>
                    <td className="p-2 text-center font-mono font-medium text-slate-700">{item.student.id}</td>
                    <td className="p-2 font-bold text-slate-900">{item.student.name}</td>
                    <td className={`p-2 text-center font-semibold ${item.student.gender === 'ស្រី' ? 'text-pink-600' : 'text-slate-700'}`}>
                      {item.student.gender}
                    </td>
                    <td className="p-2 text-center font-mono font-bold text-slate-800">{item.stats.rawTotal}</td>
                    <td className="p-2 text-center font-mono font-bold text-blue-700">{item.stats.average50?.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono font-medium text-purple-700">{item.stats.percentage}%</td>
                    <td className="p-2 text-center">
                      <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs border ${item.stats.gradeColor}`}>
                        {item.stats.gradeLetter} ({item.stats.gradeLabelKh})
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className="text-amber-700 font-semibold text-[11px]">សិស្សឆ្នើម</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Remedial / Slow Learners Support */}
      {activeTab === 'remedial' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold block mb-1">
                  ផែនការបំប៉នសិស្សរៀនយឺត (MoEYS Remedial Action Plan):
                </strong>
                <p>
                  ស្របតាមស្តង់ដាសាលារៀនគំរូ សិស្សដែលមានមធ្យមភាគក្រោម ៥០% ឬមានមុខវិជ្ជាធ្លាក់លើសពី ២មុខវិជ្ជា
                  ត្រូវទទួលបានការបង្រៀនបន្ថែម (Remedial Sessions) យ៉ាងតិច ២ដងក្នុងមួយសប្តាហ៍ និងរៀបចំឱ្យចូលរួមក្នុងក្រុមស្វ័យសិក្សាជាមួយសិស្សឆ្នើម។
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-12">ល.រ</th>
                  <th className="p-2.5 text-center w-20">អត្តលេខ</th>
                  <th className="p-2.5 min-w-[140px]">គោត្តនាម-នាម</th>
                  <th className="p-2.5 text-center w-14">ភេទ</th>
                  <th className="p-2.5 text-center w-20">មធ្យមភាគ</th>
                  <th className="p-2.5 text-center w-16">និទ្ទេស</th>
                  <th className="p-2.5 min-w-[200px]">មុខវិជ្ជាខ្សោយ (&lt; ៥០%)</th>
                  <th className="p-2.5 min-w-[180px]">វិធានការគាំទ្រ / គ្រូបង្រៀនបំប៉ន</th>
                  <th className="p-2.5 text-center w-24">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {slowLearners.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-emerald-600 font-semibold">
                      ពុំមានសិស្សរៀនយឺតឡើយ! សិស្សទាំងអស់ទទួលបានលទ្ធផលលើសពី ៥០%
                    </td>
                  </tr>
                ) : (
                  slowLearners.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-red-50/20">
                      <td className="p-2 text-center text-slate-500 font-mono">{toKhmerNum(idx + 1)}</td>
                      <td className="p-2 text-center font-mono font-medium text-slate-700">{item.student.id}</td>
                      <td className="p-2 font-medium text-slate-900">{item.student.name}</td>
                      <td className={`p-2 text-center font-semibold ${item.student.gender === 'ស្រី' ? 'text-pink-600' : 'text-slate-700'}`}>
                        {item.student.gender}
                      </td>
                      <td className="p-2 text-center font-mono font-bold text-red-600">
                        {item.stats.average50?.toFixed(2)}/៥០
                      </td>
                      <td className="p-2 text-center">
                        <span className="font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                          {item.stats.gradeLetter}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {item.weakSubjects.map(sub => (
                            <span key={sub.id} className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {sub.name} ({monthGrades[item.student.id]?.[sub.id] || 0}/{sub.max})
                            </span>
                          ))}
                          {item.weakSubjects.length === 0 && (
                            <span className="text-slate-400 text-[10px]">ទូទៅ</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-slate-700 text-[11px]">
                        បំប៉នថ្ងៃសៅរ៍ ម៉ោង ៨-១០ព្រឹក (គណិត+ខ្មែរ)
                      </td>
                      <td className="p-2 text-center">
                        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          កំពុងបំប៉ន
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Peer Study Groups (ក្រុមស្វ័យសិក្សា) */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
            <div>
              <strong className="text-sm font-bold block mb-1">
                ការចាត់តាំងក្រុមស្វ័យសិក្សា (MoEYS Peer Learning Strategy):
              </strong>
              <span>
                សិស្សទាំងអស់ចំនួន {toKhmerNum(students.length)} នាក់ ត្រូវបានបែងចែកជា ១០ ក្រុម (៥-៦នាក់ក្នុងមួយក្រុម)
                ដោយមានសិស្សពូកែធ្វើជាប្រធានក្រុម ជួយពន្យល់មេរៀន និងកិច្ចការផ្ទះដល់មិត្តរួមក្រុម។
              </span>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ពបញ្ជីក្រុម</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyGroups.map(group => {
              const leader = students.find(s => s.id === group.leaderId);
              const members = students.filter(s => group.memberIds.includes(s.id));

              return (
                <div key={group.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{group.name}</h4>
                      <span className="text-[11px] text-blue-600 font-medium">
                        មុខវិជ្ជាគោលដៅ៖ {group.subjectFocus} • ម៉ោងជួប៖ {group.meetingDay}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-mono">
                      {toKhmerNum(members.length)} នាក់
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <span className="text-[11px] text-amber-800 font-semibold block">ប្រធានក្រុមដឹកនាំ៖</span>
                        <strong className="text-slate-900">{leader?.name || 'សិស្សឆ្នើម'}</strong> ({leader?.gender})
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block mb-1">សមាជិកក្នុងក្រុម៖</span>
                      <div className="flex flex-wrap gap-1.5">
                        {members.map(m => (
                          <span
                            key={m.id}
                            className={`px-2 py-0.5 rounded text-[11px] border ${
                              m.id === leader?.id
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {m.name} ({m.gender})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
