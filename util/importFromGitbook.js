const fs = require('fs')
const path = require('path')
const replaceExt = require('replace-ext');
const gitbook2Outline = require('gitbook-2-outline-schema')
const generateOutlineFile = require('./generateOutlineFile')
const setOutline = require('./setOutline')
const markdownToHTML = require('./markdownToHTML')

module.exports = async (location) => {
  const outline = gitbook2Outline(`${location}/SUMMARY.md`);
  if (outline.tree) {
    try {
      // convert your files
      const convertedOutlineTree = outline.tree.map(item => {
        // get current file
        const markdownFilePath = path.join(location, item.location)
        const newHTMLFilePath = replaceExt(markdownFilePath, '.html')
        const markdown = fs.readFileSync(markdownFilePath, 'utf8')
        const html = markdownToHTML(markdown)
        const htmlFileCreated = fs.writeFileSync(newHTMLFilePath, html, 'utf8')
        const markdownFileRemoved = fs.unlinkSync(markdownFilePath)
        // updated the item to reflect the html file.
        const newHTMLFileLocation = path.relative(location, newHTMLFilePath)
        const convertedOutlineItem = Object.assign({}, item, {location: newHTMLFileLocation})
        return convertedOutlineItem
      })
      // convert the outline
      const outlineGenerated = await generateOutlineFile(`${location}/outline.json`);
      // update the outline
      const outlineUpdate = await setOutline(`${location}/outline.json`, JSON.stringify(convertedOutlineTree))
      return outlineUpdate
    } catch (error) {}
  }
}
