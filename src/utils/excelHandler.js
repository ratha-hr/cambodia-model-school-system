import * as XLSX from 'xlsx';
import { calculateRankings } from './gradeCalculations';

/**
 * Export current class data to a formatted MoEYS Excel (.xlsx) file
 */
export function exportToMoEYSExcel(info, students, subjects, currentMonth, gradesForMonth) {
  const wb = XLSX.utils.book_new();

  // 1. Info Sheet
  const infoData = [
    ["ព្រះរាជាណាចក្រកម្ពុជា"],
    ["ជាតិ សាសនា ព្រះមហាក្សត្រ"],
    [""],
    ["ព័ត៌មានទូទៅអំពីបន្ទុកថ្នាក់ - សាលារៀនគំរូ"],
    [""],
    ["មន្ទីរអប់រំ យុវជន និងកីឡា", info.province],
    ["ការិយាល័យអប់រំ យុវជន និងកីឡា", info.district],
    ["ឈ្មោះសាលា", info.schoolName],
    ["កម្រិតថ្នាក់", `${info.gradeLevel} "${info.classSection}"`],
    ["គ្រូបន្ទុកថ្នាក់", `${info.teacherName} (${info.teacherGender})`],
    ["លេខទូរស័ព្ទ", info.teacherPhone],
    ["ឆ្នាំសិក្សា", info.schoolYear],
    ["ចំនួនសិស្សសរុប", `${students.length} នាក់ (ស្រី ${students.filter(s => s.gender === 'ស្រី').length} នាក់)`],
    ["កាលបរិច្ឆេទនាំចេញ", new Date().toLocaleDateString('km-KH')]
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, wsInfo, "ព័ត៌មានទូទៅ");

  // 2. Student Profile Sheet (បញ្ជីប្រវត្តិរូបសិស្ស)
  const profileHeaders = [
    "ល.រ", "អត្តលេខ", "គោត្តនាម-នាម", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", "អាយុ",
    "ទីកន្លែងកំណើត", "អាសយដ្ឋានបច្ចុប្បន្ន", "ឪពុក", "មុខរបរ", "ទូរស័ព្ទឪពុក",
    "ម្តាយ", "មុខរបរ", "ទូរស័ព្ទម្តាយ", "ស្ថានភាពពិសេស"
  ];
  const profileRows = students.map((s, idx) => [
    idx + 1,
    s.id,
    s.name,
    s.gender,
    s.dob,
    s.age,
    s.birthplace,
    s.address,
    s.father,
    s.fatherJob,
    s.fatherPhone,
    s.mother,
    s.motherJob,
    s.motherPhone,
    [s.poor ? 'ក្រីក្រ' : '', s.scholarship ? 'អាហារូបករណ៍' : '', s.orphan ? 'កំព្រា' : ''].filter(Boolean).join(', ')
  ]);
  const wsProfile = XLSX.utils.aoa_to_sheet([profileHeaders, ...profileRows]);
  XLSX.utils.book_append_sheet(wb, wsProfile, "បញ្ជីរាយនាមសិស្ស");

  // 3. Current Month Score Sheet
  const rankings = calculateRankings(students, gradesForMonth, subjects);
  const scoreHeaders = [
    "ល.រ", "អត្តលេខ", "គោត្តនាម-នាម", "ភេទ",
    ...subjects.map(s => `${s.name} (${s.max})`),
    "ពិន្ទុសរុប", "មធ្យមភាគ (៥០)", "ចំណាត់ថ្នាក់", "និទ្ទេស", "លទ្ធផល"
  ];

  const scoreRows = students.map((s, idx) => {
    const sGrades = gradesForMonth[s.id] || {};
    const stats = rankings[s.id] || {};
    const subScores = subjects.map(sub => sGrades[sub.id] !== undefined ? sGrades[sub.id] : "");

    return [
      idx + 1,
      s.id,
      s.name,
      s.gender,
      ...subScores,
      stats.rawTotal || 0,
      stats.average50 || 0,
      stats.rank || "",
      stats.gradeLetter || "",
      stats.isPassed ? "ជាប់" : "ធ្លាក់"
    ];
  });

  const wsScores = XLSX.utils.aoa_to_sheet([
    [`បញ្ជីស្រង់ពិន្ទុ ${currentMonth.name} - ${info.schoolName}`],
    [`ថ្នាក់ ${info.gradeLevel} "${info.classSection}" ឆ្នាំសិក្សា ${info.schoolYear}`],
    [],
    scoreHeaders,
    ...scoreRows
  ]);
  XLSX.utils.book_append_sheet(wb, wsScores, `ពិន្ទុ-${currentMonth.name}`);

  // 4. Honor Roll Sheet (តារាងកិត្តិយស)
  const topStudents = Object.values(rankings)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
    .slice(0, 5);

  const honorHeaders = ["ចំណាត់ថ្នាក់", "អត្តលេខ", "គោត្តនាម-នាម", "ភេទ", "ពិន្ទុសរុប", "មធ្យមភាគ (៥០)", "និទ្ទេស"];
  const honorRows = topStudents.map(item => {
    const student = students.find(s => s.id === item.id) || students.find(s => rankings[s.id]?.rank === item.rank);
    return [
      `ចំណាត់ថ្នាក់ទី ${item.rank}`,
      student ? student.id : '',
      student ? student.name : '',
      student ? student.gender : '',
      item.rawTotal,
      item.average50,
      item.gradeLetter
    ];
  });

  const wsHonor = XLSX.utils.aoa_to_sheet([
    ["តារាងកិត្តិយសសិស្សឆ្នើម (Honor Roll)"],
    [`ប្រចាំ ${currentMonth.name} - ថ្នាក់ ${info.gradeLevel} "${info.classSection}"`],
    [],
    honorHeaders,
    ...honorRows
  ]);
  XLSX.utils.book_append_sheet(wb, wsHonor, "តារាងកិត្តិយស");

  // Save File
  const filename = `បន្ទុកថ្នាក់_${info.gradeLevel}${info.classSection}_${currentMonth.name}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Import students and scores from an uploaded Excel file
 */
export function importFromExcelFile(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Look for profile sheet ('PF', 'Students', 'បញ្ជីសិស្ស')
      let targetSheetName = workbook.SheetNames.find(s => ['PF', 'បញ្ជីរាយនាមសិស្ស', 'សិស្ស', 'Students'].includes(s));
      if (!targetSheetName) targetSheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[targetSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const parsedStudents = [];
      // Search for row containing header like 'គោត្តនាម' or 'ឈ្មោះ' or 'Name'
      let headerRowIdx = -1;
      let nameColIdx = -1;
      let genderColIdx = -1;
      let idColIdx = -1;
      let dobColIdx = -1;

      for (let r = 0; r < Math.min(15, jsonData.length); r++) {
        const row = jsonData[r];
        if (row && Array.isArray(row)) {
          for (let c = 0; c < row.length; c++) {
            const val = String(row[c] || '').toLowerCase();
            if (val.includes('គោត្តនាម') || val.includes('ឈ្មោះ') || val.includes('name')) {
              headerRowIdx = r;
              nameColIdx = c;
            }
            if (val.includes('ភេទ') || val.includes('gender') || val.includes('sex')) {
              genderColIdx = c;
            }
            if (val.includes('អត្តលេខ') || val.includes('id') || val.includes('code')) {
              idColIdx = c;
            }
            if (val.includes('កំណើត') || val.includes('dob') || val.includes('birth')) {
              dobColIdx = c;
            }
          }
        }
        if (nameColIdx !== -1) break;
      }

      if (headerRowIdx === -1 || nameColIdx === -1) {
        // Fallback to row 9 (typical in 7A.xlsm)
        nameColIdx = 4;
        genderColIdx = 5;
        idColIdx = 3;
        dobColIdx = 8;
        headerRowIdx = 8;
      }

      for (let r = headerRowIdx + 1; r < jsonData.length; r++) {
        const row = jsonData[r];
        if (row && row[nameColIdx] && String(row[nameColIdx]).trim() !== '') {
          parsedStudents.push({
            no: parsedStudents.length + 1,
            id: row[idColIdx] ? String(row[idColIdx]).trim() : `20${500 + parsedStudents.length}`,
            name: String(row[nameColIdx]).trim(),
            gender: row[genderColIdx] ? String(row[genderColIdx]).trim() : 'ស្រី',
            dob: row[dobColIdx] ? String(row[dobColIdx]).trim().slice(0, 10) : '2013-01-01',
            age: 12,
            birthplace: '',
            address: '',
            father: '',
            mother: '',
            phone: '',
            conduct: 'ល្អ'
          });
        }
      }

      if (parsedStudents.length === 0) {
        throw new Error('មិនអាចស្វែងរកទិន្នន័យសិស្សក្នុងឯកសារនេះបានទេ');
      }

      onSuccess(parsedStudents, workbook);
    } catch (err) {
      console.error(err);
      onError(err.message || 'កំហុសក្នុងការអានឯកសារ Excel');
    }
  };
  reader.readAsArrayBuffer(file);
}
