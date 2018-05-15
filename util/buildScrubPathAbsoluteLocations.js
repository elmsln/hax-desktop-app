/**
 * Removes the absolute file locations from the build directory
 */
const fs = require('fs')
const path = require('path')
const TextSearch = require('rx-text-search');

scrub = (projectLocation) => {
  // Find .txt files containing "sometext" in test/doc and all its sub-directories
  TextSearch.find(projectLocation, '**.*', {cwd: path.join(projectLocation, 'docs', 'content')})
    .subscribe(
      function (result) {
        // load file
        console.log(result)
        const file = fs.readFileSync(path.join(result.term, 'docs', 'content', result.file), 'utf8')
        const cleanFile = file.replace(`${projectLocation}/`, '')
        console.log(cleanFile)
        fs.writeFileSync(path.join(result.term, 'docs', 'content', result.file), cleanFile, 'utf8')
      },
      function (err) {
        console.log(err)
        // handle error
      }
    );
}

module.exports = scrub
