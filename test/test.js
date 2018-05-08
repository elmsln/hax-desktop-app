const fs = require('fs')
const assert = require('assert')
const rimraf = require('rimraf')
const getOutlineTest = require('./getOutlineTest')
const generateOutlineTest =  require('./generateOutlineTest')
const updateOutlineFilesTest = require('./updateOutlineFilesTest')

describe('Running Tests', async () => {

  before(async () => {
    // make tmp directory
    if (await !fs.existsSync(`${__dirname}/.tmp`)) {
      const directoryMade = await fs.mkdirSync(`${__dirname}/.tmp`);
    }
    console.log('before')
  });

  /**
   * Run tests
   */
  getOutlineTest()
  generateOutlineTest()
  updateOutlineFilesTest()


  after(async () => {
    const deleted = await rimraf(`${__dirname}/.tmp`, () => { return })
    console.log('after')
  })

})