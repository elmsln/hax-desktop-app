const electron = require('electron');
const _ = require('underscore');
const url = require('url');
const path = require('path');
const Store = require('electron-store');
const store = new Store();
const { app, BrowserWindow, ipcMain, Menu, shell, ipcRenderer, dialog } = electron;
const { getPage, savePage, parseOutline, getOutlinePage, createPage } = require('./util/page');

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
    return global.page;
  },
  setActivePage(page) {
    global.page = page;
    // changed the active page
    mainWindow.webContents.send('active-page-changed', page);
    // update the active content
    const content = getPage(page);
    mainWindow.webContents.send('active-content-changed', content);
  },

  getOutline() {
    return global.outline;
  },
  setOutline(outline) {
    global.outline = outline;
    mainWindow.webContents.send('outline-changed', outline);
  },

  getLocation() {
    return global.location;
  },
  setLocation(location) {
    global.location = location;
    mainWindow.webContents.send('location-changed', location);
    // get new outline
    const outline = parseOutline();
    // store the outline
    globals.setOutline(outline);
    // store the location in the location list
    globals.addToLocationList(location);
  },

  getLocationList() {
    if (global.locationList) {
      return global.locationList;
    } 
    else {
      return store.get('location-list');
    }
  },
  addToLocationList(location) {
    let newLocationList = [];
    const locationList = store.get('location-list') ? store.get('location-list') : [];
    // if the location already exists add remove it from the list 
    if (locationList.includes(location)) {
      newLocationList = locationList.filter(l => l !== location);
    }
    // add the location to the top of the list
    newLocationList.push(location);
    globals.setLocationList(newLocationList);
  },
  setLocationList(locations) {
    global.locationList = locations;
    store.set('location-list', locations);
    mainWindow.webContents.send('location-list-changed', locations);
  }
}

ipcMain.on('set-active-page', (e, page) => {
  globals.setActivePage(page);
});

ipcMain.on('save-page', (e, content) => {
  const activePage = globals.getActivePage();
  const saved = savePage(activePage, content);
  mainWindow.webContents.send('save-page-success');
});

ipcMain.on('create-page', (e, pageInfo) => {
  const fileName = pageInfo.fileName;
  const content = pageInfo.content;
  const created = createPage(fileName, content);
  mainWindow.webContents.send('create-page-success');
  
});

ipcMain.on('open-project-prompt', (e) => {
  let location = '';
  const locations = dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (_.isArray(locations)) {
    location = _.first(locations);
    // set the location
    globals.setLocation(location);
  }
});

ipcMain.on('app-initialized', (e, arg) => {
  // Initialize locations
  const locationList = globals.getLocationList();
  globals.setLocationList(locationList);
});

ipcMain.on('change-location', (e, location) => {
  globals.setLocation(location);
})