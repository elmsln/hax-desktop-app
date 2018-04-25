const fs = require('fs');
const assert = require('assert');
const getOutline = require('../util/getOutline');

describe('getOutline', function() {
  it('it should be able to fetch a valid outline.', async function() {
    const outline = await getOutline(`${__dirname}/outline.json`);
  });
  it('it should be ok with an empty outline.', async function() {
    const outline = await getOutline(`${__dirname}/emptyOutline.json`);
  });
  it('it should return an error on an invalid outline', async function() {
    try {
      const outline = await getOutline(`${__dirname}/badOutline.json`);
    } catch (error) {
      assert(error);
    }
  });
  it('it should return an error if one does not exist.', async function() {
    try {
      const outline = await getOutline(`${__dirname}/404.json`);
    } catch (error) {
      assert(error);
    }
  });
});