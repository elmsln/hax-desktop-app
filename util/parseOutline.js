const fs = require('fs');

const parseOutline = (outlinePath) => {
  const file = fs.readFileSync(outlinePath, 'utf8');
  const json = JSON.parse(file);
  return json;
}

module.exports = parseOutline;