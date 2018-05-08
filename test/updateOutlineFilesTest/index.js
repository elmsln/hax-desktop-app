const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')
const getOutline = require('../../util/getOutline')
const updateOutlineFiles = require('../../util/updateOutlineFiles')

module.exports = async () => {
  describe('updateOultineFilesTest', async () => {
    let oldOutlineTree;
    let newOutlineTree;
    it('it should be able to get the old and new outlines for testing.', async function () {
      oldOutlineTree = await getOutline(path.join(__dirname, 'oldOutline.json'));
      newOutlineTree = await getOutline(path.join(__dirname, 'newOutline.json'));
    });
    it('it should be able to', async function () {
      updateOutlineFiles({ tree: newOutlineTree }, { tree: oldOutlineTree });
    });
    // it('it should be able to get the new outlines.', async function () {
    //   const oldOutline = await getOutline(path.join(__dirname, 'oldOutline.json'));
    //   const newOutline = await getOutline(path.join(__dirname, 'newOutline.json'));
    // });
  })
}