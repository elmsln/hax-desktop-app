const path = require('path');
const _ = require('underscore');
const fs = require('fs');

module.exports = (location, outline) => {

  const promise = new Promise((resolve, reject) => {
    try {
      const outlineWritten = fs.writeFileSync(location, outline, {
        flag: 'w'
      })
      resolve(outlineWritten)
    } catch (error) {
      reject(error)
    }
  })

  return promise
}
