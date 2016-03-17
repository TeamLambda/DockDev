'use-strict';

const electron = require('electron');
const app = electron.app;
const ipcMain = require('electron').ipcMain;
const dialog = require('electron').dialog;
const utils = require('./lib/utils.js');

const BrowserWindow = electron.BrowserWindow;
global.ipcRenderer = require('electron').ipcRenderer;

var mainWindow = null;

// app.('will-finish-launching', function(){
//
// });

app.on('ready', function(){
  mainWindow = new BrowserWindow({width:750,height:550, titleBarStyle: "hidden-inset"});
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  utils.readConfig(process.env.HOME)
    .catch(console.log);

  mainWindow.webContents.openDevTools();
  mainWindow.on('close', function () {
    mainWindow = null;
  });
});

// ipcMain.on('asynchronous-message', function(event, arg) {
//   console.log(arg);  // prints "ping"
//   event.sender.send('asynchronous-reply', 'pong');
// });

ipcMain.on('synchronous-message', function(event, arg) {
  dialog.showOpenDialog({ properties: [ 'openDirectory']});
  event.returnValue = event;
  // event.returnValue = 'pong';
});
