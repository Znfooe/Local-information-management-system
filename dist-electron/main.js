import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';
import { createRequire } from 'module';
import fs from 'fs';
// Suppress security warnings in development
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}
// Development helper: set userData path to project folder
if (process.env.NODE_ENV === 'development') {
    const devUserDataPath = path.join(process.cwd(), 'userdata');
    if (!fs.existsSync(devUserDataPath)) {
        fs.mkdirSync(devUserDataPath, { recursive: true });
    }
    app.setPath('userData', devUserDataPath);
    console.log("Development Mode: userData path set to", devUserDataPath);
}
let mainWindow = null;
const defaultData = {
    apis: [],
    credentials: [],
    settings: {
        apiKey: '',
        model: 'glm-4-flash',
        theme: 'light',
        language: 'zh',
        provider: 'glm'
    },
    sessions: []
};
let db;
async function initDB() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db.json');
    console.log("----------------------------------------");
    console.log("Database Path:", dbPath);
    console.log("Environment:", process.env.NODE_ENV);
    console.log("----------------------------------------");
    db = await JSONFilePreset(dbPath, defaultData);
    console.log("DB Initialized successfully");
}
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false, // Remove default title bar
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5175');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: "deny" };
    });
}
app.whenReady().then(async () => {
    await initDB();
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
// IPC Handlers
ipcMain.handle('window-minimize', () => {
    mainWindow?.minimize();
});
ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow?.maximize();
    }
});
ipcMain.handle('window-close', () => {
    mainWindow?.close();
});
ipcMain.handle('get-apis', async (event, search) => {
    await db.read();
    if (search) {
        return db.data.apis.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
    }
    return db.data.apis;
});
ipcMain.handle('save-api', async (event, api) => {
    console.log("Saving API:", api);
    await db.read();
    if (api.id) {
        const index = db.data.apis.findIndex((a) => a.id === api.id);
        if (index !== -1) {
            db.data.apis[index] = { ...db.data.apis[index], ...api };
        }
    }
    else {
        const newApi = { ...api, id: Date.now() };
        db.data.apis.push(newApi);
    }
    await db.write();
    console.log("API Saved");
    return true;
});
ipcMain.handle('delete-api', async (event, id) => {
    await db.read();
    db.data.apis = db.data.apis.filter((a) => a.id !== id);
    await db.write();
    return true;
});
ipcMain.handle('get-creds', async (event, search) => {
    await db.read();
    if (search) {
        return db.data.credentials.filter((c) => c.site_name.toLowerCase().includes(search.toLowerCase()));
    }
    return db.data.credentials;
});
ipcMain.handle('save-cred', async (event, cred) => {
    console.log("Saving Credential:", cred);
    await db.read();
    if (cred.id) {
        const index = db.data.credentials.findIndex((c) => c.id === cred.id);
        if (index !== -1) {
            db.data.credentials[index] = { ...db.data.credentials[index], ...cred };
        }
    }
    else {
        const newCred = { ...cred, id: Date.now(), created_at: new Date().toISOString() };
        db.data.credentials.push(newCred);
    }
    await db.write();
    console.log("Credential Saved");
    return true;
});
ipcMain.handle('delete-cred', async (event, id) => {
    await db.read();
    db.data.credentials = db.data.credentials.filter((c) => c.id !== id);
    await db.write();
    return true;
});
ipcMain.handle('get-settings', async () => {
    await db.read();
    return db.data.settings || {};
});
ipcMain.handle('save-settings', async (event, settings) => {
    console.log("Saving Settings:", settings);
    await db.read();
    db.data.settings = { ...db.data.settings, ...settings };
    await db.write();
    console.log("Settings Saved");
    return true;
});
ipcMain.handle('get-sessions', async () => {
    await db.read();
    return db.data.sessions || [];
});
ipcMain.handle('save-session', async (event, session) => {
    await db.read();
    if (!db.data.sessions)
        db.data.sessions = [];
    const index = db.data.sessions.findIndex((s) => s.id === session.id);
    if (index !== -1) {
        db.data.sessions[index] = session;
    }
    else {
        db.data.sessions.unshift(session);
    }
    await db.write();
    return true;
});
ipcMain.handle('delete-session', async (event, id) => {
    await db.read();
    if (!db.data.sessions)
        return false;
    db.data.sessions = db.data.sessions.filter((s) => s.id !== id);
    await db.write();
    return true;
});
