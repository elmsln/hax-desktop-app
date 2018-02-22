const parseOutline = require('./parseOutline');
const $ = require('cheerio');

module.exports = (fileName, page) => {
    const outlineImp = parseOutline();
    $('ul').append('');     
}
