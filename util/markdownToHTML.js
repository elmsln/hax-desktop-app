const marked = require('marked')

module.exports = (markdown) => {
  const html = marked(markdown);
  return html;
}