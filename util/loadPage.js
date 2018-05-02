const fs = require('fs');
const path = require('path')

module.exports = (location) => {
  const fileContents = fs.readFileSync(location, 'utf8')
  return fileContents
}