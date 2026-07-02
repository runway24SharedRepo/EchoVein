'use strict';

/*
 * EchoVein Electron main process.
 *
 * Keep this file isolated from browser gameplay code. The game still runs from
 * index.html and all game logic remains in the existing js/*.js files.
 */
const path = require('path');
const { app, BrowserWindow, Menu, shell } = require('electron');

const isDev = process.argv.includes('--dev') || process.env.ECHO_VEIN_DEV === '1';
let mainWindow = null;

function createMainWindow(){
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 960,
    minHeight: 540,
    show: false,
    title: 'EchoVein',
    backgroundColor: '#05070d',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false
    }
  });

  Menu.setApplicationMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if(isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Keep the game window focused on the local game. External links, if added
    // later, open in the user's default browser instead of a new Electron page.
    if(/^https?:\/\//i.test(url)) shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const localIndex = `file://${path.join(__dirname, '..', 'index.html')}`.replace(/\\/g, '/');
    if(url.startsWith('file://') && url.replace(/\\/g, '/') === localIndex) return;
    if(/^https?:\/\//i.test(url)){
      event.preventDefault();
      shell.openExternal(url).catch(() => {});
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  return mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});
