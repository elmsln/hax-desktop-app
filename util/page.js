const path = require('path');
const _ = require('underscore');
const fs = require('fs');
const md = require( "markdown" ).markdown;
const marked = require('marked');
const cheerio = require('cheerio');

// getPage('introduction/learning-objectives.md');

module.exports = {
  
  getPage(page) {
    location = global.location;
    _path = path.join(location, page);
    if (!fs.existsSync(_path)) return false;
    const file = fs.readFileSync(_path, 'utf8');
    // run this through a parser
    const html = marked(file);
    return html;
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
   * Converts a string of markdown into html
   * @param {string} markdown 
   * @return {string} html
   */
  parseMarkdown(markdown) {
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