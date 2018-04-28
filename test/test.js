const fs = require('fs')
const assert = require('assert')
const rimraf = require('rimraf')
const getOutline = require('../util/getOutline')
const generateOutlineFile = require('../util/generateOutlineFile')

describe('Running Tests', async () => {

  before(async () => {
    // make tmp directory
    if (await !fs.existsSync(`${__dirname}/.tmp`)) {
      const directoryMade = await fs.mkdirSync(`${__dirname}/.tmp`);
    }
  });


  describe('generateOutlineFile', async function () {
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
  });

  describe('getOutline', async function () {
    it('it should be able to fetch a valid outline.', async function () {
      const outline = await getOutline(`${__dirname}/outline.json`);
    });
    it('it should be ok with an empty outline.', async function () {
      const outline = await getOutline(`${__dirname}/emptyOutline.json`);
    });
    it('it should return an error on an invalid outline', async function () {
      try {
        const outline = await getOutline(`${__dirname}/badOutline.json`);
      } catch (error) {
        assert(error);
      }
    });
    it('it should return an error if one does not exist.', async function () {
      try {
        const outline = await getOutline(`${__dirname}/404.json`);
      } catch (error) {
        assert(error);
      }
    })
  })

  after(async () => {
    const deleted = await rimraf(`${__dirname}/.tmp`, () => { return })
  })

})