const parseOutline = require('./parseOutline');
const $ = require('cheerio');
const fs = require('fs');
const TurndownService = require('turndown');

module.exports = (fileName, parent) => {
    const outlineImp = parseOutline(); //turns SUMMARY.md into HTML
    const addedFile = fileName;
    const turndownService = new TurndownService(); 
    $('ul').append(`<li><a data-href="${fileNameFormatted}">${PageTitle}</a></li>`); //fileNameFormatted comes from page.js
    const newSummHTML = $.html();
    const newSummMarkdown = turndownService.turndown(newSummHTML); //converts html into markdown
    fs.writeFileSync(location, newSummMarkdown); //writes to SUMMARY.md
}