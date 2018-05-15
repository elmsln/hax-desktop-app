const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const Koa = require('koa');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const Router = require('koa-router');
const json = require('koa-json')
const app = new Koa();
const router = new Router();

// logger 
app.use(logger());

// Enable multipart
app.use(koaBody({ multipart: true }));

/**
 * Return an appstore file with the id
 * file upload path
 */
router.get('/appstore/:id', (ctx, next) => {
  const id = ctx.params.id || null;
  if (!id) return;
  // load the default appstore
  let appstore = fs.readFileSync(path.join(__dirname, '../app/appstore.json'), 'utf8')
  // turn it into json
  appstore = JSON.parse(appstore)
  // find the 'Local Files' one
  const appstoreApps = appstore.apps.map(app => {
    const title = _.get(app, 'details.title', null)
    if (title === "Local files") {
      _.set(app, 'connection.protocol', 'http')
      _.set(app, 'connection.url', 'localhost:3000')
      _.set(app, 'connection.operations.add.endPoint', `fileupload`)
      _.set(app, 'connection.headers', {
        'hax-project-location': id
      })
    }
    return app
  })
  // return the appstore
  ctx.body = Object.assign({}, appstore, { apps: appstoreApps })
});

router.post('/fileupload', (ctx, next) => {
  /**
   * @todo  Find out how the heck to save
   * this write stream loca
   */
  // console.log(ctx.request.body.files)
  // _.each(ctx.request.body.files, (file) => {
  //   file._writeStream
  // })

  const projectLocation = _.get(ctx, 'headers.hax-project-location')
  const uploadLocation = ctx.request.body;
  console.log(uploadLocation)
  if (typeof uploadLocation === 'string') {
    const filename = path.basename(uploadLocation)
    const dest = path.join(decodeURIComponent(projectLocation), 'assets', filename)
    fs.copyFileSync(uploadLocation, dest)
    ctx.body = { 
      data: {
        file: {
          url: dest
        }
      }
    }
  }
  else {
    /**
     * This is a totally cheating way of doing this
     */
    const hopefulFileName = _.get(ctx, 'request.body.files.file-upload.name')
    const hopefulFilePath = path.join(projectLocation, 'assets', hopefulFileName)
    ctx.body = { 
      data: {
        file: {
          url: hopefulFilePath
        }
      }
    }
  }
});

app
  .use(router.routes())
  .use(json({ pretty: false, param: 'pretty' }))

app.listen(3000)