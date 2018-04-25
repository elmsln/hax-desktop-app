const path = require('path');
const _ = require('underscore');
const fs = require('fs');

module.exports = (location) => {
  const outline = new Promise((resolve, reject) => {
    try {
      const exists = fs.existsSync(location);
      if (exists) {
        const outline = fs.readFileSync(location, 'utf8');
        try {
          const outlineJSON = JSON.parse(outline);
          const length = outlineJSON.length;
          if (length >= 0) {
            resolve(outline);
          }
          else {
            reject(Error('Invalid outline.'));
          }
        } catch (error) {
          reject(error);
        }
      }
      else {
        reject(Error('File not found.'));
      }
    } catch (error) {
      reject(error);
    }
  });

  return outline;
}