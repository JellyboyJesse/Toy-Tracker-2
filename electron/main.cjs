'use strict';

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// true when running from the packaged AppImage, false during `electron .`
const isProd = app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 960,
    minWidth: 900,
    minHeight: 600,
    title: 'Crayon Tracker Synth',
    backgroundColor: '#FEFCF0',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isProd) {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // Open external links in the system browser, not in the app window
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
