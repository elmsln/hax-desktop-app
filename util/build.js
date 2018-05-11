const fs = require('fs-extra')
const path = require('path')
const BUILD_DIR_NAME = '_build';
const BOWER_COMPONENTS_DIR = '../app/bower_components'

/**
 * Create a build of the outline and put all the content in the
 * project location.
 * @param projectLocation
 */
module.exports = (projectLocation) => {
  try {
    const buildTemplateDir = path.join(__dirname, '../app/build_template')
    const buildDir = path.join(projectLocation, BUILD_DIR_NAME)
    const bowerComponentsDir = path.join(__dirname, BOWER_COMPONENTS_DIR)
    const buildbowerComponentsDir = path.join(buildDir, 'bower_components')

    // move the template
    fs.copySync(buildTemplateDir, buildDir)
    // move the default bower components directory
    fs.copySync(bowerComponentsDir, buildbowerComponentsDir)
    // relocate the contents of the project folder stuff
    fs.copySync(path.join(projectLocation, 'outline.json'), path.join(buildDir, 'outline.json'))
    fs.copySync(path.join(projectLocation, 'content'), path.join(buildDir, 'content'))
    fs.copySync(path.join(projectLocation, 'assets'), path.join(buildDir, 'assets'))
  } catch (error) {
    console.log(error)
    return
  }
}

/**
 * Export the build directory name
 */
// module.exports.BUILD_DIR_NAME = BUILD_DIR_NAME