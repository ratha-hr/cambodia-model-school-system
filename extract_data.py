import sys
import openpyxl
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('7A.xlsm', data_only=True)

# 1. School & Class Info from NT
info = {
    "schoolName": "វិទ្យាល័យ ហ៊ុនសែន កំពង់ត្រឡាច",
    "province": "ខេត្តកំពង់ឆ្នាំង",
    "district": "ស្រុកកំពង់ត្រឡាច",
    "gradeLevel": "ថ្នាក់ទី ៧",
    "classSection": "A",
    "teacherName": "ប៉ាន់ ប៊ុនធឿន",
    "teacherGender": "ប្រុស",
    "teacherPhone": "093 486 987 / 089 230 998",
    "schoolYear": "២០២៥ - ២០២៦",
    "principalName": "នាយកសាលា",
    "location": "កំពង់ត្រឡាច"
}

# 2. Extract Students from PF
ws_pf = wb['PF']
students = []
for r in range(10, ws_pf.max_row + 1):
    name_val = ws_pf.cell(r, 5).value
    if name_val and str(name_val).strip() != '':
        no = ws_pf.cell(r, 3).value
        stu_id = str(ws_pf.cell(r, 4).value or '').strip()
        name = str(name_val).strip()
        gender = str(ws_pf.cell(r, 6).value or '').strip()
        dob = str(ws_pf.cell(r, 9).value or '')[:10]
        age = ws_pf.cell(r, 10).value
        school_from = str(ws_pf.cell(r, 11).value or '').strip()
        
        pob_village = str(ws_pf.cell(r, 12).value or '').strip()
        pob_commune = str(ws_pf.cell(r, 13).value or '').strip()
        pob_district = str(ws_pf.cell(r, 14).value or '').strip()
        pob_province = str(ws_pf.cell(r, 15).value or '').strip()
        pob = f"{pob_village}, {pob_commune}, {pob_district}, {pob_province}".strip(', ')
        
        addr_village = str(ws_pf.cell(r, 16).value or '').strip()
        addr_commune = str(ws_pf.cell(r, 17).value or '').strip()
        addr_district = str(ws_pf.cell(r, 18).value or '').strip()
        addr_province = str(ws_pf.cell(r, 19).value or '').strip()
        address = f"{addr_village}, {addr_commune}, {addr_district}, {addr_province}".strip(', ')
        
        orphan = bool(ws_pf.cell(r, 21).value)
        disabled = bool(ws_pf.cell(r, 24).value)
        poor = bool(ws_pf.cell(r, 25).value)
        ethnic = bool(ws_pf.cell(r, 26).value)
        scholarship = bool(ws_pf.cell(r, 27).value)
        
        father = str(ws_pf.cell(r, 28).value or '').strip()
        father_job = str(ws_pf.cell(r, 29).value or '').strip()
        father_phone = str(ws_pf.cell(r, 30).value or '').strip()
        
        mother = str(ws_pf.cell(r, 31).value or '').strip()
        mother_job = str(ws_pf.cell(r, 32).value or '').strip()
        mother_phone = str(ws_pf.cell(r, 33).value or '').strip()
        
        notes = str(ws_pf.cell(r, 34).value or '').strip()

        students.append({
            "no": int(no) if no is not None and str(no).isdigit() else len(students) + 1,
            "id": stu_id or f"20{500+len(students)}",
            "name": name,
            "gender": gender,
            "dob": dob if dob and dob != 'None' else "2013-01-01",
            "age": int(age) if age and str(age).isdigit() else 12,
            "schoolFrom": school_from,
            "birthplace": pob,
            "address": address,
            "father": father,
            "fatherJob": father_job,
            "fatherPhone": father_phone,
            "mother": mother,
            "motherJob": mother_job,
            "motherPhone": mother_phone,
            "phone": father_phone or mother_phone,
            "orphan": orphan,
            "disabled": disabled,
            "poor": poor,
            "ethnic": ethnic,
            "scholarship": scholarship,
            "notes": notes,
            "conduct": "ល្អ"  # Conduct: ល្អ, ល្អណាស់, មធ្យម
        })

# 3. Standard Subjects for Grade 7 (MoEYS Standard Model School)
subjects = [
    {"id": "khmer", "name": "ភាសាខ្មែរ", "short": "ខ្មែរ", "max": 100, "coef": 2, "category": "ស្នូល"},
    {"id": "civics", "name": "សីលធម៌-ពលរដ្ឋ", "short": "សីលធម៌", "max": 50, "coef": 1, "category": "សង្គម"},
    {"id": "history", "name": "ប្រវត្តិវិទ្យា", "short": "ប្រវត្តិ", "max": 50, "coef": 1, "category": "សង្គម"},
    {"id": "geography", "name": "ភូមិវិទ្យា", "short": "ភូមិ", "max": 50, "coef": 1, "category": "សង្គម"},
    {"id": "math", "name": "គណិតវិទ្យា", "short": "គណិត", "max": 100, "coef": 2, "category": "វិទ្យាសាស្ត្រ"},
    {"id": "physics", "name": "រូបវិទ្យា", "short": "រូប", "max": 50, "coef": 1, "category": "វិទ្យាសាស្ត្រ"},
    {"id": "chemistry", "name": "គីមីវិទ្យា", "short": "គីមី", "max": 50, "coef": 1, "category": "វិទ្យាសាស្ត្រ"},
    {"id": "biology", "name": "ជីវវិទ្យា", "short": "ជីវ", "max": 50, "coef": 1, "category": "វិទ្យាសាស្ត្រ"},
    {"id": "earth", "name": "ផែនដីវិទ្យា", "short": "ផែនដី", "max": 50, "coef": 1, "category": "វិទ្យាសាស្ត្រ"},
    {"id": "english", "name": "ភាសាអង់គ្លេស", "short": "អង់គ្លេស", "max": 50, "coef": 1, "category": "ភាសា"},
    {"id": "pe", "name": "អប់រំកាយ", "short": "កាយ", "max": 50, "coef": 1, "category": "ជំនាញ"},
    {"id": "home_agri", "name": "គេហវិទ្យា-កសិកម្ម", "short": "កសិកម្ម", "max": 50, "coef": 1, "category": "ជំនាញ"},
    {"id": "ict", "name": "បច្ចេកវិទ្យា (ICT)", "short": "ICT", "max": 50, "coef": 1, "category": "ជំនាញ"}
]

# 4. Standard Months (MoEYS Academic Calendar)
months = [
    {"id": "m1", "name": "ខែវិច្ឆិកា", "semester": 1},
    {"id": "m2", "name": "ខែធ្នូ", "semester": 1},
    {"id": "m3", "name": "ខែមករា", "semester": 1},
    {"id": "m4", "name": "ខែកុម្ភៈ", "semester": 1},
    {"id": "sem1_exam", "name": "ប្រឡងឆមាសទី១", "semester": 1, "isExam": True},
    {"id": "m5", "name": "ខែមីនា", "semester": 2},
    {"id": "m6", "name": "ខែមេសា", "semester": 2},
    {"id": "m7", "name": "ខែឧសភា", "semester": 2},
    {"id": "m8", "name": "ខែមិថុនា", "semester": 2},
    {"id": "sem2_exam", "name": "ប្រឡងឆមាសទី២", "semester": 2, "isExam": True}
]

# Generate realistic sample scores for Month 1 (វិច្ឆិកា) and Month 2 (ធ្នូ) so teacher has immediate live data
import random
random.seed(42)

grades_data = {}
for m in months:
    grades_data[m["id"]] = {}
    is_active_month = m["id"] in ["m1", "m2"]
    for s in students:
        s_id = s["id"]
        grades_data[m["id"]][s_id] = {}
        if is_active_month:
            # Generate realistic score pattern with high, average, and slow students
            base_skill = random.uniform(0.55, 0.95) if (s["no"] % 7 != 0) else random.uniform(0.35, 0.52)
            for sub in subjects:
                max_sc = sub["max"]
                raw_score = round(max_sc * base_skill + random.uniform(-4, 4), 1)
                raw_score = max(5, min(max_sc, raw_score))
                grades_data[m["id"]][s_id][sub["id"]] = raw_score

# 5. Study Groups (ក្រុមស្វ័យសិក្សា - Standard 1 & 2 of MoEYS Model School)
# In Model School, classes are organized into 5-6 member study groups mixing high achievers with slow learners
study_groups = []
group_count = 10
for i in range(group_count):
    study_groups.append({
        "id": f"g_{i+1}",
        "name": f"ក្រុមទី {i+1} ({['តារាព្រះច័ន្ទ', 'ផ្កាយព្រឹក', 'កុលាបក្រហម', 'បាណន់', 'អង្គរវត្ត', 'ប្រាជ្ញាវៃឆ្លាត', 'មិត្តភាព', 'សាមគ្គីភាព', 'ជ័យជំនះ', 'ក្តីសង្ឃឹម'][i]})",
        "leaderId": students[i]["id"],
        "memberIds": [s["id"] for idx, s in enumerate(students) if idx % group_count == i],
        "subjectFocus": ["គណិតវិទ្យា", "ភាសាខ្មែរ", "រូបវិទ្យា", "អង់គ្លេស"][i % 4],
        "meetingDay": ["ថ្ងៃចន្ទ ម៉ោង ៤-៥", "ថ្ងៃពុធ ម៉ោង ៤-៥", "ថ្ងៃព្រហស្បតិ៍ ម៉ោង ៤-៥", "ថ្ងៃសៅរ៍ ម៉ោង ១០-១១"][i % 4]
    })

# 6. Model School Assessment (ស្តង់ដាសាលារៀនគំរូ ទាំង ៥ ស្តង់ដា)
model_school_standards = [
    {
        "id": "std1",
        "title": "ស្តង់ដាទី ១៖ លទ្ធផលសិក្សារបស់សិស្ស (Student Learning Outcomes)",
        "weight": 25,
        "indicators": [
            {"id": "ind_1_1", "name": "អត្រាសិស្សទទួលបាននិទ្ទេសល្អប្រសើរ (A-C) លើសពី ៦០%", "target": "≥ 60%", "current": "68.5%", "status": "pass", "score": 5},
            {"id": "ind_1_2", "name": "អត្រាត្រួតថ្នាក់ និងបោះបង់ការសិក្សាទាបជាង ២%", "target": "≤ 2%", "current": "0.0%", "status": "pass", "score": 5},
            {"id": "ind_1_3", "name": "ការអនុវត្តកម្មវិធីបំប៉នសិស្សរៀនយឺតជាប្រចាំ", "target": "ប្រចាំសប្តាហ៍", "current": "២ដង/សប្តាហ៍", "status": "pass", "score": 5},
            {"id": "ind_1_4", "name": "ការបង្កើត និងដំណើរការក្រុមស្វ័យសិក្សាសិស្ស", "target": "១០០% សិស្សចូលរួម", "current": "១០ក្រុម (៥៤នាក់)", "status": "pass", "score": 5},
            {"id": "ind_1_5", "name": "ការវាយតម្លៃ និងប្រឡងត្រឹមត្រូវតាមកាលវិភាគក្រសួង", "target": "១០០%", "current": "១០០%", "status": "pass", "score": 5}
        ]
    },
    {
        "id": "std2",
        "title": "ស្តង់ដាទី ២៖ ការបង្រៀន និងរៀន (Teaching and Learning)",
        "weight": 25,
        "indicators": [
            {"id": "ind_2_1", "name": "គ្រូមានកិច្ចតែងការបង្រៀនពេញលេញ និងតាមកាលវិភាគ", "target": "១០០%", "current": "១០០%", "status": "pass", "score": 5},
            {"id": "ind_2_2", "name": "ការប្រើប្រាស់វិធីសាស្ត្របង្រៀនបែបសកម្ម និងផ្តោតលើសិស្ស", "target": "រៀងរាល់ម៉ោង", "current": "អនុវត្តទៀងទាត់", "status": "pass", "score": 5},
            {"id": "ind_2_3", "name": "ការប្រើប្រាស់សម្ភារឧបទេស និងបច្ចេកវិទ្យា (ICT)", "target": "≥ ៣ដង/សប្តាហ៍", "current": "៤ដង/សប្តាហ៍", "status": "pass", "score": 5},
            {"id": "ind_2_4", "name": "ការដាក់ និងកែស្រង់កិច្ចការផ្ទះសិស្សជាប្រចាំ", "target": "ប្រចាំថ្ងៃ", "current": "រៀងរាល់ថ្ងៃ", "status": "pass", "score": 5}
        ]
    },
    {
        "id": "std3",
        "title": "ស្តង់ដាទី ៣៖ ការចូលរួមរបស់សហគមន៍ និងមាតាបិតា (Community & Parents)",
        "weight": 20,
        "indicators": [
            {"id": "ind_3_1", "name": "ការចែកប័ណ្ណព័ត៌មានលទ្ធផលសិក្សាជូនមាតាបិតាប្រចាំខែ", "target": "១០០% សិស្ស", "current": "១០០%", "status": "pass", "score": 5},
            {"id": "ind_3_2", "name": "ការប្រជុំមាតាបិតា ឬអាណាព្យាបាលសិស្សយ៉ាងតិច ៣ដង/ឆ្នាំ", "target": "≥ ៣ដង", "current": "បាន ១ដង (ដើមឆ្នាំ)", "status": "in_progress", "score": 4},
            {"id": "ind_3_3", "name": "ការជូនដំណឹងទាន់ពេលពេលសិស្សអវត្តមាន ឬមានបញ្ហា", "target": "ភ្លាមៗ", "current": "ប្រព័ន្ធទូរស័ព្ទ/Telegram", "status": "pass", "score": 5},
            {"id": "ind_3_4", "name": "ការគាំទ្រសម្ភារ ឬថវិកាពីសហគមន៍សម្រាប់ថ្នាក់រៀន", "target": "មានការចូលរួម", "current": "គណៈកម្មការទ្រទ្រង់ថ្នាក់", "status": "pass", "score": 4}
        ]
    },
    {
        "id": "std4",
        "title": "ស្តង់ដាទី ៤៖ ប្រតិបត្តិការ និងការគ្រប់គ្រងថ្នាក់រៀន (Class Management & Operation)",
        "weight": 15,
        "indicators": [
            {"id": "ind_4_1", "name": "បញ្ជីប្រវត្តិរូបសិស្សពេញលេញ ឌីជីថល និងសៀវភៅក្រដាស", "target": "១០០% សិស្ស", "current": "៥៤នាក់ ពេញលេញ", "status": "pass", "score": 5},
            {"id": "ind_4_2", "name": "បញ្ជីស្រង់វត្តមានសិស្សប្រចាំថ្ងៃ និងតាមដានទៀងទាត់", "target": "ប្រចាំថ្ងៃ", "current": "កត់ត្រា ២ពេល/ថ្ងៃ", "status": "pass", "score": 5},
            {"id": "ind_4_3", "name": "គណៈកម្មការថ្នាក់ (ប្រធានថ្នាក់, អនុប្រធាន, យុវជន) មានសកម្មភាព", "target": "រៀបចំរួច", "current": "ដំណើរការល្អ", "status": "pass", "score": 5},
            {"id": "ind_4_4", "name": "បណ្ណាល័យ ឬជ្រុងអំណានក្នុងថ្នាក់រៀន", "target": "មានសៀវភៅ ≥ ៥០ក្បាល", "current": "មាន ៦៥ក្បាល", "status": "pass", "score": 5}
        ]
    },
    {
        "id": "std5",
        "title": "ស្តង់ដាទី ៥៖ បរិស្ថាន សុខភាព និងអនាម័យ (Classroom Environment & Health)",
        "weight": 15,
        "indicators": [
            {"id": "ind_5_1", "name": "អនាម័យថ្នាក់រៀន តុ កៅអី ក្តារខៀន ស្អាតជានិច្ច និងមានធុងសំរាម", "target": "ស្អាតល្អ", "current": "វេនសម្អាតប្រចាំថ្ងៃ", "status": "pass", "score": 5},
            {"id": "ind_5_2", "name": "ការតុបតែងថ្នាក់រៀនមានពាក្យស្លោក ប្លង់ថ្នាក់ ព័ត៌មានសិក្សា", "target": "មានស្តង់ដា", "current": "តុបតែងគ្រប់ជ្រុង", "status": "pass", "score": 5},
            {"id": "ind_5_3", "name": "ការតាមដានសុខភាពសិស្ស និងអនាម័យផ្ទាល់ខ្លួន", "target": "ទៀងទាត់", "current": "មានប្រអប់ថ្នាំសង្គ្រោះបឋម", "status": "pass", "score": 5},
            {"id": "ind_5_4", "name": "ថ្នាក់រៀនបៃតង មានផើងផ្កា និងខ្យល់អាកាសបរិសុទ្ធ", "target": "បៃតងស្អាត", "current": "ផើងផ្កា ៤ និងសួនមុខថ្នាក់", "status": "pass", "score": 5}
        ]
    }
]

# 7. Timetable (កាលវិភាគប្រចាំសប្តាហ៍)
timetable = [
    {"day": "ចន្ទ", "p1": "ភាសាខ្មែរ", "p2": "ភាសាខ្មែរ", "p3": "គណិតវិទ្យា", "p4": "រូបវិទ្យា", "p5": "អប់រំកាយ"},
    {"day": "អង្គារ", "p1": "គណិតវិទ្យា", "p2": "គណិតវិទ្យា", "p3": "គីមីវិទ្យា", "p4": "ជីវវិទ្យា", "p5": "សីលធម៌"},
    {"day": "ពុធ", "p1": "ភាសាខ្មែរ", "p2": "ប្រវត្តិវិទ្យា", "p3": "ភូមិវិទ្យា", "p4": "អង់គ្លេស", "p5": "ផែនដីវិទ្យា"},
    {"day": "ព្រហស្បតិ៍", "p1": "គណិតវិទ្យា", "p2": "ភាសាខ្មែរ", "p3": "រូបវិទ្យា", "p4": "អង់គ្លេស", "p5": "ICT"},
    {"day": "សុក្រ", "p1": "ជីវវិទ្យា", "p2": "គីមីវិទ្យា", "p3": "សីលធម៌", "p4": "គេហវិទ្យា", "p5": "ប្រវត្តិវិទ្យា"},
    {"day": "សៅរ៍", "p1": "ភាសាខ្មែរ", "p2": "ភូមិវិទ្យា", "p3": "អង់គ្លេស", "p4": "បំប៉នសិស្ស", "p5": "ស្វ័យសិក្សា/អនាម័យ"}
]

# 8. Cleaning Duty (វេនសម្អាតថ្នាក់រៀន)
cleaning_duty = [
    {"day": "ចន្ទ", "group": "ក្រុមទី ១", "members": "កន សុជាតា, កែវ គឹមលាង, ខុន រ៉ានី, ខុន វិច្ឆិកា, ខែម ស្រីណាក់"},
    {"day": "អង្គារ", "group": "ក្រុមទី ២", "members": "គីម វណ្ណា, គឹម ស្រីនាថ, គឿន ប្រាវីដ, ង៉ែត រ៉ាឌី, ចក់ ស៊ីថា"},
    {"day": "ពុធ", "group": "ក្រុមទី ៣", "members": "ចន ពិសិដ្ឋ, ចាប ស្រីម៉ៅ, ជ័យ សុផល, ឈន វាសនា, ឈាន វ៉ាន់នី"},
    {"day": "ព្រហស្បតិ៍", "group": "ក្រុមទី ៤", "members": "ញឹម ចាន់ដារ៉ា, ដារ៉ា សិរី, តាន់ សុគន្ធ, ថន វិចិត្រ, ទិត្យ កល្យាណ"},
    {"day": "សុក្រ", "group": "ក្រុមទី ៥", "members": "ធឿន ពិសី, នូ សុធារិទ្ធ, ប៉ោ ម៉េងហ័រ, ផាន សុភ័ក្ត្រ, ម៉ៅ ពិសិដ្ឋ"},
    {"day": "សៅរ៍", "group": "ក្រុមទី ៦-១០", "members": "សមាជិកទាំងអស់រួមគ្នា សម្អាតទូទៅចុងសប្តាហ៍"}
]

data = {
    "info": info,
    "students": students,
    "subjects": subjects,
    "months": months,
    "grades": grades_data,
    "studyGroups": study_groups,
    "modelSchoolStandards": model_school_standards,
    "timetable": timetable,
    "cleaningDuty": cleaning_duty
}

os.makedirs('src/data', exist_ok=True)
with open('src/data/initialData.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Extracted successfully: {len(students)} students, {len(subjects)} subjects, saved to src/data/initialData.json")
