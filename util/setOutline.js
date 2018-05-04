const path = require('path');
const _ = require('underscore');
const fs = require('fs');

module.exports = (location, outline) => {
  // format the outline correctly
  // if it's a string then convert it into JSON so it can be parsed
  // correctly
  outline = (typeof outline === 'string') ? JSON.parse(outline) : outline
  // remove any cruft like children
  outline = outline.map(i => {
    delete(i.children)
    return i
  });
  outline = JSON.stringify(outline, null, 2)

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
