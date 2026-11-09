import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  GitBranch, 
  Clock, 
  Key, 
  FolderGit2, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { 
  getGitHubConfig, 
  saveGitHubConfig, 
  testGitHubConnection, 
  fetchDatabaseFromGitHub, 
  saveDatabaseToGitHub, 
  fetchGitHubCommitHistory 
} from '../utils/githubDatabase';

export default function GitHubSyncModal({
  currentData,
  onApplyRemoteData,
  onClose,
  onSyncSuccess
}) {
  const [config, setConfig] = useState(() => getGitHubConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }
  const [commitMessage, setCommitMessage] = useState('');
  const [recentCommits, setRecentCommits] = useState([]);
  const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'config' | 'guide'
  const [copiedToken, setCopiedToken] = useState(false);

  // Load commit history when modal opens
  useEffect(() => {
    if (config.token && config.owner && config.repo) {
      loadCommits();
    }
  }, []);

  const loadCommits = async () => {
    const list = await fetchGitHubCommitHistory(config);
    setRecentCommits(list);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    saveGitHubConfig(config);
    const result = await testGitHubConnection(config);
    setIsTesting(false);
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      loadCommits();
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handlePushToGitHub = async () => {
    if (!config.token) {
      setStatusMessage({ type: 'error', text: 'សូមបញ្ចូល GitHub Personal Access Token ជាមុនសិន!' });
      setActiveTab('config');
      return;
    }

    setIsPushing(true);
    setStatusMessage({ type: 'info', text: 'កំពុងរុញ និង Commit ទិន្នន័យទៅកាន់ GitHub...' });
    saveGitHubConfig(config);

    const msg = commitMessage.trim() || `Update classroom data from web app (${new Date().toLocaleDateString('km-KH')})`;
    const res = await saveDatabaseToGitHub(config, currentData, msg);
    setIsPushing(false);

    if (res.success) {
      const now = new Date().toISOString();
      const updatedConfig = { ...config, lastSyncedAt: now, lastCommitSha: res.commitSha };
      setConfig(updatedConfig);
      saveGitHubConfig(updatedConfig);

      setStatusMessage({ 
        type: 'success', 
        text: `បាន Sync ជោគជ័យទៅកាន់ GitHub! Commit: ${res.commitSha?.substring(0, 7) || 'OK'}` 
      });
      setCommitMessage('');
      loadCommits();
      if (onSyncSuccess) onSyncSuccess(updatedConfig);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handlePullFromGitHub = async () => {
    if (!window.confirm('ការទាញយកទិន្នន័យពី GitHub នឹងជំនួសទិន្នន័យលើ Browser បច្ចុប្បន្ន។ តើអ្នកចង់បន្តទេ?')) {
      return;
    }

    setIsPulling(true);
    setStatusMessage({ type: 'info', text: 'កំពុងទាញយកទិន្នន័យពី GitHub...' });
    saveGitHubConfig(config);

    const res = await fetchDatabaseFromGitHub(config);
    setIsPulling(false);

    if (res.success && res.data) {
      onApplyRemoteData(res.data);
      const now = new Date().toISOString();
      const updatedConfig = { ...config, lastSyncedAt: now };
      setConfig(updatedConfig);
      saveGitHubConfig(updatedConfig);

      setStatusMessage({ 
        type: 'success', 
        text: 'បានទាញយកទិន្នន័យពី GitHub និងដាក់បញ្ចូលក្នុងប្រព័ន្ធដោយជោគជ័យ!' 
      });
      loadCommits();
      if (onSyncSuccess) onSyncSuccess(updatedConfig);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>គ្រប់គ្រង GitHub Database & Hosting Vercel</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Version Controlled
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                ប្រើប្រាស់ GitHub Repository ជាមូលដ្ឋានទិន្នន័យកណ្តាល (Cloud Database)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Sync / ធ្វើសមកាលកម្ម
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ការកំណត់ Token & Repo
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            សៀវភៅណែនាំ Vercel & GitHub
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: SYNC CONTROLS */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {/* Repo summary card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">ឃ្លាំងទិន្នន័យគោលដៅ (Target Database)</span>
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-2 mt-0.5">
                    <FolderGit2 className="w-4 h-4 text-indigo-600" />
                    <span>{config.owner}/{config.repo}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({config.branch})</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                    File: {config.path}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>តេស្តការតភ្ជាប់</span>
                  </button>
                </div>
              </div>

              {/* 2-Way Sync Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Push Card */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                      <ArrowUpFromLine className="w-4 h-4 text-blue-600" />
                      <span>រុញទិន្នន័យទៅ GitHub (Push)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      រក្សាទុកទិន្នន័យសិស្ស ពិន្ទុ និងវត្តមានបច្ចុប្បន្នទាំងអស់ចូលទៅកាន់ GitHub Database។
                    </p>
                    <input
                      type="text"
                      placeholder="សារចំណាំ Commit (ជម្រើស)..."
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-xs mb-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handlePushToGitHub}
                    disabled={isPushing}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    <ArrowUpFromLine className={`w-3.5 h-3.5 ${isPushing ? 'animate-bounce' : ''}`} />
                    <span>{isPushing ? 'កំពុងរុញទិន្នន័យ...' : 'Sync ទៅកាន់ GitHub ឥឡូវនេះ'}</span>
                  </button>
                </div>

                {/* Pull Card */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                      <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                      <span>ទាញយកពី GitHub (Pull)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      ទាញយកទិន្នន័យថ្មីបំផុតពី GitHub មកដាក់ចូលក្នុងប្រព័ន្ធនេះវិញ (ជំនួសទិន្នន័យចាស់)។
                    </p>
                  </div>

                  <button
                    onClick={handlePullFromGitHub}
                    disabled={isPulling}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    <ArrowDownToLine className={`w-3.5 h-3.5 ${isPulling ? 'animate-bounce' : ''}`} />
                    <span>{isPulling ? 'កំពុងទាញយក...' : 'ទាញយកទិន្នន័យពី GitHub'}</span>
                  </button>
                </div>
              </div>

              {/* Commit History */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>ប្រវត្តិ Commit ចុងក្រោយ (Version History)</span>
                  </h4>
                  <button onClick={loadCommits} className="text-slate-500 hover:text-slate-800 text-[11px]">
                    Refresh
                  </button>
                </div>

                {recentCommits.length === 0 ? (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-slate-400 text-xs">
                    មិនទាន់មានប្រវត្តិ Commit ឬមិនទាន់បានតភ្ជាប់ទៅ GitHub ទេ
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {recentCommits.map((c, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 block text-xs">{c.message}</span>
                          <span className="text-[10px] text-slate-500">
                            ដោយ {c.author} • {new Date(c.date).toLocaleString('km-KH')}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-200 text-slate-700">
                          {c.sha}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                💡 <strong>ចំណាំសំខាន់៖</strong> Personal Access Token (PAT) ត្រូវបានរក្សាទុកតែនៅក្នុង Local Storage នៃ Browser របស់អ្នកប៉ុណ្ណោះ គ្មាននរណាម្នាក់អាចមើលឃើញឡើយ។ Token នេះត្រូវមានសិទ្ធិ <code>repo</code> ឬ <code>contents: write</code>។
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    GitHub Personal Access Token (PAT) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      placeholder="github_pat_... ឬ ghp_..."
                      value={config.token}
                      onChange={(e) => setConfig({ ...config, token: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    បង្កើត Token នៅ: GitHub &gt; Settings &gt; Developer Settings &gt; Personal access tokens
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    GitHub Username / Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ឧ. ratha-hr"
                    value={config.owner}
                    onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Repository Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ឧ. cambodia-model-school-system"
                    value={config.repo}
                    onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Branch</label>
                  <input
                    type="text"
                    placeholder="main"
                    value={config.branch}
                    onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Database File Path</label>
                  <input
                    type="text"
                    placeholder="data/classroom_db.json"
                    value={config.path}
                    onChange={(e) => setConfig({ ...config, path: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>សាកល្បងតភ្ជាប់ (Test Connection)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    saveGitHubConfig(config);
                    setStatusMessage({ type: 'success', text: 'បានរក្សាទុកការកំណត់ GitHub រួចរាល់!' });
                    setActiveTab('sync');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>រក្សាទុកការកំណត់</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VERCEL & GITHUB DEPLOYMENT GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-3 leading-relaxed text-slate-700 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 text-white">
                <h4 className="font-bold text-amber-400 text-sm mb-1">
                  របៀប Hosting ទៅកាន់ Vercel និងភ្ជាប់ GitHub Database
                </h4>
                <p className="text-[11px] text-slate-300">
                  អនុវត្តតាមជំហានងាយៗខាងក្រោមដើម្បីឱ្យគេហទំព័រដំណើរការលើអនឡាញ ២៤/៧ ដោយឥតគិតថ្លៃ!
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">1</span>
                    <span>ជំហានទី ១: រុញកូដ (Push) ទៅកាន់ GitHub Repository</span>
                  </h5>
                  <p className="text-[11px] text-slate-600 mb-2">
                    នៅក្នុង Terminal នៃកុំព្យូទ័ររបស់អ្នក រត់ពាក្យបញ្ជាខាងក្រោម៖
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px]">
                    git add .<br/>
                    git commit -m "Deploy modern school management system"<br/>
                    git push origin main
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">2</span>
                    <span>ជំហានទី ២: Hosting ទៅកាន់ Vercel ដោយឥតគិតថ្លៃ</span>
                  </h5>
                  <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                    <li>ចូលទៅកាន់គេហទំព័រ <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">vercel.com</a> ហើយ Login តាមគណនី GitHub របស់អ្នក។</li>
                    <li>ចុចប៊ូតុង <strong>Add New... &gt; Project</strong></li>
                    <li>ជ្រើសរើស Repository <strong>cambodia-model-school-system</strong></li>
                    <li>Vercel នឹងសម្គាល់ឃើញ <strong>Vite Framework</strong> ដោយស្វ័យប្រវត្ត។</li>
                    <li>ចុចប៊ូតុង <strong>Deploy</strong> រួចរង់ចាំត្រឹមតែ ៣០ វិនាទី! អ្នកនឹងទទួលបាន Link គេហទំព័រ (ឧ. <code>https://cambodia-model-school-system.vercel.app</code>)។</li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">3</span>
                    <span>ជំហានទី ៣: បង្កើត GitHub Personal Access Token (PAT) សម្រាប់ Database</span>
                  </h5>
                  <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                    <li>នៅលើ GitHub ចុចលើរូប Profile នៅជ្រុងស្តាំលើ &gt; <strong>Settings</strong></li>
                    <li>អូសចុះក្រោមទៅ <strong>Developer Settings &gt; Personal access tokens &gt; Tokens (classic)</strong></li>
                    <li>ចុច <strong>Generate new token (classic)</strong> ដាក់ឈ្មោះ "Classroom App" ហើយធីកយកប្រអប់ <code>repo</code></li>
                    <li>ចុច <strong>Generate token</strong> រួចចម្លង (Copy) Token នោះមកបិទភ្ជាប់ (Paste) ក្នុងប្រអប់ខាងលើ!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            {config.lastSyncedAt ? `Sync ចុងក្រោយ: ${new Date(config.lastSyncedAt).toLocaleString('km-KH')}` : 'មិនទាន់បានធ្វើ Sync'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition"
          >
            បិទផ្ទាំង (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
