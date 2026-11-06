import React, { useState } from 'react';
import { User, Users, Plus, Edit2, Trash2, Phone, MapPin, Calendar, Heart, Shield, X, Save, Search, Download } from 'lucide-react';
import { toKhmerNum } from '../utils/gradeCalculations';

export default function StudentProfileModal({
  students,
  onSaveStudent,
  onDeleteStudent,
  onClose
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.includes(searchTerm)
  );

  const handleStartEdit = (student) => {
    setEditingStudent({ ...student });
    setIsCreatingNew(false);
  };

  const handleStartCreate = () => {
    setEditingStudent({
      no: students.length + 1,
      id: `20${500 + students.length + 1}`,
      name: '',
      gender: 'ស្រី',
      dob: '2013-01-01',
      age: 12,
      birthplace: 'កំពង់ត្រឡាច, ខេត្តកំពង់ឆ្នាំង',
      address: 'កំពង់ត្រឡាច, ខេត្តកំពង់ឆ្នាំង',
      father: '',
      fatherJob: 'កសិករ',
      fatherPhone: '',
      mother: '',
      motherJob: 'កសិករ',
      motherPhone: '',
      phone: '',
      poor: false,
      scholarship: false,
      orphan: false,
      disabled: false,
      ethnic: false,
      conduct: 'ល្អ'
    });
    setIsCreatingNew(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!editingStudent.name.trim()) {
      alert('សូមបញ្ចូលឈ្មោះសិស្ស');
      return;
    }
    onSaveStudent(editingStudent, isCreatingNew);
    setEditingStudent(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                បញ្ជីប្រវត្តិរូបសិស្សពេញលេញ (Student Biodata)
              </h3>
              <p className="text-xs text-slate-500">
                ចំនួនសិស្សសរុប {toKhmerNum(students.length)} នាក់ (ស្រី {toKhmerNum(students.filter(s => s.gender === 'ស្រី').length)} នាក់)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមសិស្សថ្មី</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
          <div className="text-xs text-slate-500">
            បង្ហាញ {toKhmerNum(filtered.length)} នាក់
          </div>
        </div>

        {/* Modal Body / Table or Form */}
        <div className="flex-1 overflow-y-auto p-4">
          {editingStudent ? (
            /* Edit / Create Form */
            <form onSubmit={handleFormSubmit} className="space-y-4 max-w-3xl mx-auto bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                {isCreatingNew ? 'បញ្ចូលព័ត៌មានសិស្សថ្មី' : `កែប្រែព័ត៌មាន៖ ${editingStudent.name}`}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">អត្តលេខសិស្ស *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.id}
                    onChange={(e) => setEditingStudent({ ...editingStudent, id: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">គោត្តនាម-នាម *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ភេទ *</label>
                  <select
                    value={editingStudent.gender}
                    onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="ស្រី">ស្រី</option>
                    <option value="ប្រុស">ប្រុស</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ថ្ងៃខែឆ្នាំកំណើត</label>
                  <input
                    type="date"
                    value={editingStudent.dob}
                    onChange={(e) => setEditingStudent({ ...editingStudent, dob: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">អាយុ</label>
                  <input
                    type="number"
                    value={editingStudent.age}
                    onChange={(e) => setEditingStudent({ ...editingStudent, age: parseInt(e.target.value) || 12 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">អត្តចរិត / វិន័យ</label>
                  <select
                    value={editingStudent.conduct}
                    onChange={(e) => setEditingStudent({ ...editingStudent, conduct: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="ល្អណាស់">ល្អណាស់</option>
                    <option value="ល្អ">ល្អ</option>
                    <option value="មធ្យម">មធ្យម</option>
                    <option value="ខ្សោយ">ខ្សោយ</option>
                  </select>
                </div>
              </div>

              {/* Birthplace & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ទីកន្លែងកំណើត</label>
                  <input
                    type="text"
                    value={editingStudent.birthplace}
                    onChange={(e) => setEditingStudent({ ...editingStudent, birthplace: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">អាសយដ្ឋានបច្ចុប្បន្ន</label>
                  <input
                    type="text"
                    value={editingStudent.address}
                    onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Parents Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ឈ្មោះឪពុក</label>
                  <input
                    type="text"
                    value={editingStudent.father}
                    onChange={(e) => setEditingStudent({ ...editingStudent, father: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">មុខរបរឪពុក</label>
                  <input
                    type="text"
                    value={editingStudent.fatherJob}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fatherJob: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">លេខទូរស័ព្ទឪពុក</label>
                  <input
                    type="text"
                    value={editingStudent.fatherPhone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fatherPhone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ឈ្មោះម្តាយ</label>
                  <input
                    type="text"
                    value={editingStudent.mother}
                    onChange={(e) => setEditingStudent({ ...editingStudent, mother: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">មុខរបរម្តាយ</label>
                  <input
                    type="text"
                    value={editingStudent.motherJob}
                    onChange={(e) => setEditingStudent({ ...editingStudent, motherJob: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">លេខទូរស័ព្ទម្តាយ</label>
                  <input
                    type="text"
                    value={editingStudent.motherPhone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, motherPhone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Vulnerability Status */}
              <div className="border-t pt-3">
                <span className="block text-xs font-semibold text-slate-700 mb-2">ស្ថានភាពពិសេស (Special Needs &amp; Vulnerability)</span>
                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStudent.poor}
                      onChange={(e) => setEditingStudent({ ...editingStudent, poor: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>គ្រួសារក្រីក្រ (មានប័ណ្ណក្រីក្រ)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStudent.scholarship}
                      onChange={(e) => setEditingStudent({ ...editingStudent, scholarship: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>ទទួលបានអាហារូបករណ៍</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStudent.orphan}
                      onChange={(e) => setEditingStudent({ ...editingStudent, orphan: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>កុមារកំព្រា</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStudent.disabled}
                      onChange={(e) => setEditingStudent({ ...editingStudent, disabled: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>ពិការភាព</span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setEditingStudent(null); setIsCreatingNew(false); }}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-200 hover:bg-slate-300"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុក</span>
                </button>
              </div>
            </form>
          ) : (
            /* Student List Table */
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-12">ល.រ</th>
                    <th className="p-2.5 text-center w-20">អត្តលេខ</th>
                    <th className="p-2.5 min-w-[140px]">គោត្តនាម-នាម</th>
                    <th className="p-2.5 text-center w-14">ភេទ</th>
                    <th className="p-2.5 w-24">ថ្ងៃកំណើត</th>
                    <th className="p-2.5 min-w-[160px]">ទីកន្លែងកំណើត</th>
                    <th className="p-2.5 min-w-[140px]">ឪពុក-ម្តាយ</th>
                    <th className="p-2.5 w-28">ទូរស័ព្ទ</th>
                    <th className="p-2.5 text-center w-24">ស្ថានភាព</th>
                    <th className="p-2.5 text-center w-20">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {filtered.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-2 text-center text-slate-500 font-mono">{toKhmerNum(s.no || idx + 1)}</td>
                      <td className="p-2 text-center font-mono font-medium text-slate-700">{s.id}</td>
                      <td className="p-2 font-medium text-slate-900">{s.name}</td>
                      <td className={`p-2 text-center font-semibold ${s.gender === 'ស្រី' ? 'text-pink-600' : 'text-slate-700'}`}>
                        {s.gender}
                      </td>
                      <td className="p-2 font-mono text-slate-600">{s.dob}</td>
                      <td className="p-2 text-slate-600 truncate max-w-[180px]">{s.birthplace}</td>
                      <td className="p-2 text-slate-700 text-[11px]">
                        <div>{s.father && `ឪ: ${s.father}`}</div>
                        <div>{s.mother && `ម្ត: ${s.mother}`}</div>
                      </td>
                      <td className="p-2 font-mono text-slate-600">
                        {s.phone || s.fatherPhone || s.motherPhone || '-'}
                      </td>
                      <td className="p-2 text-center">
                        {s.poor && <span className="inline-block bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded mr-1">ក្រីក្រ</span>}
                        {s.scholarship && <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded">អាហារូបករណ៍</span>}
                        {!s.poor && !s.scholarship && <span className="text-slate-400 text-[10px]">ទូទៅ</span>}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(s)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="កែប្រែ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`តើអ្នកពិតជាចង់លុបសិស្ស "${s.name}" មែនទេ?`)) {
                                onDeleteStudent(s.id);
                              }
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
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
          )}
        </div>
      </div>
    </div>
  );
}
