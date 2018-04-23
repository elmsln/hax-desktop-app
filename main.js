const electron = require('electron');
const _ = require('underscore');
const url = require('url');
const path = require('path');
//const BrowserWindow = electron.remote.BrowserWindow; //for new window -tom
const Store = require('electron-store');
const store = new Store();
const windowStateKeeper = require('electron-window-state');
const { app, BrowserWindow, ipcMain, Menu, shell, ipcRenderer, dialog } = electron;
const { getPage, savePage, parseOutline, getOutlinePage, createPage } = require('./util/page');

let mainWindow;

app.on('ready', () => {
  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 600,
    defaultHeight: 800
  });
  // create window
  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    'show': false,
  });
  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(mainWindow);
  // load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app', 'main.html'),
    protocol: 'file:',
    slashes: true,
  }));
  // Show window when page is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  });

  // Build main menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert the Menu into the app
  Menu.setApplicationMenu(mainMenu);
});

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

  /**
   * Project
   * @type {object}
   * @property {array} list - Listing of projects
   * @method getProjects
   * @method add
   */
  Projects: {
    list: [{
      title: "mike project",
      location: "/usr/path",
      lastEdited: 'Mon Apr 23 2018 13:22:34 GMT-0400 (EDT)'
    }]
  },
  
  /**
   * Project
   * @type {object}
   * @property {string} title - Title of the project
   * @property {string} location - Path of the project on the users computer
   * @property {date} lastEdited - Last edit date of the
   */
  Project: {
    title: null,
    location: null, 
    lastEdited: null
  },

  /**
   * Return a single project
   * @param {string} projectLocation
   * @return {Project}
   */
  getProject(projectLocation) {
    return this.Projects.list.find(p => p.location === projectLocation);
  },
  /**
   * Get a list of all Projects
   * @returns {Project[]}
   */
  getProjects() {
    return this.Projects.list;
  },
  /**
   * Add or update new project
   * @param {Project} project 
   * @return {Project}
   */
  setProject(project) {
    // look for the existing project
    let newProject = this.Project();
    const existingProject = this.getProject(project.location) || null;
    // if we have an existing project then merge that with new Project
    if (existingProject) {
      newProject = Object.assign({}, newProject, existingProject);
    }
    // update the last edit date
    newProject =  Object.assign({}, newProject, {
      lastEdited: new Date()
    });
    // if we have an existing project then add it to the top of the list and remove
    // the old copy
    if (existingProject) {
      // get mutable instance of the Project List
      const currentProjectList = [[this.Projects.list]];
      const projectListExistingProjectRemoved = currentProjectList.filter(p => p.location !== existingProject.location);
      const newProjectList = projectListExistingProjectRemoved;
      this.Projects.list = newProjectList;
    }
    // add the newProject to the top of the list
    this.Projects.list = [newProject, ...this.Projects.list];
  },

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

ipcMain.on('get-projects', (e) => {
  const projects = globals.getProjects();
  mainWindow.webContents.send('get-projects', projects);
})

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
  const updated = createPage(fileName, content);
  mainWindow.webContents.send('create-page-success');
});

//wIp 
ipcMain.on('update-summary', (e, pageInfo) => {
  // const pageTite = pageInfo.fileName;
  // const activePage = global.getActivePage();
  // const updated = addToSumm(pageTite, activePage);
  // mainWindow.webContents.send('update-summary-success');
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

/**
 * Commit to git by accessing the current folder
 * and executing directly via file system.
 * @todo  this should be tied to a button instead of the new page button
 */
ipcMain.on('commit-to-git', (e) => {
  var exec = require('child_process').exec;
  function execute(command, callback) {
    exec(command, function (error, stdout, stderr) { callback(stdout); });
  };
  const location = globals.getLocation();
  // call the function
  execute('cd ' + location + '', function (output) {
    console.log(output);
    console.log('when we\'re ready:  && git add -A && git commit -m "updated pages" && git push origin master will actually work');
  });
})