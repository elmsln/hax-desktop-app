const path = require('path');
const electron = require('electron');
const url = require('url');
const { BrowserWindow } = electron;
const windowStateKeeper = require('electron-window-state');

module.exports = () => {
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
    pathname: path.join(__dirname, '../', 'app', 'main.html'),
    protocol: 'file:',
    slashes: true,
  }));
  // Show window when page is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  });
  mainWindow.on("closed", function() {
    mainWindow = null;
  });

  return mainWindow;
}
