import React from 'react';
import { Calendar, Sparkles, Printer, Clock } from 'lucide-react';
import { toKhmerNum } from '../utils/gradeCalculations';

export default function TimetableAndDuty({
  info,
  timetable,
  cleaningDuty
}) {
  return (
    <div className="space-y-4">
      {/* Timetable Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              កាលវិភាគបង្រៀន &amp; វេនសម្អាតអនាម័យ (Timetable &amp; Duty)
            </h2>
            <p className="text-xs text-slate-500">
              ស្តង់ដាទី ២ និងស្តង់ដាទី ៥ នៃសាលារៀនគំរូ • ថ្នាក់ {info.gradeLevel} "{info.classSection}"
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>បោះពុម្ព</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Timetable */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍ (Weekly Class Timetable)</span>
            </h3>
            <span className="text-[11px] text-slate-500">ព្រឹក ម៉ោង ៧:០០ - ១១:១៥</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2 text-center w-16">ថ្ងៃ</th>
                  <th className="p-2 text-center">ម៉ោងទី ១<br/><span className="text-[10px] font-normal text-slate-500">7:00-7:50</span></th>
                  <th className="p-2 text-center">ម៉ោងទី ២<br/><span className="text-[10px] font-normal text-slate-500">7:50-8:40</span></th>
                  <th className="p-2 text-center">ម៉ោងទី ៣<br/><span className="text-[10px] font-normal text-slate-500">8:55-9:45</span></th>
                  <th className="p-2 text-center">ម៉ោងទី ៤<br/><span className="text-[10px] font-normal text-slate-500">9:45-10:35</span></th>
                  <th className="p-2 text-center">ម៉ោងទី ៥<br/><span className="text-[10px] font-normal text-slate-500">10:35-11:15</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-center font-sans">
                {timetable.map((row) => (
                  <tr key={row.day} className="hover:bg-slate-50 transition">
                    <td className="p-2 font-bold text-indigo-900 bg-indigo-50/50">{row.day}</td>
                    <td className="p-2 font-medium text-slate-800">{row.p1}</td>
                    <td className="p-2 font-medium text-slate-800">{row.p2}</td>
                    <td className="p-2 font-medium text-slate-800">{row.p3}</td>
                    <td className="p-2 font-medium text-slate-800">{row.p4}</td>
                    <td className="p-2 font-medium text-slate-800">{row.p5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cleaning Duty Rota */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>កាលវិភាគវេនសម្អាត និងអនាម័យថ្នាក់រៀន (Cleaning Duty)</span>
            </h3>
            <span className="text-[11px] text-emerald-700 font-semibold">ស្តង់ដាបៃតង &amp; អនាម័យ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2 text-center w-16">ថ្ងៃ</th>
                  <th className="p-2 text-center w-24">ក្រុមទទួលបន្ទុក</th>
                  <th className="p-2 text-left">សមាជិកវេនសម្អាត</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {cleaningDuty.map((duty) => (
                  <tr key={duty.day} className="hover:bg-slate-50 transition">
                    <td className="p-2 text-center font-bold text-emerald-900 bg-emerald-50/50">{duty.day}</td>
                    <td className="p-2 text-center font-semibold text-slate-800">{duty.group}</td>
                    <td className="p-2 text-slate-600 text-[11px] leading-relaxed">{duty.members}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
