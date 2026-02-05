// Type definition for the exposed Electron API
declare global {
  interface Window {
    electronAPI: {
      getApis: (search: string) => Promise<any[]>;
      saveApi: (api: any) => Promise<boolean>;
      deleteApi: (id: number) => Promise<boolean>;
      getCreds: (search: string) => Promise<any[]>;
      saveCred: (cred: any) => Promise<boolean>;
      deleteCred: (id: number) => Promise<boolean>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<boolean>;
      getSessions: () => Promise<any[]>;
      saveSession: (session: any) => Promise<boolean>;
      deleteSession: (id: string) => Promise<boolean>;
    };
  }
}

const checkElectron = () => {
  if (!window.electronAPI) {
    // console.warn("Running in browser mode, using localStorage as fallback.");
    return false;
  }
  return true;
};

// LocalStorage helpers
const LS_KEYS = {
  APIS: 'app_apis',
   CREDS: 'app_creds',
   SETTINGS: 'app_settings',
   CHAT_HISTORY: 'app_chat_history',
   SESSIONS: 'app_chat_sessions'
 };

const getLS = (key: string, defaultVal: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setLS = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
  return true;
};

export const db = {
  getApis: async (search: string = "") => {
    if (checkElectron()) return await window.electronAPI.getApis(search);
    // Fallback
    const apis = getLS(LS_KEYS.APIS, []);
    if (!search) return apis;
    return apis.filter((api: any) => 
      api.name?.toLowerCase().includes(search.toLowerCase()) || 
      api.url?.toLowerCase().includes(search.toLowerCase())
    );
  },
  saveApi: async (api: any) => {
    if (checkElectron()) return await window.electronAPI.saveApi(api);
    // Fallback
    const apis = getLS(LS_KEYS.APIS, []);
    const idx = apis.findIndex((a: any) => a.id === api.id);
    if (idx >= 0) {
      apis[idx] = api;
    } else {
      api.id = Date.now(); // Generate ID
      apis.push(api);
    }
    return setLS(LS_KEYS.APIS, apis);
  },
  deleteApi: async (id: number) => {
    if (checkElectron()) return await window.electronAPI.deleteApi(id);
    // Fallback
    const apis = getLS(LS_KEYS.APIS, []);
    const newApis = apis.filter((a: any) => a.id !== id);
    return setLS(LS_KEYS.APIS, newApis);
  },
  getCreds: async (search: string = "") => {
    if (checkElectron()) return await window.electronAPI.getCreds(search);
    // Fallback
    const creds = getLS(LS_KEYS.CREDS, []);
    if (!search) return creds;
    return creds.filter((c: any) => 
      c.username?.toLowerCase().includes(search.toLowerCase()) || 
      c.service?.toLowerCase().includes(search.toLowerCase())
    );
  },
  saveCred: async (cred: any) => {
    if (checkElectron()) return await window.electronAPI.saveCred(cred);
    // Fallback
    const creds = getLS(LS_KEYS.CREDS, []);
    const idx = creds.findIndex((c: any) => c.id === cred.id);
    if (idx >= 0) {
      creds[idx] = cred;
    } else {
      cred.id = Date.now();
      creds.push(cred);
    }
    return setLS(LS_KEYS.CREDS, creds);
  },
  deleteCred: async (id: number) => {
    if (checkElectron()) return await window.electronAPI.deleteCred(id);
    // Fallback
    const creds = getLS(LS_KEYS.CREDS, []);
    const newCreds = creds.filter((c: any) => c.id !== id);
    return setLS(LS_KEYS.CREDS, newCreds);
  },
  getSettings: async () => {
    if (checkElectron()) return await window.electronAPI.getSettings();
    // Fallback
    return getLS(LS_KEYS.SETTINGS, {});
  },
  saveSettings: async (settings: any) => {
    if (checkElectron()) return await window.electronAPI.saveSettings(settings);
    // Fallback
    // Merge with existing settings
    const current = getLS(LS_KEYS.SETTINGS, {});
    return setLS(LS_KEYS.SETTINGS, { ...current, ...settings });
  },
  // Chat Sessions
  getSessions: async () => {
    if (checkElectron()) return await window.electronAPI.getSessions();
    return getLS(LS_KEYS.SESSIONS, []);
  },
  saveSession: async (session: any) => {
    if (checkElectron()) return await window.electronAPI.saveSession(session);
    const sessions = getLS(LS_KEYS.SESSIONS, []);
    const idx = sessions.findIndex((s: any) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
    }
    return setLS(LS_KEYS.SESSIONS, sessions);
  },
  deleteSession: async (id: string) => {
    if (checkElectron()) return await window.electronAPI.deleteSession(id);
    const sessions = getLS(LS_KEYS.SESSIONS, []);
    const newSessions = sessions.filter((s: any) => s.id !== id);
    return setLS(LS_KEYS.SESSIONS, newSessions);
  },
  // Chat History (Legacy support)
  getChatHistory: async () => {
    // We can use settings or a dedicated store. Since IPC might not have this method yet,
    // we should implement it via IPC if possible, or just use localStorage for now as user requested.
    // However, to keep it consistent, if we are in Electron, we might want to save it to a file.
    // But the user said "temporarily not packaging for desktop", implying they might be using web mode.
    // Let's use localStorage for chat history regardless of platform for now, 
    // or if electronAPI has it (it doesn't seem to based on types).
    // To support Electron later, we should probably add it to preload/main, but for now:
    return getLS(LS_KEYS.CHAT_HISTORY, []);
  },
  saveChatHistory: async (messages: any[]) => {
    return setLS(LS_KEYS.CHAT_HISTORY, messages);
  }
};
