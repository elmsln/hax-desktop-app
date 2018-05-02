const fs = require('fs');
const path = require('path')

module.exports = (location, contents) => {
  const fileContentsSaved = fs.writeFileSync(location, contents, 'utf8')
  return fileContentsSaved;
}