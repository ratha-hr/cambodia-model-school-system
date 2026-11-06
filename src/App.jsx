import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  FileSpreadsheet, 
  UserCheck, 
  Award, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Users, 
  Settings, 
  GraduationCap,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Printer,
  ClipboardPaste
} from 'lucide-react';
import initialData from './data/initialData.json';
import DashboardView from './components/DashboardView';
import ExcelSpreadsheetGrid from './components/ExcelSpreadsheetGrid';
import StudentRegistryView from './components/StudentRegistryView';
import AttendanceTracker from './components/AttendanceTracker';
import HonorRollAndRemedial from './components/HonorRollAndRemedial';
import ReportCardView from './components/ReportCardView';
import ModelSchoolStandardsView from './components/ModelSchoolStandardsView';
import TimetableAndDuty from './components/TimetableAndDuty';
import StudentProfileModal from './components/StudentProfileModal';
import SettingsModal from './components/SettingsModal';
import ExcelPasteModal from './components/ExcelPasteModal';
import CertificateOfHonorModal from './components/CertificateOfHonorModal';
import { exportToMoEYSExcel } from './utils/excelHandler';
import { calculateRankings, toKhmerNum } from './utils/gradeCalculations';

const LOCAL_STORAGE_KEY = 'moeys_class_data_v2';

export default function App() {
  // Load state from localStorage or initialData
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
    
    // Initialize default attendance if not existing
    const base = { ...initialData };
    if (!base.attendance) {
      base.attendance = {};
      base.months.forEach(m => {
        base.attendance[m.id] = {};
        for (let d = 1; d <= 26; d++) {
          base.attendance[m.id][d] = {};
          base.students.forEach(s => {
            const rand = Math.random();
            if (rand > 0.96) {
              base.attendance[m.id][d][s.id] = 'permission';
            } else if (rand > 0.94) {
              base.attendance[m.id][d][s.id] = 'late';
            } else if (rand > 0.92 && s.no % 7 === 0) {
              base.attendance[m.id][d][s.id] = 'absent';
            } else {
              base.attendance[m.id][d][s.id] = 'present';
            }
          });
        }
      });
    }
    return base;
  });

  // Default active tab is now 'dashboard' (ផ្ទាំងគ្រប់គ្រង)
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'excel', 'students', 'attendance', 'honor', 'reports', 'standards', 'timetable'
  const [currentMonth, setCurrentMonth] = useState(data.months[0]);
  
  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [data]);

  // Update a single score
  const handleUpdateScore = (monthId, studentId, subjectId, score) => {
    setData(prev => {
      const monthGrades = { ...(prev.grades[monthId] || {}) };
      const studentGrades = { ...(monthGrades[studentId] || {}) };

      if (score === null || score === undefined || score === '') {
        delete studentGrades[subjectId];
      } else {
        studentGrades[subjectId] = score;
      }

      monthGrades[studentId] = studentGrades;

      return {
        ...prev,
        grades: {
          ...prev.grades,
          [monthId]: monthGrades
        }
      };
    });
  };

  // Batch update scores
  const handleBatchUpdateScores = (monthId, newGrades) => {
    setData(prev => ({
      ...prev,
      grades: {
        ...prev.grades,
        [monthId]: newGrades
      }
    }));
  };

  // Attendance update
  const handleUpdateAttendance = (monthId, day, updatedDayRecords) => {
    setData(prev => {
      const currentMonthAtt = { ...(prev.attendance?.[monthId] || {}) };
      currentMonthAtt[day] = updatedDayRecords;

      return {
        ...prev,
        attendance: {
          ...(prev.attendance || {}),
          [monthId]: currentMonthAtt
        }
      };
    });
  };

  // Save Student (Add / Edit)
  const handleSaveStudent = (student, isNew) => {
    setData(prev => {
      let updatedStudents;
      if (isNew) {
        updatedStudents = [...prev.students, student];
      } else {
        updatedStudents = prev.students.map(s => s.id === student.id ? student : s);
      }
      return { ...prev, students: updatedStudents };
    });
  };

  // Delete Student
  const handleDeleteStudent = (studentId) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId)
    }));
  };

  // Import Students from Excel
  const handleImportStudents = (newStudents) => {
    setData(prev => ({
      ...prev,
      students: newStudents
    }));
  };

  // Reset to default
  const handleResetDefault = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setData(initialData);
    setCurrentMonth(initialData.months[0]);
  };

  // Update School Info
  const handleSaveInfo = (newInfo) => {
    setData(prev => ({ ...prev, info: newInfo }));
  };

  // Calculate current month rankings for certificates and dashboard
  const currentMonthRankings = calculateRankings(
    data.students,
    data.grades[currentMonth.id] || {},
    data.subjects
  );

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Titles */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight font-moul">
                    ប្រព័ន្ធគ្រប់គ្រងបន្ទុកថ្នាក់រៀន
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-600 fill-amber-600" />
                    សាលារៀនគំរូ MoEYS
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {data.info.schoolName} • ថ្នាក់ទី {data.info.gradeLevel} "{data.info.classSection}" • ឆ្នាំសិក្សា {data.info.schoolYear}
                </p>
              </div>
            </div>

            {/* Quick Actions on Top Right */}
            <div className="flex items-center gap-2">
              
              {/* Excel Paste Button */}
              <button
                onClick={() => setIsPasteModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition"
                title="បិទភ្ជាប់ទិន្នន័យពី Excel"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-700" />
                <span>បិទភ្ជាប់ Excel</span>
              </button>

              {/* Certificate Button */}
              <button
                onClick={() => setIsCertificateModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition"
                title="ចេញប័ណ្ណសរសើរសិស្សឆ្នើម"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>ប័ណ្ណសរសើរ</span>
              </button>

              {/* Student Count / Modal Button */}
              <button
                onClick={() => setActiveTab('students')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span>សិស្ស ({toKhmerNum(data.students.length)})</span>
              </button>

              {/* Export Excel Button */}
              <button
                onClick={() => exportToMoEYSExcel(data.info, data.students, data.subjects, currentMonth, data.grades[currentMonth.id] || {})}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.xlsx</span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                title="ការកំណត់ព័ត៌មាន"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2">
              {[
                { id: 'dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', icon: LayoutDashboard },
                { id: 'excel', label: 'តារាងស្រង់ពិន្ទុ (Excel Grid)', icon: FileSpreadsheet },
                { id: 'students', label: 'ពត៌មានសិស្ស', icon: Users },
                { id: 'attendance', label: 'វត្តមាន & ហានិភ័យបោះបង់', icon: UserCheck },
                { id: 'honor', label: 'កិត្តិយស & បំប៉នសិស្សរៀនយឺត', icon: Award },
                { id: 'reports', label: 'ព្រឹត្តិបត្រពិន្ទុ (A4)', icon: FileText },
                { id: 'standards', label: 'ស្តង់ដាសាលារៀនគំរូទាំង ៥', icon: ShieldCheck },
                { id: 'timetable', label: 'កាលវិភាគ & វេនសម្អាត', icon: Calendar },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <DashboardView
            info={data.info}
            students={data.students}
            subjects={data.subjects}
            currentMonth={currentMonth}
            months={data.months}
            grades={data.grades}
            onNavigateTab={setActiveTab}
            onOpenPasteModal={() => setIsPasteModalOpen(true)}
            onOpenCertificateModal={() => setIsCertificateModalOpen(true)}
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
            attendanceRecords={data.attendance?.[currentMonth.id] || {}}
          />
        )}

        {/* Tab 2: Excel Score Grid */}
        {activeTab === 'excel' && (
          <ExcelSpreadsheetGrid
            info={data.info}
            students={data.students}
            subjects={data.subjects}
            currentMonth={currentMonth}
            months={data.months}
            onSelectMonth={setCurrentMonth}
            grades={data.grades}
            onUpdateScore={handleUpdateScore}
            onBatchUpdateScores={handleBatchUpdateScores}
            onImportStudents={handleImportStudents}
            onOpenPasteModal={() => setIsPasteModalOpen(true)}
          />
        )}

        {/* Tab 3: Student Information Registry */}
        {activeTab === 'students' && (
          <StudentRegistryView
            info={data.info}
            students={data.students}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onOpenEditStudentModal={() => setIsStudentModalOpen(true)}
          />
        )}

        {/* Tab 4: Attendance Tracker */}
        {activeTab === 'attendance' && (
          <AttendanceTracker
            info={data.info}
            students={data.students}
            currentMonth={currentMonth}
            attendanceData={data.attendance || {}}
            onUpdateAttendance={handleUpdateAttendance}
          />
        )}

        {/* Tab 5: Honor Roll & Remedial */}
        {activeTab === 'honor' && (
          <HonorRollAndRemedial
            info={data.info}
            students={data.students}
            subjects={data.subjects}
            currentMonth={currentMonth}
            grades={data.grades}
            studyGroups={data.studyGroups}
          />
        )}

        {/* Tab 6: Report Cards */}
        {activeTab === 'reports' && (
          <ReportCardView
            info={data.info}
            students={data.students}
            subjects={data.subjects}
            currentMonth={currentMonth}
            grades={data.grades}
          />
        )}

        {/* Tab 7: Model School Standards */}
        {activeTab === 'standards' && (
          <ModelSchoolStandardsView
            info={data.info}
            standards={data.modelSchoolStandards}
            students={data.students}
          />
        )}

        {/* Tab 8: Timetable & Green Duty */}
        {activeTab === 'timetable' && (
          <TimetableAndDuty
            info={data.info}
            timetable={data.timetable}
            cleaningDuty={data.cleaningDuty}
          />
        )}
      </main>

      {/* Modals */}
      {isStudentModalOpen && (
        <StudentProfileModal
          students={data.students}
          onSaveStudent={handleSaveStudent}
          onDeleteStudent={handleDeleteStudent}
          onClose={() => setIsStudentModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          info={data.info}
          onSaveInfo={handleSaveInfo}
          onResetDefault={handleResetDefault}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {isPasteModalOpen && (
        <ExcelPasteModal
          currentMonth={currentMonth}
          students={data.students}
          subjects={data.subjects}
          monthGrades={data.grades[currentMonth.id] || {}}
          onBatchUpdateScores={handleBatchUpdateScores}
          onClose={() => setIsPasteModalOpen(false)}
        />
      )}

      {isCertificateModalOpen && (
        <CertificateOfHonorModal
          info={data.info}
          students={data.students}
          rankings={currentMonthRankings}
          currentMonth={currentMonth}
          onClose={() => setIsCertificateModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ប្រព័ន្ធគ្រប់គ្រងបន្ទុកថ្នាក់រៀនស្របតាមស្តង់ដាសាលារៀនគំរូ MoEYS • ក្រសួងអប់រំ យុវជន និងកីឡា
          </span>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">{data.info.schoolName}</span>
            <span>•</span>
            <span>ថ្នាក់ទី {data.info.gradeLevel} "{data.info.classSection}"</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
