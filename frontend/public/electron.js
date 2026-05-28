const { app, BrowserWindow } = require('electron');
const path = require('path');
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '..', '..', 'electron', 'preload.js')
        },
        titleBarStyle: 'hidden',
        title: 'Error Analyzer',
        backgroundColor: '#1e1e1e',
        autoHideMenuBar: true
    });

    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
    win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
