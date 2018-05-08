const fs = require('fs')
const path = require('path')
const Case = require('case')
const setOutline = require('./setOutline')
const unusedFilename = require('unused-filename');
const filenamify = require('filenamify')

/**
 * Takes a path
 * @param {string} location 
 * @param {Outline.tree} outlineTree 
 * 
 * @return {Outline}
 */
module.exports = (newOutline, oldOutline) => {
  fs.writeFileSync(path.join(__dirname, '../test/updateOutlineFilesTest/newOultine.json'), JSON.stringify(newOutline, null, 2));
  fs.writeFileSync(path.join(__dirname, '../test/updateOutlineFilesTest/oldOultine.json'), JSON.stringify(oldOutline, null, 2));
  // array of Ids in new outline
  const newIds = newOutline.tree.map(o => o.id);
  // array of Ids in old outline
  const oldIds = oldOutline.tree.map(o => o.id);
  // find new items added
  const addedIds = newIds.filter(newId => !oldIds.includes(newId));
  // find items deleted
  const deletedIds = oldIds.filter(oldId => !newIds.includes(oldId))

  const newOutlineTree = newOutline.tree.map(i => {
    // find out if it's a new item
    const newItem = addedIds.includes(i.id);
    if (newItem) {
      // get the unique filename
      const safeFilename = filenamify(i.title,  {replacement: ''});
      const uniqueFilename = unusedFilename.sync(path.join(newOutline.projectLocation, `${safeFilename}.html`))
      const fileAdded = fs.writeFileSync(uniqueFilename, '', 'utf8')
      // if we successfully added the file then we'll update 
      // the item to know about the new location
      i.location = uniqueFilename;
    }
    return i;
  })

  /**
   * @todo Handle the removed files
   */

  // update the outline file.
  return Object.assign({}, newOutline, { tree: newOutlineTree });
}
