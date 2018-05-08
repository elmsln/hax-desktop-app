const assert = require('assert')
const rimraf = require('rimraf')
const getOutline = require('../util/getOutline')

module.exports = () => {
  describe('getOutlineTest', () => {
    it('it should be able to fetch a valid outline.', async function () {
      const outline = await getOutline(`${__dirname}/outline.json`);
    });
  })
}