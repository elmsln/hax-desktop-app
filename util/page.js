const path = require('path');
const _ = require('underscore');
const fs = require('fs');
const md = require( "markdown" ).markdown;
const marked = require('marked');
const cheerio = require('cheerio');
const Case = require('case');

// getPage('introduction/learning-objectives.md');

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
    location = global.location;
    _path = path.join(location, page);
    console.log({
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

  //file name normalizer does not work. something does not like this function
  //but when adding the main function lines in createPage then it works fine
  //trying to figure out why this function doesn't work
  fileNameNormalizer: (fileName) => { 
    let newFileName = "";
    fileName = Case.snake(fileName);
    newFileName = fileName = fileName + ".md";
    return newFileName;
  },

  createPage: (fileName, content = '') => {
    //const normalFileName = fileNameNormalizer(fileName);
    //fileNameNormalizer is not working
    fileName = Case.snake(fileName) + ".md";
    location = global.location;
    //_path = path.join(location, normalFileName);
    _path = path.join(location, fileName);
    if (!fs.existsSync(_path)) {
      try {
        fs.writeFileSync(_path, content, 'utf8');
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