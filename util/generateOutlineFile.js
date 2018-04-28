const path = require('path');
const _ = require('underscore');
const fs = require('fs');

module.exports = (location) => {

  const outlineGenerated = new Promise((resolve, reject) => {
    try {
      const outline = fs.writeFileSync(location, '[]', {
        flag: 'wx'
      })
      resolve(outline)
    } catch (error) {
      reject(error)
    }
  })

  return outlineGenerated
}