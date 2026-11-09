import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Phone, 
  Package, 
  HeartPulse, 
  Coins, 
  CalendarDays, 
  Plus, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { toKhmerNum } from '../utils/gradeCalculations';

export default function ClassroomManagementView({
  info,
  teachers = [],
  council,
  inventory = [],
  classFunds = { totalBudget: 0, targetBudget: 2000000, records: [] },
  nutrition = [],
  actionPlans = { yearly: [], weekly: [] },
  onUpdateInventory,
  onUpdateFunds
}) {
  const [activeSubTab, setActiveSubTab] = useState('council'); // 'council', 'teachers', 'inventory', 'nutrition', 'funds', 'plans'
  const [searchTerm, setSearchTerm] = useState('');

  // Inventory search
  const filteredInventory = inventory.filter(item => 
    item.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funds search
  const filteredFunds = (classFunds.records || []).filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.father && r.father.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.mother && r.mother.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Nutrition search
  const filteredNutrition = nutrition.filter(n =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                រដ្ឋបាល & បន្ទុកថ្នាក់
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {info.schoolName} • ថ្នាក់ {info.gradeLevel} "{info.classSection}"
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-moul tracking-wide mt-1">
              ការងារគ្រប់គ្រងបន្ទុកថ្នាក់ និងរដ្ឋបាលគំរូ
            </h2>
            <p className="text-xs text-slate-500">
              រៀបចំតាមសៀវភៅបន្ទុកថ្នាក់ និងលក្ខណៈវិនិច្ឆ័យសាលាស្តង់ដាគំរូរបស់ក្រសួងអប់រំ យុវជន និងកីឡា
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>បោះពុម្ពរបាយការណ៍</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 flex items-center gap-1 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => { setActiveSubTab('council'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'council'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ក្រុមប្រឹក្សាយុវជន & អនុសាខា (៦)</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('teachers'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'teachers'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>គ្រូបង្រៀនតាមមុខវិជ្ជា ({toKhmerNum(teachers.length)})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('inventory'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'inventory'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>សារពើភ័ណ្ឌថ្នាក់រៀន ({toKhmerNum(inventory.length)})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('nutrition'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'nutrition'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>អាហារូបត្ថម្ភ & BMI</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('funds'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'funds'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>ថវិកាតុបតែង & មូលនិធិថ្នាក់</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('plans'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'plans'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>ផែនការសកម្មភាពប្រចាំសប្តាហ៍/ឆ្នាំ</span>
        </button>
      </div>

      {/* TAB 1: COUNCIL & 6 SUB-BRANCHES */}
      {activeSubTab === 'council' && (
        <div className="space-y-4">
          {/* Executive Leadership Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-4 mb-4">
              <div>
                <span className="px-2.5 py-1 bg-amber-400 text-slate-900 font-bold text-[10px] rounded-full">
                  សាខាក្រុមប្រឹក្សាយុវជន ថ្នាក់ 7A
                </span>
                <h3 className="text-lg font-bold font-moul mt-1.5">
                  គណៈកម្មការប្រតិបត្តិសាខាក្រុមប្រឹក្សាយុវជនវិទ្យាល័យ ហ៊ុនសែន កំពង់ត្រឡាច
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-200 block">ទីប្រឹក្សាគ្រូទទួលបន្ទុកថ្នាក់</span>
                <span className="text-base font-bold text-amber-300">{council?.advisor || info.teacherName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
                <span className="text-xs text-blue-200 block mb-1">ប្រធានទទួលបន្ទុករួម (សិស្ស)</span>
                <h4 className="text-base font-bold text-white">{council?.president || 'លី គឹមហេង'}</h4>
                <span className="text-[10px] text-amber-300 font-medium mt-1 inline-block">ដឹកនាំរួមថ្នាក់រៀន</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
                <span className="text-xs text-blue-200 block mb-1">អនុប្រធានទី ១ (សិស្ស)</span>
                <h4 className="text-base font-bold text-white">{council?.vicePresident1 || 'ហ៊ាន អូនវឌ្ឃនៈ'}</h4>
                <span className="text-[10px] text-amber-300 font-medium mt-1 inline-block">ទទួលបន្ទុកអនុសាខា ១, ២, ៣</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
                <span className="text-xs text-blue-200 block mb-1">អនុប្រធានទី ២ (សិស្ស)</span>
                <h4 className="text-base font-bold text-white">{council?.vicePresident2 || 'ទៀង រក្សា'}</h4>
                <span className="text-[10px] text-amber-300 font-medium mt-1 inline-block">ទទួលបន្ទុកអនុសាខា ៤, ៥, ៦</span>
              </div>
            </div>
          </div>

          {/* 6 Sub-branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(council?.subBranches || []).map((sub, idx) => (
              <div key={sub.id || idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">
                      {sub.name}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      សមាជិក {toKhmerNum(sub.members?.length || 0)} នាក់
                    </span>
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {toKhmerNum(idx + 1)}
                  </span>
                </div>

                <div className="p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-950 font-medium">
                    <span className="text-[11px] text-amber-800">ប្រធានអនុសាខា:</span>
                    <span className="font-bold">{sub.leader || sub.members?.[0]?.name || '-'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-950 font-medium">
                    <span className="text-[11px] text-blue-800">អនុប្រធាន:</span>
                    <span className="font-bold">{sub.viceLeader || sub.members?.[1]?.name || '-'}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block mb-1.5">បញ្ជីសមាជិកទាំងអស់៖</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(sub.members || []).map((m, mIdx) => (
                        <span 
                          key={mIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TEACHERS DIRECTORY */}
      {activeSubTab === 'teachers' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>បញ្ជីឈ្មោះគ្រូបង្រៀនតាមមុខវិជ្ជា ថ្នាក់ 7A (Sheet T)</span>
              </h3>
              <p className="text-xs text-slate-500">
                ឆ្នាំសិក្សា {info.schoolYear} • វិទ្យាល័យ ហ៊ុនសែន កំពង់ត្រឡាច
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center w-12">ល.រ</th>
                  <th className="p-3">គោត្តនាម និងនាម</th>
                  <th className="p-3 text-center w-20">ភេទ</th>
                  <th className="p-3">មុខវិជ្ជាបង្រៀន</th>
                  <th className="p-3">លេខទូរស័ព្ទទំនាក់ទំនង</th>
                  <th className="p-3 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teachers.map((t, idx) => (
                  <tr key={t.no || idx} className="hover:bg-blue-50/40 transition">
                    <td className="p-3 text-center font-bold text-slate-500">{toKhmerNum(idx + 1)}</td>
                    <td className="p-3 font-bold text-slate-900">{t.name}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.gender === 'ស្រី' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t.gender}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-indigo-700">{t.subject}</td>
                    <td className="p-3 font-mono text-slate-700 font-medium">
                      {t.phone ? (
                        <a href={`tel:${t.phone}`} className="hover:text-blue-600 hover:underline">
                          {t.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">គ្មានទិន្នន័យ</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {t.phone && (
                        <a
                          href={`tel:${t.phone}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>ហៅចេញ</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CLASSROOM INVENTORY */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>បញ្ជីសារពើភ័ណ្ឌ និងសម្ភារៈក្នុងថ្នាក់រៀន (Sheet F)</span>
              </h3>
              <p className="text-xs text-slate-500">
                ស្តង់ដាទី ២ នៃសាលារៀនគំរូ៖ បរិស្ថាន សម្ភារៈ និងរូបវន្តថ្នាក់រៀន
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកសម្ភារៈ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center w-12">ល.រ</th>
                  <th className="p-3">ឈ្មោះសម្ភារៈ</th>
                  <th className="p-3 text-center w-24">ចំនួន</th>
                  <th className="p-3 text-center w-28">ឯកតា</th>
                  <th className="p-3 text-center w-32">ស្ថានភាពបច្ចុប្បន្ន</th>
                  <th className="p-3">កំណត់សម្គាល់</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInventory.map((item, idx) => (
                  <tr key={item.no || idx} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-center font-bold text-slate-500">{toKhmerNum(idx + 1)}</td>
                    <td className="p-3 font-bold text-slate-800">{item.item}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-700 text-sm">
                      {toKhmerNum(item.quantity)}
                    </td>
                    <td className="p-3 text-center text-slate-500">{item.unit || 'គ្រឿង/ផ្ទាំង'}</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {item.status || 'ល្អ/ប្រើប្រាស់បាន'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 italic text-[11px]">{item.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: NUTRITION & BMI */}
      {activeSubTab === 'nutrition' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs text-slate-500 block mb-1">សិស្សសរុបពិនិត្យ</span>
              <span className="text-2xl font-bold text-slate-800 font-mono">{toKhmerNum(nutrition.length)}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs text-slate-500 block mb-1">ទម្ងន់សមស្រប (ធម្មតា)</span>
              <span className="text-2xl font-bold text-emerald-600 font-mono">
                {toKhmerNum(nutrition.filter(n => (n.status || '').includes('សមស្រប') || !n.status).length)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs text-slate-500 block mb-1">កង្វះអាហារូបត្ថម្ភ</span>
              <span className="text-2xl font-bold text-amber-600 font-mono">
                {toKhmerNum(nutrition.filter(n => (n.status || '').includes('កង្វះ')).length)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs text-slate-500 block mb-1">លើសទម្ងន់ / ធាត់</span>
              <span className="text-2xl font-bold text-purple-600 font-mono">
                {toKhmerNum(nutrition.filter(n => (n.status || '').includes('លើស') || (n.status || '').includes('ធាត់')).length)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  <span>បញ្ជីវាយតម្លៃអាហារូបត្ថម្ភ និងកាតាឡុក BMI សិស្ស (Sheet Food)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  ស្តង់ដាសុខភាពសិក្សា និងអនាម័យសាលារៀនគំរូ របស់ក្រសួងអប់រំ
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះសិស្ស..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-center w-12">ល.រ</th>
                    <th className="p-3">គោត្តនាម នាម</th>
                    <th className="p-3 text-center w-16">ភេទ</th>
                    <th className="p-3 text-center w-20">អាយុ (ឆ្នាំ)</th>
                    <th className="p-3 text-center w-24">ទម្ងន់ (Kg)</th>
                    <th className="p-3 text-center w-24">កម្ពស់ (m)</th>
                    <th className="p-3 text-center w-24">BMI</th>
                    <th className="p-3 text-center w-36">ស្ថានភាពសុខភាព</th>
                    <th className="p-3">កំណត់សម្គាល់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredNutrition.map((st, idx) => (
                    <tr key={st.no || idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-bold text-slate-500">{toKhmerNum(idx + 1)}</td>
                      <td className="p-3 font-bold text-slate-900">{st.name}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          st.gender === 'ស្រី' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {st.gender}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">{toKhmerNum(st.age || 12)}</td>
                      <td className="p-3 text-center font-mono font-medium">{st.weight ? toKhmerNum(st.weight) : '-'}</td>
                      <td className="p-3 text-center font-mono font-medium">{st.height ? toKhmerNum(st.height) : '-'}</td>
                      <td className="p-3 text-center font-mono font-bold text-blue-700">{st.bmi ? toKhmerNum(st.bmi) : '-'}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {st.status || 'ទម្ងន់សមស្រប'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 italic text-[11px]">{st.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CLASSROOM DECORATION & FUNDS */}
      {activeSubTab === 'funds' && (
        <div className="space-y-4">
          {/* Fund Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-emerald-100 block mb-1">ថវិកាប្រមូលបានសរុប (Sheet1 (2))</span>
              <div className="text-2xl font-bold font-mono">
                {classFunds.totalBudget?.toLocaleString() || '1,720,000'} <span className="text-sm font-sans">រៀល</span>
              </div>
              <span className="text-[11px] text-emerald-100 mt-2 block">
                ពីការចូលរួមរបស់អាណាព្យាបាលសិស្ស
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">ចំនួនអាណាព្យាបាលបានចូលរួម</span>
              <div className="text-2xl font-bold font-mono text-slate-800">
                {toKhmerNum(classFunds.records?.filter(r => r.amount > 0).length || 35)} <span className="text-sm font-sans text-slate-500">នាក់</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-2 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ភាគច្រើនចូលរួម ៤០,០០០៛ - ៥០,០០០៛
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">គោលបំណងថវិកា</span>
              <h4 className="font-bold text-slate-800 text-xs mb-1">តុបតែង និងបំពាក់សម្ភារៈរៀនសូត្រ</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ផ្ទាំងរូបមន្ត ពាក្យស្លោក កង្ហារ ផ្ទាំងរូបភាពប្រវត្តិសាស្ត្រ និងសម្ភារៈអនាម័យថ្នាក់រៀន
              </p>
            </div>
          </div>

          {/* Contributors Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>បញ្ជីរាយនាមអាណាព្យាបាលចូលរួមថវិកាតុបតែងថ្នាក់រៀន</span>
                </h3>
                <p className="text-xs text-slate-500">
                  ការចូលរួមរបស់សហគមន៍ និងមាតាបិតាសិស្ស (ស្តង់ដាទី ៤ នៃសាលារៀនគំរូ)
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះសិស្ស/ឪពុកម្តាយ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-center w-12">ល.រ</th>
                    <th className="p-3">ឈ្មោះសិស្ស</th>
                    <th className="p-3">ឈ្មោះឪពុក & ទូរស័ព្ទ</th>
                    <th className="p-3">ឈ្មោះម្តាយ & ទូរស័ព្ទ</th>
                    <th className="p-3 text-right w-32">ចំនួនថវិកា (រៀល)</th>
                    <th className="p-3 text-center w-28">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredFunds.map((rec, idx) => (
                    <tr key={rec.no || idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-bold text-slate-500">{toKhmerNum(idx + 1)}</td>
                      <td className="p-3 font-bold text-slate-900">{rec.studentName}</td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{rec.father || '-'}</span>
                        {rec.fatherPhone && (
                          <span className="block text-[11px] text-slate-400 font-mono">{rec.fatherPhone}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{rec.mother || '-'}</span>
                        {rec.motherPhone && rec.motherPhone !== '-' && (
                          <span className="block text-[11px] text-slate-400 font-mono">{rec.motherPhone}</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700 text-sm">
                        {rec.amount ? rec.amount.toLocaleString() : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {rec.amount > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            បានបង់រួច
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                            មិនទាន់បង់
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ACTION PLANS */}
      {activeSubTab === 'plans' && (
        <div className="space-y-4">
          {/* Weekly Action Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>តារាងផែនការសកម្មភាពប្រចាំសប្តាហ៍ សាខាក្រុមប្រឹក្សាយុវជន (Table 2)</span>
              </h3>
              <p className="text-xs text-slate-500">
                ការបែងចែកការទទួលខុសត្រូវតាមថ្ងៃ សម្រាប់អនុសាខាទាំង ៦
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-center w-12">ល.រ</th>
                    <th className="p-3">ឈ្មោះសកម្មភាពប្រចាំថ្ងៃសម្រាប់អនុវត្ត</th>
                    <th className="p-3 text-center">ចន្ទ</th>
                    <th className="p-3 text-center">អង្គារ</th>
                    <th className="p-3 text-center">ពុធ</th>
                    <th className="p-3 text-center">ព្រហស្បតិ៍</th>
                    <th className="p-3 text-center">សុក្រ</th>
                    <th className="p-3 text-center">សៅរ៍</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-center">
                  {(actionPlans.weekly || []).map((w, idx) => (
                    <tr key={w.no || idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-bold text-slate-500">{toKhmerNum(idx + 1)}</td>
                      <td className="p-3 text-left font-bold text-slate-800">{w.activity}</td>
                      <td className="p-3 font-semibold text-blue-800 bg-blue-50/30">{w.days?.mon || '-'}</td>
                      <td className="p-3 font-semibold text-blue-800 bg-blue-50/30">{w.days?.tue || '-'}</td>
                      <td className="p-3 font-semibold text-blue-800 bg-blue-50/30">{w.days?.wed || '-'}</td>
                      <td className="p-3 font-semibold text-blue-800 bg-blue-50/30">{w.days?.thu || '-'}</td>
                      <td className="p-3 font-semibold text-blue-800 bg-blue-50/30">{w.days?.fri || '-'}</td>
                      <td className="p-3 font-semibold text-blue-800 bg-blue-50/30">{w.days?.sat || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yearly Action Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                <span>តារាងផែនការសកម្មភាពគណៈកម្មការប្រតិបត្តិប្រចាំឆ្នាំសិក្សា ២០២៥-២០២៦ (Table 1)</span>
              </h3>
              <p className="text-xs text-slate-500">
                ផែនការតាមដានការអនុវត្ត ១០ ខែ នៃឆ្នាំសិក្សា
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-12">ល.រ</th>
                    <th className="p-2.5">សកម្មភាពសំខាន់ៗ</th>
                    <th className="p-2 text-center">វិច្ឆិកា</th>
                    <th className="p-2 text-center">ធ្នូ</th>
                    <th className="p-2 text-center">មករា</th>
                    <th className="p-2 text-center">កុម្ភៈ</th>
                    <th className="p-2 text-center">មីនា</th>
                    <th className="p-2 text-center">មេសា</th>
                    <th className="p-2 text-center">ឧសភា</th>
                    <th className="p-2 text-center">មិថុនា</th>
                    <th className="p-2 text-center">កក្កដា</th>
                    <th className="p-2 text-center">សីហា</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-center">
                  {(actionPlans.yearly || []).map((y, idx) => (
                    <tr key={y.no || idx} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 text-center font-bold text-slate-500">{toKhmerNum(idx + 1)}</td>
                      <td className="p-2.5 text-left font-medium text-slate-800">{y.activity}</td>
                      {(y.months || []).map((active, mIdx) => (
                        <td key={mIdx} className="p-2">
                          {active ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs inline-flex items-center justify-center">
                              ✓
                            </span>
                          ) : (
                            <span className="text-slate-200">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
