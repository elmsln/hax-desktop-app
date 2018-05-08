const fs = require('fs')
const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')
const getOutline = require('../../util/getOutline')
const updateOutlineFiles = require('../../util/updateOutlineFiles')

module.exports = () => {
  describe('updateOultineFilesTest', () => {
    // stub out .tmp directory
    const projectLocation = path.join(__dirname, '../.tmp/updateOutlineFilesTest')
    if (!fs.existsSync(projectLocation)) {
      fs.mkdirSync(projectLocation);
    }

    let oldOutline;
    let newOutline;
    it('it should be able to get the old and new outlines for testing.', function () {
      oldOutline = fs.readFileSync(path.join(__dirname, 'oldOutline.json'), 'utf8')
      newOutline = fs.readFileSync(path.join(__dirname, 'newOutline.json'), 'utf8')
    });
    it('it should be able to', function () {
      oldOutline.projectLocation = projectLocation
      newOutline.projectLocation = projectLocation
      updateOutlineFiles(JSON.parse(newOutline), JSON.parse(oldOutline))
    });
    // it('it should be able to get the new outlines.', async function () {
    //   const oldOutline = await getOutline(path.join(__dirname, 'oldOutline.json'));
    //   const newOutline = await getOutline(path.join(__dirname, 'newOutline.json'));
    // });
  })
}