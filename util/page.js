const path = require('path');
const _ = require('underscore');
const fs = require('fs');
const md = require( "markdown" ).markdown;
const marked = require('marked');
const cheerio = require('cheerio');

module.exports = {

  getPage(page) {
    page = _.isString() ? page : 'index.html';
    location = global.location;
    _path = path.join(location, page);
    if (!fs.existsSync(_path)) return false;
    let file = fs.readFileSync(_path, 'utf8');
    return file;
  },

  savePage(page, content) {
    page = _.isString() ? page : 'index.html';
    location = global.location;
    _path = path.join(location, _page);
    if (!fs.existsSync(_path)) return false;
    try {
      fs.writeFileSync(_path, content, 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  },

  createPage(name, content = '') {
  },

  /**
   * Parse an outline to get the structure of a book
   * @todo This just supports gitbook right now, add other parsers
   * 
   * @returns {string} html outline
   */
  parseOutline() {
    const location = global.location;
    const outlinePath = path.join(location, 'SUMMARY.md');
    try {
      const outlineMarkdown = fs.readFileSync(outlinePath, 'utf8');
      let outlineHTML = marked(outlineMarkdown);
      const $ = cheerio.load(outlineHTML);
      // switch out the hrefs for data-hrefs
      $('a').each((i, elem) => {
        const href = $(elem).attr('href');
        $(elem).attr('href', null);
        $(elem).attr('data-href', href);
      })
      // look for the first bulletlist in the summary file.
      return $.html();
    } catch (error) {
      return error;
    }
  },

}