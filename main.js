const electron = require('electron');
const _ = require('underscore');
const url = require('url');
const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, shell, ipcRenderer, dialog } = electron;
const { getPage, savePage, parseOutline, getOutlinePage } = require('./util/page');

let mainWindow;

app.on('ready', () => {
  // create window
  mainWindow = new BrowserWindow({});
  // load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Build main menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert the Menu into the app
  Menu.setApplicationMenu(mainMenu);
  // Send out the config settings
})

// Set the Main Menu
const mainMenuTemplate = [
  {
    label: 'File'
  }
]

// Add Devtools
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+J' : 'Ctrl+J',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}


/**
 * Access Global Properties
 */
const globals = {
  getActivePage() {
    return global.outline;
  },
  setActivePage(page) {
    global.page = page;
    // changed the active page
    mainWindow.webContents.send('active-page-changed', page);
    // update the active content
    const content = getPage(page);
    console.log(content);
    // mainWindow.webContents.send('active-content-changed', content);
  },

  getOutline() {
    return global.outline;
  },
  setOutline(outline) {
    global.outline = outline;
    mainWindow.webContents.send('outline-changed', outline);
  },
}

ipcMain.on('set-active-page', (e, page) => {
  globals.setActivePage(page);
});

ipcMain.on('save-page', (e, content) => {
  const activePage = globals.getActivePage();
  const saved = savePage(activePage, content);
  mainWindow.webContents.send('save-page-success');
});

ipcMain.on('open-project-prompt', (e) => {
  let location = '';
  const locations = dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (_.isArray(locations)) {
    location = _.first(locations);
    // save the new location
    global.location = location;
    // send new location to app
    mainWindow.webContents.send('location-changed');
    // get new outline
    const outline = parseOutline();
    // store the outline
    globals.setOutline(outline);
  }
});