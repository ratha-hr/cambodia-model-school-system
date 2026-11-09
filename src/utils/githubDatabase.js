/**
 * GitHub Database Integration for Cambodia Model School Management System
 * Uses GitHub REST API v3 as a persistent, version-controlled JSON Database.
 */

const CONFIG_STORAGE_KEY = 'moeys_github_db_config';

export function getGitHubConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading GitHub config', e);
  }
  return {
    token: '',
    owner: 'ratha-hr',
    repo: 'cambodia-model-school-system',
    branch: 'main',
    path: 'data/classroom_db.json',
    autoSync: false,
    lastSyncedAt: null,
    lastCommitSha: null
  };
}

export function saveGitHubConfig(config) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving GitHub config', e);
  }
}

/**
 * Robust Unicode (Khmer) string to Base64 encoder
 */
export function toBase64Unicode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Robust Base64 to Unicode (Khmer) string decoder
 */
export function fromBase64Unicode(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Test connection to GitHub Repository
 */
export async function testGitHubConnection(config) {
  const { token, owner, repo } = config;
  if (!owner || !repo) {
    return { success: false, message: 'សូមបញ្ចូលឈ្មោះម្ចាស់ (Owner) និងឈ្មោះឃ្លាំង (Repository)' };
  }

  const headers = {
    Accept: 'application/vnd.github.v3+json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}`, {
      headers
    });

    if (res.status === 200) {
      const data = await res.json();
      return {
        success: true,
        message: `ការតភ្ជាប់បានជោគជ័យ! ឃ្លាំង: ${data.full_name} (${data.private ? 'ឯកជន/Private' : 'សាធារណៈ/Public'})`,
        repo: data
      };
    } else if (res.status === 401) {
      return { success: false, message: 'កំហុស Token: Token មិនត្រឹមត្រូវ ឬផុតកំណត់' };
    } else if (res.status === 404) {
      return { success: false, message: 'រកមិនឃើញ Repository នេះនៅលើ GitHub ទេ (ឬ Token គ្មានសិទ្ធិមើល repo ឯកជន)' };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || `កំហុសពី GitHub API (Status: ${res.status})` };
    }
  } catch (e) {
    return { success: false, message: `មិនអាចភ្ជាប់ទៅកាន់ GitHub បានទេ: ${e.message}` };
  }
}

/**
 * Fetch database file from GitHub
 */
export async function fetchDatabaseFromGitHub(config) {
  const { token, owner, repo, branch = 'main', path = 'data/classroom_db.json' } = config;
  if (!owner || !repo) {
    return { success: false, message: 'ព័ត៌មាន GitHub មិនទាន់គ្រប់គ្រាន់' };
  }

  const headers = {
    Accept: 'application/vnd.github.v3+json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  try {
    const url = `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/contents/${path.trim()}?ref=${encodeURIComponent(branch.trim())}`;
    const res = await fetch(url, { headers });

    if (res.status === 200) {
      const json = await res.json();
      const content = fromBase64Unicode(json.content.replace(/\n/g, ''));
      const parsedData = JSON.parse(content);
      return {
        success: true,
        data: parsedData,
        sha: json.sha,
        size: json.size,
        message: 'ទាញយកទិន្នន័យពី GitHub បានជោគជ័យ'
      };
    } else if (res.status === 404) {
      return {
        success: false,
        notFound: true,
        message: 'ឯកសារទិន្នន័យមិនទាន់មាននៅលើ GitHub នៅឡើយទេ។ អ្នកអាចធ្វើការ Sync រុញទិន្នន័យដំបូងឡើងទៅបាន!'
      };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || `កំហុស Status ${res.status}` };
    }
  } catch (e) {
    return { success: false, message: `កំហុសក្នុងការទាញយកទិន្នន័យ: ${e.message}` };
  }
}

/**
 * Save / Commit database file to GitHub
 */
export async function saveDatabaseToGitHub(config, appData, commitMessage) {
  const { token, owner, repo, branch = 'main', path = 'data/classroom_db.json' } = config;
  if (!token) {
    return { success: false, message: 'សូមបញ្ចូល GitHub Personal Access Token ដើម្បីអាចកែប្រែ ឬ Sync ទិន្នន័យបាន!' };
  }
  if (!owner || !repo) {
    return { success: false, message: 'សូមបំពេញ Owner និង Repository' };
  }

  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const cleanBranch = branch.trim();
  const cleanPath = path.trim();
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token.trim()}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Check existing SHA first
    let existingSha = null;
    const checkRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${cleanPath}?ref=${encodeURIComponent(cleanBranch)}`,
      { headers }
    );
    if (checkRes.status === 200) {
      const checkJson = await checkRes.json();
      existingSha = checkJson.sha;
    }

    // 2. Prepare payload
    const jsonString = JSON.stringify(appData, null, 2);
    const base64Content = toBase64Unicode(jsonString);

    const defaultMsg = `Update classroom database (${new Date().toLocaleString('km-KH')})`;
    const body = {
      message: commitMessage || defaultMsg,
      content: base64Content,
      branch: cleanBranch
    };
    if (existingSha) {
      body.sha = existingSha;
    }

    // 3. Put content (Create or Update)
    const putRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${cleanPath}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      }
    );

    if (putRes.status === 200 || putRes.status === 201) {
      const resJson = await putRes.json();
      return {
        success: true,
        sha: resJson.content?.sha,
        commitSha: resJson.commit?.sha,
        message: 'បានរក្សាទុក និង Sync ទៅកាន់ GitHub Database រួចរាល់ដោយជោគជ័យ!'
      };
    } else {
      const err = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: err.message || `កំហុសពី GitHub API (Status: ${putRes.status})`
      };
    }
  } catch (e) {
    return { success: false, message: `កំហុសក្នុងការ Sync: ${e.message}` };
  }
}

/**
 * Fetch recent commit history for the database file
 */
export async function fetchGitHubCommitHistory(config) {
  const { token, owner, repo, path = 'data/classroom_db.json' } = config;
  if (!owner || !repo) return [];

  const headers = {
    Accept: 'application/vnd.github.v3+json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/commits?path=${encodeURIComponent(path.trim())}&per_page=8`,
      { headers }
    );
    if (res.status === 200) {
      const data = await res.json();
      return data.map(c => ({
        sha: c.sha.substring(0, 7),
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
        url: c.html_url
      }));
    }
  } catch (e) {
    console.error('Error fetching commit history', e);
  }
  return [];
}
