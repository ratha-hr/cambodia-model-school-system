import React, { useState } from 'react';
import { Award, Printer, X, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Download } from 'lucide-react';
import { toKhmerNum } from '../utils/gradeCalculations';

export default function CertificateOfHonorModal({
  info,
  students,
  rankings,
  currentMonth,
  onClose
}) {
  // Get top 5 ranked students
  const topStudents = Object.keys(rankings)
    .map(id => ({ student: students.find(s => s.id === id), stats: rankings[id] }))
    .filter(item => item.student && item.stats.rank <= 5)
    .sort((a, b) => a.stats.rank - b.stats.rank);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [printAllMode, setPrintAllMode] = useState(false);

  const activeItem = topStudents[currentIndex] || topStudents[0];

  const handlePrint = (printAll = false) => {
    setPrintAllMode(printAll);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const renderSingleCertificate = (item, isBatch = false) => {
    if (!item) return null;
    const { student, stats } = item;

    const rankTitle = stats.rank === 1 ? 'ចំណាត់ថ្នាក់លេខ ១' :
                      stats.rank === 2 ? 'ចំណាត់ថ្នាក់លេខ ២' :
                      stats.rank === 3 ? 'ចំណាត់ថ្នាក់លេខ ៣' :
                      stats.rank === 4 ? 'ចំណាត់ថ្នាក់លេខ ៤' : 'ចំណាត់ថ្នាក់លេខ ៥';

    return (
      <div 
        key={student.id}
        className={`certificate-page relative bg-white text-slate-900 mx-auto p-8 sm:p-12 border-8 border-double border-amber-600 rounded-2xl shadow-xl flex flex-col justify-between ${
          isBatch ? 'print-page-break mb-8' : ''
        }`}
        style={{
          width: '100%',
          maxWidth: '280mm',
          minHeight: '190mm',
          background: 'linear-gradient(135deg, #fffdfa 0%, #ffffff 100%)'
        }}
      >
        {/* Ornate Corner Accents */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-4 border-l-4 border-amber-500 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute top-3 right-3 w-10 h-10 border-t-4 border-r-4 border-amber-500 rounded-tr-lg pointer-events-none"></div>
        <div className="absolute bottom-3 left-3 w-10 h-10 border-b-4 border-l-4 border-amber-500 rounded-bl-lg pointer-events-none"></div>
        <div className="absolute bottom-3 right-3 w-10 h-10 border-b-4 border-r-4 border-amber-500 rounded-br-lg pointer-events-none"></div>

        {/* National Header */}
        <div className="text-center space-y-1">
          <h2 className="font-moul text-blue-950 text-base sm:text-lg tracking-wider">
            ព្រះរាជាណាចក្រកម្ពុជា
          </h2>
          <h3 className="font-moul text-blue-900 text-sm sm:text-base">
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </h3>
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="w-16 h-0.5 bg-amber-600"></div>
            <Sparkles className="w-4 h-4 text-amber-600 inline" />
            <div className="w-16 h-0.5 bg-amber-600"></div>
          </div>
        </div>

        {/* School Name and Province */}
        <div className="text-center mt-3">
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            មន្ទីរអប់រំ យុវជន និងកីឡា {info.province} • {info.district}
          </p>
          <p className="font-moul text-base sm:text-xl text-blue-900 mt-1">
            {info.schoolName}
          </p>
        </div>

        {/* Certificate Title */}
        <div className="text-center my-4">
          <div className="inline-block relative">
            <h1 className="font-moul text-2xl sm:text-3xl text-amber-700 tracking-wide px-8 py-2">
              ប័ណ្ណសរសើរ
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            (សាលារៀនគំរូ MoEYS Model School Standard)
          </p>
        </div>

        {/* Body Praise Text */}
        <div className="text-center max-w-2xl mx-auto space-y-3 leading-relaxed text-sm sm:text-base">
          <p className="text-slate-800">
            គណៈគ្រប់គ្រងសាលា និងលោកគ្រូអ្នកគ្រូបន្ទុកថ្នាក់ សូមសម្តែងនូវការកោតសរសើរចំពោះ៖
          </p>
          
          <div className="my-2">
            <span className="font-moul text-xl sm:text-2xl text-blue-950 border-b-2 border-dotted border-blue-900 pb-1 px-4">
              យុវសិស្ស {student.name}
            </span>
          </div>

          <p className="text-slate-700 text-xs sm:text-sm">
            ភេទ៖ <strong className="text-slate-900">{student.gender}</strong> • អត្តលេខ៖ <strong className="font-mono text-slate-900">{student.id}</strong> • 
            សិស្សថ្នាក់ទី <strong className="text-slate-900">{info.gradeLevel} "{info.classSection}"</strong>
          </p>

          <p className="text-slate-800 font-medium px-4 text-xs sm:text-sm leading-relaxed">
            ដែលបានខិតខំប្រឹងប្រែងយកចិត្តទុកដាក់ក្នុងការរៀនសូត្រ មានវិន័យ និងសីលធម៌ល្អប្រសើរ ដោយទទួលបាន
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-50 border-2 border-amber-400 shadow-inner">
            <Award className="w-6 h-6 text-amber-600" />
            <span className="font-moul text-base sm:text-lg text-amber-900">
              {rankTitle}
            </span>
            <span className="text-xs font-bold text-slate-600">
              (មធ្យមភាគ {toKhmerNum(stats.average50)}/៥០ • និទ្ទេស {stats.gradeLetter})
            </span>
          </div>

          <p className="text-xs text-slate-600">
            ប្រចាំ <strong className="text-slate-800">{currentMonth.name}</strong> • ក្នុងឆ្នាំសិក្សា <strong className="text-slate-800">{info.schoolYear}</strong>
          </p>
        </div>

        {/* Signatures & Stamps Footer */}
        <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-200 text-xs sm:text-sm">
          {/* Teacher Signature */}
          <div className="text-center w-52">
            <p className="text-slate-600">បានឃើញ និងបញ្ជាក់</p>
            <p className="font-bold text-slate-800 mt-1">គ្រូបន្ទុកថ្នាក់</p>
            <div className="h-16 flex items-center justify-center italic text-slate-400 font-serif">
              (ហត្ថលេខា)
            </div>
            <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
              {info.teacherName}
            </p>
          </div>

          {/* Date & Principal */}
          <div className="text-center w-60">
            <p className="text-slate-600">
              {info.location || 'កំពង់ត្រឡាច'}, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...
            </p>
            <p className="font-bold text-slate-800 mt-1">នាយកសាលា</p>
            <div className="h-16 flex items-center justify-center italic text-slate-400 font-serif">
              (ហត្ថលេខា និងត្រា)
            </div>
            <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
              {info.principalName || 'គណៈគ្រប់គ្រងសាលា'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">
        
        {/* Modal Controls Header */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>ប័ណ្ណសរសើរសិស្សឆ្នើម (MoEYS Certificate of Honor)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {currentMonth.name}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                រចនាក្បាច់រចនាបថជាតិ បោះពុម្ពទំហំ A4 ផ្តេក (Landscape) ស្របតាមស្តង់ដាគំរូ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Student Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : topStudents.length - 1))}
                className="p-1 text-slate-300 hover:text-white rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-amber-300">
                {activeItem?.student?.name} (លេខ {activeItem?.stats?.rank})
              </span>
              <button
                onClick={() => setCurrentIndex(prev => (prev < topStudents.length - 1 ? prev + 1 : 0))}
                className="p-1 text-slate-300 hover:text-white rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Print Single Button */}
            <button
              onClick={() => handlePrint(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 rounded-lg text-xs transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពប័ណ្ណនេះ</span>
            </button>

            {/* Print All Top 5 Button */}
            <button
              onClick={() => handlePrint(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-semibold hover:bg-blue-700 rounded-lg text-xs transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពទាំង ៥ នាក់</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex items-center justify-center">
          {printAllMode ? (
            <div className="space-y-6 w-full">
              {topStudents.map(item => renderSingleCertificate(item, true))}
            </div>
          ) : (
            renderSingleCertificate(activeItem, false)
          )}
        </div>

      </div>
    </div>
  );
}
