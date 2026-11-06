import React, { useState } from 'react';
import { Settings, X, Save } from 'lucide-react';

export default function SettingsModal({
  info,
  onSaveInfo,
  onResetDefault,
  onClose
}) {
  const [formData, setFormData] = useState({ ...info });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveInfo(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              ការកំណត់ព័ត៌មានសាលា និងបន្ទុកថ្នាក់
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">ឈ្មោះសាលារៀន</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">ឆ្នាំសិក្សា</label>
              <input
                type="text"
                value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">មន្ទីរអប់រំ រាជធានី/ខេត្ត</label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">ការិយាល័យអប់រំ ក្រុង/ស្រុក/ខណ្ឌ</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">កម្រិតថ្នាក់</label>
              <input
                type="text"
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">បន្ទប់ / អក្សរថ្នាក់</label>
              <input
                type="text"
                value={formData.classSection}
                onChange={(e) => setFormData({ ...formData, classSection: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">ឈ្មោះគ្រូបន្ទុកថ្នាក់</label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">លេខទូរស័ព្ទគ្រូ</label>
              <input
                type="text"
                value={formData.teacherPhone}
                onChange={(e) => setFormData({ ...formData, teacherPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">ឈ្មោះនាយក/នាយិកាសាលា</label>
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">ទីតាំងធ្វើលិខិត (ឃុំ/ស្រុក)</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('តើអ្នកពិតជាចង់កំណត់ឡើងវិញនូវទិន្នន័យដើមចេញពី 7A.xlsm មែនទេ?')) {
                  onResetDefault();
                  onClose();
                }
              }}
              className="text-red-600 hover:text-red-700 text-xs font-semibold"
            >
              កំណត់ទិន្នន័យដើមឡើងវិញ (Reset to 7A.xlsm)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>រក្សាទុក</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
