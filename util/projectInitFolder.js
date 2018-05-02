const path = require('path');
const fs = require('fs');
const generateOutlineFile = require('./generateOutlineFile');

/**
 * Sets up a new project folder
 * @param {string} location
 */
module.exports = (location) => {
  const existingFiles = fs.readdirSync(location);
  if (existingFiles.length === 0) {
    const newOutlineLocation = path.join(location, 'outline.json');
    generateOutlineFile(newOutlineLocation);
  }
}