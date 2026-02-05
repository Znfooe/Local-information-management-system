"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loading (CJS)...');
try {
    contextBridge.exposeInMainWorld('electronAPI', {
        getApis: (search) => ipcRenderer.invoke('get-apis', search),
        saveApi: (api) => ipcRenderer.invoke('save-api', api),
        deleteApi: (id) => ipcRenderer.invoke('delete-api', id),
        getCreds: (search) => ipcRenderer.invoke('get-creds', search),
        saveCred: (cred) => ipcRenderer.invoke('save-cred', cred),
        deleteCred: (id) => ipcRenderer.invoke('delete-cred', id),
        getSettings: () => ipcRenderer.invoke('get-settings'),
        saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
        getSessions: () => ipcRenderer.invoke('get-sessions'),
        saveSession: (session) => ipcRenderer.invoke('save-session', session),
        deleteSession: (id) => ipcRenderer.invoke('delete-session', id),
        minimize: () => ipcRenderer.invoke('window-minimize'),
        maximize: () => ipcRenderer.invoke('window-maximize'),
        close: () => ipcRenderer.invoke('window-close'),
    });
    console.log('Preload script exposed electronAPI');
}
catch (error) {
    console.error('Failed to expose electronAPI:', error);
}
