const fs = require('fs-extra')
const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')
const build = require('../../util/build')

module.exports = () => {
  describe('buildTest', () => {
    // define the location of the default project
    const projectLocation = path.join(__dirname, '../assets/project_example')
    const buildPath = path.join(projectLocation, '_site')
    // run the build
    const built = build(projectLocation)

    // Now test
    it('it should correctly build a project', function () {
      assert(fs.existsSync(buildPath))
    });
    it('it should have an index file', function () {
      assert(fs.existsSync(path.join(buildPath, 'index.html')))
    });
    it('it should have an outline.json file', function () {
      assert(fs.existsSync(path.join(buildPath, 'outline.json')))
    });
    it('it should have an assets folder', function () {
      assert(fs.existsSync(path.join(buildPath, 'assets')))
    });
    it('it should have a content folder', function () {
      assert(fs.existsSync(path.join(buildPath, 'content')))
    });
    it('it should have a bower components folder', function () {
      assert(fs.existsSync(path.join(buildPath, 'bower_components')))
    });

    // clean up the build directory
    after(() => {
      const deleted = rimraf(buildPath, () => { return })
    })
  })
}