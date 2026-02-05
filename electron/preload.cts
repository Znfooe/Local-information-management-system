const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loading (CJS)...');

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    getApis: (search: any) => ipcRenderer.invoke('get-apis', search),
    saveApi: (api: any) => ipcRenderer.invoke('save-api', api),
    deleteApi: (id: any) => ipcRenderer.invoke('delete-api', id),
    getCreds: (search: any) => ipcRenderer.invoke('get-creds', search),
    saveCred: (cred: any) => ipcRenderer.invoke('save-cred', cred),
    deleteCred: (id: any) => ipcRenderer.invoke('delete-cred', id),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
    getSessions: () => ipcRenderer.invoke('get-sessions'),
    saveSession: (session: any) => ipcRenderer.invoke('save-session', session),
    deleteSession: (id: any) => ipcRenderer.invoke('delete-session', id),
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
  });
  console.log('Preload script exposed electronAPI');
} catch (error) {
  console.error('Failed to expose electronAPI:', error);
}