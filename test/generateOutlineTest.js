const fs = require('fs')
const assert = require('assert')
const rimraf = require('rimraf')
const generateOutlineFile = require('../util/generateOutlineFile')

module.exports = async () => {
  describe('generateOutlineTest', async () => {
    // stub out .tmp directory
    if (!fs.existsSync(`${__dirname}/.tmp/generateOutlineFile`)) {
      await fs.mkdirSync(`${__dirname}/.tmp/generateOutlineFile`);
    }
    it('it should create an outline file', async function () {
      const outline = await generateOutlineFile(`${__dirname}/.tmp/generateOutlineFile/outline.json`)
    });
    it('it should not write over an existing file.', async function () {
      try {
        const outline = await generateOutlineFile(`${__dirname}/.tmp/generateOutlineFile/outline.json`)
      } catch (error) {
        assert(error)
      }
    });
  })
}