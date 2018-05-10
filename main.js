const electron = require('electron');
const _ = require('underscore');
const url = require('url');
const path = require('path');
//const BrowserWindow = electron.remote.BrowserWindow; //for new window -tom
const Store = require('electron-store');
const store = new Store();
const { app, BrowserWindow, ipcMain, Menu, shell, ipcRenderer, dialog } = electron;
const { getPage, parseOutline, getOutlinePage, createPage } = require('./util/page');
const mainWindowCreate = require('./util/mainWindow');
const generateOutlineFile = require('./util/generateOutlineFile');
const getOutline = require('./util/getOutline');
const importFromGitbook = require('./util/importFromGitbook')
const updateOutlineFiles = require('./util/updateOutlineFiles')
const loadPage = require('./util/loadPage');
const savePage = require('./util/savePage');
const markdownToHTML = require('./util/markdownToHTML')
const projectInitFolder = require('./util/projectInitFolder')
const setOutline = require('./util/setOutline')
// const graphqlServer = require('./server');

let mainWindow;
// GraphQL Server
// graphqlServer.start(() => console.log('Server is running on localhost:4000'))

app.on('ready', () => {
  mainWindow = mainWindowCreate();
  // Build main menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert the Menu into the app
  Menu.setApplicationMenu(mainMenu);
})

app.on("window-all-closed", function () {
  app.quit();
})

// Set the Main Menu
const mainMenuTemplate = [
  {
    label: 'File'
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
  },
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
    ],
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
   */
  Projects: {
    list: []
  },

  /**
   * Project
   * @type {object}
   * @property {string} title - Title of the project
   * @property {string} location - Path of the project on the users computer
   * @property {string} outlineLocation - Location of the outline location
   * @property {date} lastEdited - Last edit date of the
   * @property {number} windowId - Id of the active window that is displaying the project
   */
  Project: {
    title: null,
    location: null,
    outlineLocation: null,
    lastEdited: null,
    windowId: null
  },

  /**
   * Return a single project
   * @param {string} projectLocation
   * @return {Project}
   */
  getProject(projectLocation) {
    const currentProjectList = this.getProjects();
    if (currentProjectList) {
      const project = currentProjectList.find(p => {
        return p.location === projectLocation
      });
      return project;
    }
    else {
      return null;
    }
  },
  /**
   * Get a list of all Projects
   * @returns {Project[]}
   */
  getProjects() {
    const projects = store.get('projects') || {};
    if (projects.list) {
      return projects.list;
    }
    else {
      return [];
    }
  },
  /**
   * Add or update new project
   * @param {Project} project 
   * @return {void}
   */
  setProject(project) {
    let newProject = Object.assign({}, this.Project, project);
    // get mutable instance of the Project List
    const currentProjectList = this.getProjects();
    // look for the existing project
    const existingProject = this.getProject(project.location) || null;
    // if we have an existing project then merge that with new Project
    if (existingProject) {
      newProject = Object.assign({}, existingProject, newProject);
    }
    // update the last edit date
    newProject = Object.assign({}, newProject, {
      lastEdited: new Date()
    });
    // if we have an existing project then add it to the top of the list and remove
    // the old copy
    if (existingProject) {
      const projectListExistingProjectRemoved = currentProjectList.filter(p => p.location !== existingProject.location);
      const newProjectList = projectListExistingProjectRemoved;
      store.set('projects.list', newProjectList);
      store.set('projects.list', [newProject, ...newProjectList]);
    }
    else {
      store.set('projects.list', [newProject, ...currentProjectList]);
    }
    // update project list
    mainWindow.webContents.send('projects-updated', this.getProjects());
    // update project window
    const projectWindow = this.getWindowByProjectLocation(newProject.location);
    if (projectWindow) {
      const projectWindowInstance = BrowserWindow.fromId(projectWindow.id);
      projectWindowInstance.webContents.send('project-updated', newProject);
    }
  },
  /**
   * Remove project from Project list
   * @param {string} projectLocation 
   */
  deleteProject(projectLocation) {
    const currentProjectList = this.getProjects(projectLocation);
    const newProjectList = currentProjectList.filter(p => p.location !== projectLocation);
    store.set('projects.list', newProjectList);
    mainWindow.webContents.send('projects-updated', this.getProjects());
  },
  /**
   * Starts a new project
   */
  initProject() {
    const locations = dialog.showOpenDialog({ properties: ['promptToCreate', 'createDirectory', 'openDirectory'] });
    if (_.isArray(locations)) {
      // get the location
      location = _.first(locations);
      try {
        projectInitFolder(location);
      } catch (error) {
        dialog.showErrorBox('Folder Create Error', 'Could not create folder. Make sure the folder is empty.');
        return;
      }
      pathArray = location.split('/');
      title = pathArray[pathArray.length - 1];
      outline = path.join(location, 'outline.json');
      // set the location
      globals.setProject({
        title: title,
        location: location,
        outlineLocation: outline
      });
    }
  },

  /**
   * Windows
   * @param {Window[]} list
   */
  Windows: {
    list: []
  },
  /**
   * Window
   * @param {number} id
   * @param {string} location
   */
  Window: {
    id: null,
    location: null
  },
  /**
   * Get the active instance of a window based on
   * window id.
   * @param {number} id - window id
   * @return {Window}
   */
  getWindow(id) {
    const windows = this.getWindows();
    const window = windows.find(w => w.id === id);
    return BrowserWindow.fromId(id);
  },
  /**
   * Get a list of all Windows
   * @returns {Window[]}
   */
  getWindows() {
    const windows = this.Windows || {};
    if (windows.list) {
      return windows.list;
    }
    else {
      return [];
    }
  },
  /**
   * Set Window
   * @param {Window} window
   * @return {void}
   */
  setWindow(window) {
    const currentWindowList = this.getWindows();
    // remove any window that is currently in the list
    const newWindowList = currentWindowList.filter(w => w.id !== window.id && w.location !== window.location);
    newWindowList.push(window);
    this.Windows.list = newWindowList;
  },
  /**
   * Delete Window
   * @param {Window} window 
   */
  deleteWindow(window) {
    const currentWindowList = this.getWindows();
    console.log(currentWindowList);
    // remove any window that is currently in the list
    const newWindowList = currentWindowList.filter(w => w.id !== window.id);
    this.Windows.list = newWindowList;
  },
  /**
   * Return a single project
   * @param {string} projectLocation
   * @return {Project}
   */
  getProjectByWindowId(windowId) {
    const currentWindowList = this.getWindows();
    if (currentWindowList) {
      const window = currentWindowList.find(w => {
        return w.id === windowId
      });
      if (window) {
        const project = this.getProject(window.location);
        return project;
      }
    }
    return null;
  },
  /**
   * Return a Window object by passing a project location
   * @param {string} location
   * @return {Window}
   */
  getWindowByProjectLocation(location) {
    const windows = this.getWindows();
    if (windows) {
      const window = windows.find(w => w.location === location);
      if (window) {
        return window;
      }
    }
    return null;
  },

  /**
   * Outlines
   * 
   * @param {Outline[]} list
   */
  Outlines: {
    list: []
  },
  /**
   * Outline
   * 
   * @param {Project.location} projectLocation
   * @param {array} tree
   */
  Outline: {
    projectLocation: null,
    editing: false,
    activePage: null,
    tree: []
  },
  initOutline: async function (projectLocation) {
    const project = this.getProject(projectLocation)
    const tree = await this.getOutlineTree(project)
    const outline = await Object.assign(this.Outline, { projectLocation: projectLocation, tree: tree })
    this.setOutline(outline);
  },
  /**
   * Get outline by Project Location
   * @param {Project.location} projectLocation 
   */
  getOutline: async function (projectLocation) {
    try {
      const outlines = await this.getOutlines();
      const outline = await outlines.find(o => o.projectLocation === projectLocation)
      return outline;
    } catch (error) {
      console.log(error);
    }
    return [];
  },
  /**
   * Get Outline
   * @param {Project} project
   */
  getOutlineTree: async function (project) {
    try {
      return await getOutline(project.outlineLocation);
    } catch (error) {
      console.log(error);
    }
    return [];
  },
  /**
   * Get Outlines
   */
  getOutlines() {
    const outlines = this.Outlines || {};
    if (outlines.list) {
      return outlines.list;
    }
    else {
      return [];
    }
  },
  /**
   * Create or update the Outline
   * @param {Outline} outline 
   */
  setOutline: async function (outline) {
    const oldOutline = await this.getOutline(outline.projectLocation)
    if (oldOutline) {
      if (outline.activePage !== oldOutline.activePage) {
        const pagehtml = this.loadActivePage(outline);
        this.activePageUpdated(outline, pagehtml);
      }
    }
    // get the current list
    const outlineList = await this.getOutlines();
    // remove any outline that is currently in the list
    let newOutlineList = outlineList.filter(o => o.projectLocation !== outline.projectLocation);
    newOutlineList.push(outline);
    this.Outlines.list = newOutlineList;
    this.outlineUpdated(outline.projectLocation)
  },
  /**
   * Delete Outline
   * @param {Project.location} projectLocation 
   */
  deleteOutline(projectLocation) {
    const outlineList = this.getOutlines();
    // remove any window that is currently in the list
    const newOutlineList = outlineList.filter(o => o.outlineLocation !== outline.projectLocation);
    this.Outline.list = newOutlineList;
    this.outlineUpdated(outline.projectLocation);
  },
  /**
   * Notify everyone that need to know that the outline has been updated
   * @param {Project.location} projectLocation 
   */
  outlineUpdated: async function (projectLocation) {
    const window = this.getWindowByProjectLocation(projectLocation);
    const windowInstance = BrowserWindow.fromId(window.id);
    const outline = await this.getOutline(projectLocation);
    windowInstance.webContents.send('outline-updated', outline);
  },
  /**
   * Notify everyone that need to know that the outline has been updated
   * @param {Project.location} projectLocation 
   */
  activePageUpdated(outline, pageContents) {
    const window = this.getWindowByProjectLocation(outline.projectLocation);
    const windowInstance = BrowserWindow.fromId(window.id);
    windowInstance.webContents.send('active-page-updated', pageContents);
  },/**
   * Notify everyone that need to know that the outline has been updated
   * @param {Project.location} projectLocation 
   */
  outlineFileUpdated(outline) {
    const window = this.getWindowByProjectLocation(outline.projectLocation);
    const windowInstance = BrowserWindow.fromId(window.id);
    windowInstance.webContents.send('outline-file-updated');
  },
  /**
   * Toggle Outline Edit State
   * @param {Project.location} projectLocation 
   */
  toggleOutlineEdit: async function (projectLocation) {
    const outline = await this.getOutline(projectLocation)
    if (outline) {
      const currentEditState = outline.editing
      const newEditState = !currentEditState
      const newOutline = Object.assign({}, outline, { editing: newEditState })
      this.setOutline(newOutline)
    }
  },
  /**
   * Updates the outline tree and runs diffing on the outline
   * then updates the files on the file system.
   * 
   * @param {Outline} outline 
   */
  updateOutlineTree: async function (outline) {
    // get the current outline
    const oldOutline = await this.getOutline(outline.projectLocation)
    const newOutline = Object.assign({}, oldOutline, outline)
    if (oldOutline) {
      // update the outline tree files on the file system
      const updatedOutline = updateOutlineFiles(newOutline, oldOutline)
      // update the outline file
      const project = this.getProject(updatedOutline.projectLocation);
      this.outlineFileUpdated(updatedOutline);
      const outlinefileUpdated = await setOutline(project.outlineLocation, updatedOutline.tree);
      this.setOutline(updatedOutline);
    }
  },
  /**
   * Retrieve the Files from the file system and send them
   * on the main thread.
   * @param {Outline} outline 
   * @return {html}
   */
  loadActivePage(outline) {
    // get the active item in the outline tree
    const activeOutineItem = outline.tree.find(i => i.id === outline.activePage);
    if (activeOutineItem) {

      const pathToFile = path.join(outline.projectLocation, activeOutineItem.location);
      // load the page contents
      const html = loadPage(pathToFile) || '';
      return html;
    }
  },
  /**
   * Retrieve the Files from the file system and send them
   * on the main thread.
   * @param {Outline} outline 
   * @param {string} content  New file contents
   * 
   * @todo need to handle error states
   */
  updateActivePage(outline, content) {
    // get the active item in the outline tree
    const activeOutineItem = outline.tree.find(i => i.id === outline.activePage);
    const pathToFile = path.join(outline.projectLocation, activeOutineItem.location);
    // load the page contents
    try {
      savePage(pathToFile, content);
      this.notifySuccessfullActivePageUpdate(outline);
    } catch (error) {
      console.log(error);
    }
  },

  /**
   * Notify the renderer that the page has been
   * successfully saved
   */
  notifySuccessfullActivePageUpdate(outline) {
    const window = this.getWindowByProjectLocation(outline.projectLocation);
    const windowInstance = BrowserWindow.fromId(window.id);
    windowInstance.webContents.send('active-page-saved-success');
  }
}

ipcMain.on('get-projects', (e) => {
  const projects = globals.getProjects();
  mainWindow.webContents.send('get-projects', projects);
});

/**
 * Project is selected, this will set it up in a new window
 * or activate the window in which it has already been initiated.
 */
ipcMain.on('project-selected', (e, projectLocation) => {
  const project = globals.getProject(projectLocation);
  const window = globals.getWindowByProjectLocation(projectLocation);
  if (window) {
    const existingWindow = BrowserWindow.fromId(window.id);
    existingWindow.focus();
  }
  else {
    let win = new BrowserWindow({ title: project.title, width: 800, height: 600 })
    win.on('closed', () => {
      win = null
    });
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'app', 'project.html'),
      protocol: 'file:',
      slashes: true,
    }));
    win.on('close', e => {
      const windowId = e.sender.id;
      const window = Object.assign(globals.Window, { id: windowId });
      globals.deleteWindow(window);
    });
    const window = {
      id: win.id,
      location: projectLocation
    };
    globals.setWindow(window);
  }
});

ipcMain.on('project-init', (e, args) => {
  const windowId = args.windowId;
  const win = BrowserWindow.fromId(windowId);
  const project = globals.getProjectByWindowId(windowId);
  win.webContents.send('project-init', project);
})

ipcMain.on('open-project-prompt', (e) => {
  let location = '';
  const locations = dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (_.isArray(locations)) {
    location = _.first(locations);
    pathArray = location.split('/');
    title = pathArray[pathArray.length - 1];
    // set the location
    globals.setProject({
      title: title,
      location: location
    });
  }
});

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


/**
 * Project Events Section
 */

/**
 * Update the given project
 */
ipcMain.on('update-project', (e, project) => {
  globals.setProject(project);
});

ipcMain.on('project-delete', (e, project) => {
  globals.deleteProject(project.location)
})

ipcMain.on('project-open-in-finder', (e, project) => {
  shell.showItemInFolder(`${project.outlineLocation}/`)
})

/**
 * When you hit the back button in the project
 * then bring up the main window.
 */
ipcMain.on('project-back', (e, project) => {
  try {
    mainWindow.focus();
  } catch (error) {
    mainWindow = mainWindowCreate();
  }
});

/**
 * @param {Event} e
 * @param {Project} project
 */
ipcMain.on('project-generate-outline-init', async (e, project) => {
  project = globals.getProject(project.location)
  // define new outline location
  const outlineLocation = path.join(project.location, 'outline.json')
  // generate the new outline
  try {
    const outlineGenerated = await generateOutlineFile(outlineLocation)
    globals.setProject(Object.assign(project, { outlineLocation: outlineLocation }))
  } catch (error) {
    console.log(error)
  }
});

/**
 * Import the project from gitbook file.
 */
ipcMain.on('project-import-from-gitbook-init', async (e, project) => {
  try {
    // attempt to save outline
    const outline = await importFromGitbook(project.location);
    // if it saved then we will update the project outline location
    project = globals.getProject(project.location);
    outlineLocation = `${project.location}/outline.json`;
    globals.setProject(Object.assign(project, { outlineLocation, outlineLocation }))
  } catch (error) {
    console.log(error)
  }
})

/**
 * Outline
 */
ipcMain.on('outline-init', async (e, project) => {
  if (project) {
    if (project.outlineLocation) {
      globals.initOutline(project.location);
    }
  }
})

ipcMain.on('outline-edit-toggle', (e, project) => {
  if (project) {
    if (project.location) {
      globals.toggleOutlineEdit(project.location)
    }
  }
})

ipcMain.on('update-outline-tree', (e, outline) => {
  globals.updateOutlineTree(outline)
})

ipcMain.on('active-page-selected', async (e, { outlineProjectLocation, activePage }) => {
  const outline = await globals.getOutline(outlineProjectLocation);
  const newOutline = Object.assign({}, outline, { activePage, activePage });
  globals.setOutline(newOutline);
})

/**
 * @param {Event} e
 * @param {object} outlineProjectLocation, content 
 */
ipcMain.on('save-content', async (e, { outlineProjectLocation, content}) => {
  const outline = await globals.getOutline(outlineProjectLocation);
  globals.updateActivePage(outline, content);
})

/**
 * Convert markdown to html
 */
ipcMain.on('markdown-to-html', (e, markdown) => {
  const html = markdownToHTML(markdown)
  e.sender.webContents.send('markdown-to-html', html)
})


/**
 * Homepage Events Section
 */
ipcMain.on('new-project', (e) => {
  globals.initProject();
});
