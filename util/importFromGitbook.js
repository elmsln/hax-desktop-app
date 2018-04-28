const gitbook2Outline = require('gitbook-2-outline-schema')
const generateOutlineFile = require('./generateOutlineFile')
const setOutline = require('./setOutline')

module.exports = async (location) => {
  outline = gitbook2Outline(`${location}/SUMMARY.md`);
  if (outline.tree) {
    try {
      const outlineGenerated = await generateOutlineFile(`${location}/outline.json`);
      try {
        const outlineUpdate = await setOutline(`${location}/outline.json`, JSON.stringify(outline.tree))
        return outlineUpdate
      } catch (error) {}
    } catch (error) {}
  }
  return null;
}
