import React, { useState } from 'react';
import { ShieldCheck, Star, Award, CheckCircle2, Clock, AlertTriangle, Printer, BarChart3, Info } from 'lucide-react';
import { toKhmerNum } from '../utils/gradeCalculations';

export default function ModelSchoolStandardsView({
  info,
  standards: initialStandards,
  students
}) {
  const [standards, setStandards] = useState(initialStandards);

  // Toggle status for an indicator
  const handleToggleIndicator = (standardId, indicatorId) => {
    setStandards(prev => prev.map(std => {
      if (std.id !== standardId) return std;
      return {
        ...std,
        indicators: std.indicators.map(ind => {
          if (ind.id !== indicatorId) return ind;
          const nextStatus = ind.status === 'pass' ? 'in_progress' : (ind.status === 'in_progress' ? 'action_needed' : 'pass');
          const nextScore = nextStatus === 'pass' ? 5 : (nextStatus === 'in_progress' ? 3 : 1);
          return { ...ind, status: nextStatus, score: nextScore };
        })
      };
    }));
  };

  // Calculate Overall Score and Star Rating
  let totalScore = 0;
  let maxPossibleScore = 0;
  standards.forEach(std => {
    std.indicators.forEach(ind => {
      totalScore += ind.score || 5;
      maxPossibleScore += 5;
    });
  });

  const percentageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  let starRating = 3;
  let ratingLabel = 'ជាប់ស្តង់ដាគំរូកម្រិត ៣ ផ្កាយ';
  let badgeColor = 'bg-blue-100 text-blue-900 border-blue-300';

  if (percentageScore >= 90) {
    starRating = 5;
    ratingLabel = 'សាលារៀនគំរូកម្រិតឆ្នើម ៥ ផ្កាយ (MoEYS 5-Star Honor)';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  } else if (percentageScore >= 80) {
    starRating = 4;
    ratingLabel = 'សាលារៀនគំរូកម្រិត ៤ ផ្កាយ (MoEYS 4-Star)';
    badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  }

  return (
    <div className="space-y-4">
      {/* Top Banner with Star Rating */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-full text-xs shadow-sm">
                ស្តង់ដាសាលារៀនគំរូ (MoEYS Standard Model School)
              </span>
              <span className="text-xs text-blue-200">
                ក្រសួងអប់រំ យុវជន និងកីឡា
              </span>
            </div>
            <h2 className="text-2xl font-bold font-moul tracking-wide text-white mb-2">
              ការវាយតម្លៃបន្ទុកថ្នាក់តាមស្តង់ដាសាលារៀនគំរូទាំង ៥
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              ការអនុវត្តស្របតាមសេចក្តីណែនាំស្តីពី «ស្តង់ដាសាលារៀនគំរូ» របស់រាជរដ្ឋាភិបាលកម្ពុជា
              ដើម្បីធានាគុណភាពអប់រំ សីលធម៌ សុខភាព និងការចូលរួមរបស់សហគមន៍។
            </p>
          </div>

          {/* Rating Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center min-w-[200px]">
            <span className="text-xs text-blue-200 block mb-1">ពិន្ទុវាយតម្លៃរួម</span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              {toKhmerNum(percentageScore)}%
            </div>
            <div className="flex justify-center gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-white block">
              {ratingLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Standards Accordion / Cards */}
      <div className="space-y-4">
        {standards.map((std, idx) => {
          const stdTotal = std.indicators.reduce((acc, ind) => acc + (ind.score || 5), 0);
          const stdMax = std.indicators.length * 5;
          const stdPercent = Math.round((stdTotal / stdMax) * 100);

          return (
            <div key={std.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Standard Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{std.title}</h3>
                    <p className="text-xs text-slate-500">ទម្ងន់ពិន្ទុ៖ {std.weight}% នៃស្តង់ដារួម</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">សម្រេចបាន</span>
                    <strong className="text-sm font-mono text-blue-700">{toKhmerNum(stdPercent)}%</strong>
                  </div>
                  <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stdPercent >= 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                      style={{ width: `${stdPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Indicators Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-12">ល.រ</th>
                      <th className="p-2.5 min-w-[280px]">សូចនាករវាយតម្លៃ (Indicator)</th>
                      <th className="p-2.5 text-center w-28">គោលដៅ</th>
                      <th className="p-2.5 text-center w-36">ស្ថានភាពជាក់ស្តែង</th>
                      <th className="p-2.5 text-center w-28">លទ្ធផល</th>
                      <th className="p-2.5 text-center w-20">ពិន្ទុ (៥)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {std.indicators.map((ind, indIdx) => (
                      <tr 
                        key={ind.id} 
                        onClick={() => handleToggleIndicator(std.id, ind.id)}
                        className="hover:bg-blue-50/30 cursor-pointer transition"
                      >
                        <td className="p-2 text-center text-slate-500 font-mono">{toKhmerNum(indIdx + 1)}</td>
                        <td className="p-2 font-medium text-slate-900">{ind.name}</td>
                        <td className="p-2 text-center text-slate-600 font-mono">{ind.target}</td>
                        <td className="p-2 text-center font-semibold text-slate-800">{ind.current}</td>
                        <td className="p-2 text-center">
                          {ind.status === 'pass' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> សម្រេចបាន
                            </span>
                          )}
                          {ind.status === 'in_progress' && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> កំពុងអនុវត្ត
                            </span>
                          )}
                          {ind.status === 'action_needed' && (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> ត្រូវកែលម្អ
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-blue-700">
                          {ind.score || 5}/៥
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
