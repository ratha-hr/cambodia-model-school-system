with open('src/components/DashboardView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
old_imp = "  ClipboardPaste,\n  PhoneCall\n} from 'lucide-react';"
new_imp = "  ClipboardPaste,\n  PhoneCall,\n  FolderGit2,\n  Landmark\n} from 'lucide-react';"
if old_imp in content:
    content = content.replace(old_imp, new_imp)

# 2. Update props
old_props = "  onOpenStudentModal,\n  attendanceRecords = {}\n}) {"
new_props = "  onOpenStudentModal,\n  onOpenGitHubSync,\n  attendanceRecords = {}\n}) {"
if old_props in content:
    content = content.replace(old_props, new_props)

# 3. Add buttons in Hero
old_btn = "<button\n              onClick={() => onNavigateTab('excel')}"
new_btn = """<button
              onClick={() => onNavigateTab('classroom')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <Landmark className="w-4 h-4" />
              <span>ការងារបន្ទុកថ្នាក់</span>
            </button>

            {onOpenGitHubSync && (
              <button
                onClick={onOpenGitHubSync}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 shadow-md transition transform hover:-translate-y-0.5"
              >
                <FolderGit2 className="w-4 h-4 text-emerald-400" />
                <span>GitHub Database</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('excel')}"""

if old_btn in content:
    content = content.replace(old_btn, new_btn)

with open('src/components/DashboardView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('DashboardView updated!')
