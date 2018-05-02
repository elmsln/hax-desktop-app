const fs = require('fs');
const path = require('path')
const marked = require('marked')

module.exports = (location) => {
  const fileContents = fs.readFileSync(location, 'utf8')
  // run it through markdown just in case
  const html = marked(fileContents)
  return html
}