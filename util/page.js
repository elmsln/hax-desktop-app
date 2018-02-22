const path = require('path');
const _ = require('underscore');
const fs = require('fs');
const md = require( "markdown" ).markdown;
const marked = require('marked');
const cheerio = require('cheerio');
const Case = require('case');

module.exports = {
  
  getPage: (page) => {
    location = global.location;
    if (!page || !location) return false;
    _path = path.join(location, page);
    if (!fs.existsSync(_path)) return false;
    const file = fs.readFileSync(_path, 'utf8');
    // run this through a parser
    const html = marked(file);
    return html;
  },

  savePage: (page, content) => {
    location = global.location; //gets location
    _path = path.join(location, page);
    console.log({ //prints the path and contents being saved
      path: _path,
      content: content
    });
    try {
      fs.writeFileSync(_path, content, 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  },

  //this function will create a new page and write it to SUMMARY.md
  //currently it completely rewrites the contents of SUMMARY.md
  //but that will be fixed soon(tm)
  createPage: (fileName, content = '') => {
    const fileNameFormatted = Case.snake(fileName) + ".md"; //makes sure the file created has .md extension
    const tocFormatName = `*[${fileName}](${fileNameFormatted})`; //formatted to be added into SUMMARY.md
    const location = global.location;
    _path = path.join(location, fileNameFormatted);
    _summaryFile = path.join(location, 'SUMMARY.md'); //points to the SUMMARY.md file
    if (!fs.existsSync(_path)) {
      try {
        fs.writeFileSync(_path, content, 'utf8'); //writes created .md File to the gitbook location 
        fs.writeFileSync(_summaryFile, tocFormatName, 'utf8'); // writes file name to summary md
        return true;
      } catch (error) {
        return false;
      }
    }    
  },

  /**
   * Converts a string of markdown into html
   * @param {string} markdown 
   * @return {string} html
   */
  parseMarkdown: (markdown) => {
  },

  /**
   * Parse an outline to get the structure of a book
   * @todo This just supports gitbook right now, add other parsers
   * 
   * @returns {string} html outline
   */
  parseOutline: () => {
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