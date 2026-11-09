import openpyxl
import json
import datetime
import sys

sys.stdout.reconfigure(encoding='utf-8')

def serialize(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.strftime('%Y-%m-%d')
    return obj

wb = openpyxl.load_workbook('7A.xlsm', data_only=True)

# 1. School Info from NT
ws_nt = wb['NT']
info = {
    'schoolName': 'វិទ្យាល័យ ហ៊ុនសែន កំពង់ត្រឡាច',
    'province': 'ខេត្តកំពង់ឆ្នាំង',
    'district': 'ស្រុកកំពង់ត្រឡាច',
    'gradeLevel': 'ថ្នាក់ទី ៧',
    'classSection': 'A',
    'teacherName': 'ប៉ាន់ ប៊ុនធឿន',
    'teacherGender': 'ប្រុស',
    'teacherPhone': '093 486 987 / 089 230 998',
    'schoolYear': '២០២៥ - ២០២៦',
    'principalName': 'នាយកសាលា',
    'location': 'កំពង់ត្រឡាច'
}

# 2. Students from PF
ws_pf = wb['PF']
students = []
for r in range(10, ws_pf.max_row + 1):
    val_no = ws_pf.cell(row=r, column=3).value
    val_name = ws_pf.cell(row=r, column=5).value
    if val_no is not None and val_name:
        pob_parts = [
            ws_pf.cell(row=r, column=12).value,
            ws_pf.cell(row=r, column=13).value,
            ws_pf.cell(row=r, column=14).value,
            ws_pf.cell(row=r, column=15).value
        ]
        pob = ', '.join([str(p).strip() for p in pob_parts if p])

        cur_parts = [
            ws_pf.cell(row=r, column=16).value,
            ws_pf.cell(row=r, column=17).value,
            ws_pf.cell(row=r, column=18).value,
            ws_pf.cell(row=r, column=19).value
        ]
        cur = ', '.join([str(c).strip() for c in cur_parts if c])

        father_name = str(ws_pf.cell(row=r, column=28).value or '').strip()
        father_job = str(ws_pf.cell(row=r, column=29).value or '').strip()
        father_phone = str(ws_pf.cell(row=r, column=30).value or '').strip()

        mother_name = str(ws_pf.cell(row=r, column=31).value or '').strip()
        mother_job = str(ws_pf.cell(row=r, column=32).value or '').strip()
        mother_phone = str(ws_pf.cell(row=r, column=33).value or '').strip()

        primary_phone = father_phone if father_phone and father_phone != '-' else (mother_phone if mother_phone and mother_phone != '-' else '')

        st = {
            'no': int(val_no),
            'id': str(ws_pf.cell(row=r, column=4).value or f'20{500+int(val_no)}'),
            'name': str(val_name).strip(),
            'gender': str(ws_pf.cell(row=r, column=6).value or '').strip(),
            'latin_name': str(ws_pf.cell(row=r, column=8).value or '').strip(),
            'dob': serialize(ws_pf.cell(row=r, column=9).value) or '2013-01-01',
            'age': ws_pf.cell(row=r, column=10).value or 12,
            'schoolFrom': str(ws_pf.cell(row=r, column=11).value or '').strip(),
            'birthplace': pob,
            'address': cur,
            'father': father_name,
            'fatherJob': father_job,
            'fatherPhone': father_phone,
            'mother': mother_name,
            'motherJob': mother_job,
            'motherPhone': mother_phone,
            'phone': primary_phone,
            'orphan': bool(ws_pf.cell(row=r, column=21).value or ws_pf.cell(row=r, column=22).value or ws_pf.cell(row=r, column=23).value),
            'orphanFather': bool(ws_pf.cell(row=r, column=21).value),
            'orphanMother': bool(ws_pf.cell(row=r, column=22).value),
            'orphanBoth': bool(ws_pf.cell(row=r, column=23).value),
            'disabled': bool(ws_pf.cell(row=r, column=24).value),
            'poor': bool(ws_pf.cell(row=r, column=25).value),
            'ethnic': bool(ws_pf.cell(row=r, column=26).value),
            'scholarship': bool(ws_pf.cell(row=r, column=27).value),
            'notes': str(ws_pf.cell(row=r, column=34).value or '').strip(),
            'conduct': 'ល្អ',
            'domain_morals': 'ល្អ',
            'domain_health': 'ល្អ',
            'domain_productivity': 'ល្អ',
            'domain_aesthetic': 'ល្អ'
        }
        students.append(st)

# 3. Teachers from T
ws_t = wb['T']
teachers = []
for r in range(10, ws_t.max_row + 1):
    no = ws_t.cell(row=r, column=3).value
    name = ws_t.cell(row=r, column=4).value
    if no and name:
        teachers.append({
            'no': int(no),
            'name': str(name).strip(),
            'gender': str(ws_t.cell(row=r, column=5).value or '').strip(),
            'subject': str(ws_t.cell(row=r, column=6).value or '').strip(),
            'phone': str(ws_t.cell(row=r, column=7).value or '').strip(),
            'note': str(ws_t.cell(row=r, column=8).value or '').strip()
        })

# 4. Cleaning duty from CL
ws_cl = wb['CL']
cleaning = []
days = ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍']
for idx, day in enumerate(days):
    col = 3 + idx * 3
    members = []
    for r in range(15, ws_cl.max_row+1):
        num = ws_cl.cell(row=r, column=col).value
        name = ws_cl.cell(row=r, column=col+1).value
        role = ws_cl.cell(row=r, column=col+2).value
        if name:
            members.append({
                'no': str(num or '').replace('.','').strip(),
                'name': str(name).strip(),
                'role': str(role or '').strip()
            })
    cleaning.append({
        'day': day,
        'group': f'វេន{day}',
        'members': ', '.join([f"{m['name']} ({m['role']})" for m in members]),
        'memberList': members
    })

# 5. Council & Sub-branches from Co
ws_co = wb['Co']
sub_branches = []
for i in range(6):
    col = 3 + i * 3
    title = ws_co.cell(row=15, column=col).value
    members = []
    for r in range(16, ws_co.max_row+1):
        num = ws_co.cell(row=r, column=col).value
        name = ws_co.cell(row=r, column=col+1).value
        role = ws_co.cell(row=r, column=col+2).value
        if name:
            members.append({
                'no': str(num or '').replace('.','').strip(),
                'name': str(name).strip(),
                'role': str(role or '').strip()
            })
    sub_branches.append({
        'id': f'sub_{i+1}',
        'name': str(title or f'អនុសាខាទី {i+1}').strip(),
        'leader': members[0]['name'] if len(members) > 0 else '',
        'viceLeader': members[1]['name'] if len(members) > 1 else '',
        'members': members
    })

council = {
    'advisor': 'ប៉ាន់ ប៊ុនធឿន',
    'president': 'លី គឹមហេង',
    'vicePresident1': 'ហ៊ាន អូនវឌ្ឃនៈ',
    'vicePresident2': 'ទៀង រក្សា',
    'subBranches': sub_branches
}

# 6. Inventory from F
ws_f = wb['F']
inventory = []
for r in range(10, ws_f.max_row + 1):
    no = ws_f.cell(row=r, column=3).value
    item = ws_f.cell(row=r, column=4).value
    qty = ws_f.cell(row=r, column=5).value
    note = ws_f.cell(row=r, column=6).value
    if no and item:
        inventory.append({
            'no': int(no),
            'item': str(item).strip(),
            'quantity': int(qty) if qty else 0,
            'unit': 'គ្រឿង/ផ្ទាំង',
            'status': 'ល្អ',
            'note': str(note or '').strip()
        })

# 7. Class funds from Sheet1 (2)
ws_fund = wb['Sheet1 (2)']
class_funds = []
total_fund = 0
for r in range(8, ws_fund.max_row + 1):
    f_no = ws_fund.cell(row=r, column=1).value
    f_name = ws_fund.cell(row=r, column=2).value
    f_amount = ws_fund.cell(row=r, column=8).value
    if f_name:
        amt = int(f_amount) if f_amount and isinstance(f_amount, (int, float)) else 0
        total_fund += amt
        class_funds.append({
            'no': int(f_no) if f_no else len(class_funds) + 1,
            'studentName': str(f_name).strip(),
            'father': str(ws_fund.cell(row=r, column=4).value or '').strip(),
            'fatherPhone': str(ws_fund.cell(row=r, column=5).value or '').strip(),
            'mother': str(ws_fund.cell(row=r, column=6).value or '').strip(),
            'motherPhone': str(ws_fund.cell(row=r, column=7).value or '').strip(),
            'amount': amt,
            'paid': amt > 0,
            'date': '2025-11-15',
            'note': str(ws_fund.cell(row=r, column=9).value or '').strip()
        })

# 8. Nutrition & Health from Food
ws_food = wb['Food']
nutrition_list = []
for r in range(10, ws_food.max_row + 1):
    f_no = ws_food.cell(row=r, column=3).value
    f_name = ws_food.cell(row=r, column=4).value
    if f_name:
        nutrition_list.append({
            'no': int(f_no) if f_no else len(nutrition_list) + 1,
            'name': str(f_name).strip(),
            'gender': str(ws_food.cell(row=r, column=5).value or '').strip(),
            'age': ws_food.cell(row=r, column=6).value or 12,
            'weight': ws_food.cell(row=r, column=7).value or 38,
            'height': ws_food.cell(row=r, column=8).value or 1.45,
            'bmi': ws_food.cell(row=r, column=9).value or 18.1,
            'status': str(ws_food.cell(row=r, column=10).value or 'ទម្ងន់សមស្រប').strip(),
            'note': str(ws_food.cell(row=r, column=11).value or '').strip()
        })

# 9. Weekly and Yearly Action Plans from Table1 and Table2
ws_tab1 = wb['Table1']
action_plan_yearly = []
for r in range(8, 20):
    a_no = ws_tab1.cell(row=r, column=1).value
    a_act = ws_tab1.cell(row=r, column=2).value
    if a_act:
        action_plan_yearly.append({
            'no': int(a_no) if a_no else len(action_plan_yearly) + 1,
            'activity': str(a_act).strip(),
            'months': [bool(ws_tab1.cell(row=r, column=c).value) for c in range(3, 13)]
        })

ws_tab2 = wb['Table2']
action_plan_weekly = []
for r in range(11, 22):
    w_no = ws_tab2.cell(row=r, column=1).value
    w_act = ws_tab2.cell(row=r, column=2).value
    if w_act:
        action_plan_weekly.append({
            'no': int(w_no) if w_no else len(action_plan_weekly) + 1,
            'activity': str(w_act).strip(),
            'days': {
                'mon': str(ws_tab2.cell(row=r, column=3).value or '').strip(),
                'tue': str(ws_tab2.cell(row=r, column=4).value or '').strip(),
                'wed': str(ws_tab2.cell(row=r, column=5).value or '').strip(),
                'thu': str(ws_tab2.cell(row=r, column=6).value or '').strip(),
                'fri': str(ws_tab2.cell(row=r, column=7).value or '').strip(),
                'sat': str(ws_tab2.cell(row=r, column=8).value or '').strip(),
            }
        })

# 10. Existing initialData keys (subjects, months, standards, etc.)
with open('src/data/initialData.json', encoding='utf-8') as f:
    existing = json.load(f)

# Combine everything
full_data = {
    'info': info,
    'students': students,
    'subjects': existing.get('subjects', []),
    'months': existing.get('months', []),
    'grades': existing.get('grades', {}),
    'teachers': teachers,
    'council': council,
    'cleaningDuty': cleaning,
    'timetable': existing.get('timetable', []),
    'inventory': inventory,
    'classFunds': {
        'totalBudget': total_fund,
        'targetBudget': 2000000,
        'records': class_funds
    },
    'nutrition': nutrition_list,
    'actionPlans': {
        'yearly': action_plan_yearly,
        'weekly': action_plan_weekly
    },
    'modelSchoolStandards': existing.get('modelSchoolStandards', []),
    'studyGroups': sub_branches # Map study groups directly to the 6 sub-branches
}

with open('src/data/initialData.json', 'w', encoding='utf-8') as f:
    json.dump(full_data, f, ensure_ascii=False, indent=2)

print('Updated src/data/initialData.json with rich data from 7A.xlsm!')
print(f'Students: {len(students)}, Teachers: {len(teachers)}, Inventory: {len(inventory)}, Fund contributors: {len(class_funds)}')
