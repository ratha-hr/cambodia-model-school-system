/**
 * MoEYS Cambodia Standard Grading Calculation Utilities
 * ស្តង់ដាគណនាពិន្ទុ និងចំណាត់ថ្នាក់សាលារៀនគំរូ នៃក្រសួងអប់រំ យុវជន និងកីឡា
 */

export function calculateStudentScores(student, gradesForMonth, subjects) {
  const studentGrades = gradesForMonth[student.id] || {};
  let rawTotal = 0;
  let weightedTotal = 0;
  let maxPossibleRaw = 0;
  let maxPossibleWeighted = 0;
  let filledSubjectsCount = 0;

  subjects.forEach(sub => {
    const val = studentGrades[sub.id];
    const score = (val !== undefined && val !== null && val !== '') ? parseFloat(val) : null;
    const coef = sub.coef || 1;
    const max = sub.max || 50;

    maxPossibleRaw += max;
    maxPossibleWeighted += (max * coef);

    if (score !== null && !isNaN(score)) {
      rawTotal += score;
      weightedTotal += (score * coef);
      filledSubjectsCount++;
    }
  });

  // Percentage based on total possible raw
  const percentage = maxPossibleRaw > 0 ? (rawTotal / maxPossibleRaw) * 100 : 0;
  // Secondary school MoEYS average is typically scaled to base 50 (passing is 25.00)
  const average50 = (percentage / 100) * 50;
  // Scaled to base 10 (out of 10)
  const average10 = (percentage / 100) * 10;

  // Grade classification according to MoEYS standards
  let gradeLetter = 'F';
  let gradeLabelKh = 'ធ្លាក់';
  let gradeColor = 'text-red-700 bg-red-50 border-red-300';

  if (percentage >= 85) {
    gradeLetter = 'A';
    gradeLabelKh = 'ល្អប្រសើរ';
    gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
  } else if (percentage >= 75) {
    gradeLetter = 'B';
    gradeLabelKh = 'ល្អណាស់';
    gradeColor = 'text-blue-700 bg-blue-50 border-blue-300';
  } else if (percentage >= 65) {
    gradeLetter = 'C';
    gradeLabelKh = 'ល្អ';
    gradeColor = 'text-teal-700 bg-teal-50 border-teal-300';
  } else if (percentage >= 55) {
    gradeLetter = 'D';
    gradeLabelKh = 'ល្អបង្គួរ';
    gradeColor = 'text-amber-700 bg-amber-50 border-amber-300';
  } else if (percentage >= 50) {
    gradeLetter = 'E';
    gradeLabelKh = 'មធ្យម';
    gradeColor = 'text-orange-700 bg-orange-50 border-orange-300';
  } else {
    gradeLetter = 'F';
    gradeLabelKh = 'ធ្លាក់ (ខ្សោយ)';
    gradeColor = 'text-red-700 bg-red-50 border-red-300';
  }

  const isPassed = percentage >= 50;
  const isSlowLearner = percentage < 50;

  return {
    rawTotal: Math.round(rawTotal * 10) / 10,
    weightedTotal: Math.round(weightedTotal * 10) / 10,
    average50: Math.round(average50 * 100) / 100,
    average10: Math.round(average10 * 100) / 100,
    percentage: Math.round(percentage * 10) / 10,
    maxPossibleRaw,
    filledSubjectsCount,
    totalSubjects: subjects.length,
    gradeLetter,
    gradeLabelKh,
    gradeColor,
    isPassed,
    isSlowLearner
  };
}

/**
 * Calculate Rankings for all students for a given month
 */
export function calculateRankings(students, gradesForMonth, subjects) {
  const calculatedList = students.map(student => {
    const stats = calculateStudentScores(student, gradesForMonth, subjects);
    return {
      student,
      stats
    };
  });

  // Sort descending by rawTotal
  calculatedList.sort((a, b) => b.stats.rawTotal - a.stats.rawTotal);

  // Assign ranks with tie handling
  let currentRank = 1;
  const rankedMap = {};

  calculatedList.forEach((item, index) => {
    if (index > 0 && item.stats.rawTotal === calculatedList[index - 1].stats.rawTotal) {
      item.rank = calculatedList[index - 1].rank;
    } else {
      item.rank = currentRank;
    }
    currentRank++;
    rankedMap[item.student.id] = {
      ...item.stats,
      rank: item.rank
    };
  });

  return rankedMap;
}

/**
 * Calculate Semester Results (ឆមាសទី១ ឬ ឆមាសទី២)
 * According to MoEYS: Semester average is computed from monthly averages + semester exam
 */
export function calculateSemesterResults(students, subjects, allGrades, months, semesterNum = 1) {
  const semMonths = months.filter(m => m.semester === semesterNum);
  
  const results = students.map(student => {
    const monthlyAvgs = [];
    semMonths.forEach(m => {
      const monthGrades = allGrades[m.id] || {};
      const scores = calculateStudentScores(student, monthGrades, subjects);
      if (scores.filledSubjectsCount > 0) {
        monthlyAvgs.push({
          monthId: m.id,
          monthName: m.name,
          isExam: m.isExam,
          average50: scores.average50,
          rawTotal: scores.rawTotal
        });
      }
    });

    // Compute semester average
    let semAvg50 = 0;
    if (monthlyAvgs.length > 0) {
      const sum = monthlyAvgs.reduce((acc, curr) => acc + curr.average50, 0);
      semAvg50 = Math.round((sum / monthlyAvgs.length) * 100) / 100;
    }

    const percentage = (semAvg50 / 50) * 100;
    let gradeLetter = 'F';
    let gradeLabelKh = 'ធ្លាក់';
    if (percentage >= 85) { gradeLetter = 'A'; gradeLabelKh = 'ល្អប្រសើរ'; }
    else if (percentage >= 75) { gradeLetter = 'B'; gradeLabelKh = 'ល្អណាស់'; }
    else if (percentage >= 65) { gradeLetter = 'C'; gradeLabelKh = 'ល្អ'; }
    else if (percentage >= 55) { gradeLetter = 'D'; gradeLabelKh = 'ល្អបង្គួរ'; }
    else if (percentage >= 50) { gradeLetter = 'E'; gradeLabelKh = 'មធ្យម'; }

    return {
      student,
      monthlyAvgs,
      semAvg50,
      percentage: Math.round(percentage * 10) / 10,
      gradeLetter,
      gradeLabelKh,
      isPassed: semAvg50 >= 25.0
    };
  });

  // Sort and rank
  results.sort((a, b) => b.semAvg50 - a.semAvg50);
  let rank = 1;
  results.forEach((item, idx) => {
    if (idx > 0 && item.semAvg50 === results[idx - 1].semAvg50) {
      item.rank = results[idx - 1].rank;
    } else {
      item.rank = rank;
    }
    rank++;
  });

  return results;
}

/**
 * Calculate Annual Results (លទ្ធផលប្រចាំឆ្នាំ និងការសម្រេចឡើងថ្នាក់)
 * Annual Average = (Sem 1 Avg + Sem 2 Avg) / 2
 */
export function calculateAnnualResults(students, subjects, allGrades, months) {
  const sem1 = calculateSemesterResults(students, subjects, allGrades, months, 1);
  const sem2 = calculateSemesterResults(students, subjects, allGrades, months, 2);

  const sem1Map = {};
  sem1.forEach(s => { sem1Map[s.student.id] = s; });
  const sem2Map = {};
  sem2.forEach(s => { sem2Map[s.student.id] = s; });

  const annualList = students.map(student => {
    const s1 = sem1Map[student.id] || { semAvg50: 0 };
    const s2 = sem2Map[student.id] || { semAvg50: 0 };
    
    let annualAvg50 = 0;
    if (s1.semAvg50 > 0 && s2.semAvg50 > 0) {
      annualAvg50 = Math.round(((s1.semAvg50 + s2.semAvg50) / 2) * 100) / 100;
    } else {
      annualAvg50 = s1.semAvg50 || s2.semAvg50 || 0;
    }

    const percentage = (annualAvg50 / 50) * 100;
    let gradeLetter = 'F';
    let gradeLabelKh = 'ធ្លាក់';
    if (percentage >= 85) { gradeLetter = 'A'; gradeLabelKh = 'ល្អប្រសើរ'; }
    else if (percentage >= 75) { gradeLetter = 'B'; gradeLabelKh = 'ល្អណាស់'; }
    else if (percentage >= 65) { gradeLetter = 'C'; gradeLabelKh = 'ល្អ'; }
    else if (percentage >= 55) { gradeLetter = 'D'; gradeLabelKh = 'ល្អបង្គួរ'; }
    else if (percentage >= 50) { gradeLetter = 'E'; gradeLabelKh = 'មធ្យម'; }

    const isPassed = annualAvg50 >= 25.0; // MoEYS standard pass threshold

    return {
      student,
      sem1Avg50: s1.semAvg50,
      sem2Avg50: s2.semAvg50,
      annualAvg50,
      percentage: Math.round(percentage * 10) / 10,
      gradeLetter,
      gradeLabelKh,
      isPassed,
      decision: isPassed ? 'ឡើងថ្នាក់' : 'ត្រួតថ្នាក់' // Promoted or Repeat
    };
  });

  // Sort by annual average
  annualList.sort((a, b) => b.annualAvg50 - a.annualAvg50);
  let rank = 1;
  annualList.forEach((item, idx) => {
    if (idx > 0 && item.annualAvg50 === annualList[idx - 1].annualAvg50) {
      item.rank = annualList[idx - 1].rank;
    } else {
      item.rank = rank;
    }
    rank++;
  });

  return annualList;
}

/**
 * Format Khmer Numbers
 */
export function toKhmerNum(num) {
  if (num === null || num === undefined || isNaN(num)) return '';
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num.toString().replace(/\d/g, d => khmerDigits[parseInt(d, 10)]);
}

/**
 * Copy Full Table Data to Clipboard in TSV format (Excel ready)
 */
export async function copyTableToClipboard(students, subjects, currentMonth, gradesForMonth, rankings) {
  const headers = [
    "ល.រ", "អត្តលេខ", "គោត្តនាម-នាម", "ភេទ",
    ...subjects.map(s => `${s.name} (${s.max})`),
    "ពិន្ទុសរុប", "មធ្យមភាគ (៥០)", "ចំណាត់ថ្នាក់", "និទ្ទេស", "លទ្ធផល"
  ];

  const rows = students.map((s, idx) => {
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

  const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\r\n');

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsv);
      return true;
    }
    // Fallback for environments without direct clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = tsv;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Copy Only Scores Matrix to Clipboard (Excel ready)
 */
export async function copyScoresToClipboard(students, subjects, gradesForMonth) {
  const headers = subjects.map(s => s.name);
  const rows = students.map(s => {
    const sGrades = gradesForMonth[s.id] || {};
    return subjects.map(sub => sGrades[sub.id] !== undefined ? sGrades[sub.id] : "").join('\t');
  });

  const tsv = [headers.join('\t'), ...rows].join('\r\n');

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsv);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = tsv;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Parse raw text pasted from Microsoft Excel (TSV / CSV format)
 */
export function parsePastedTSV(pastedText) {
  if (!pastedText || !pastedText.trim()) return [];
  
  // Normalize line breaks
  const lines = pastedText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  return lines.map(line => {
    // Check if line is tab separated (Excel default) or comma separated
    if (line.includes('\t')) {
      return line.split('\t').map(c => c.trim().replace(/^["']|["']$/g, ''));
    } else if (line.includes(',')) {
      return line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    } else {
      return [line.trim()];
    }
  });
}
