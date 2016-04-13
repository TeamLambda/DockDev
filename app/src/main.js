import electron from 'electron';
import { join } from 'path';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

let mainWindow = null;

// electron is listening for when the app is 'ready' to load and will create a new browser window
app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 950, height: 650 });
  mainWindow.loadURL(join('file://', __dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
  mainWindow.on('close', () => {
    mainWindow = null;
  });

  const template = [{
    label: 'Application',
    submenu: [
      { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
      { type: 'separator' },
      { label: 'Quit', accelerator: 'Command+Q', click() { app.quit(); } },
    ] }, {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
      ] },
    ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});
