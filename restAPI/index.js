const fs = require('fs')
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
 * Return an appstore file with the windowID
 * file upload path
 */
router.get('/appstore/:windowID', (ctx, next) => {
  const windowID = ctx.params.windowID || null;
  if (!windowID) return;
  // load the default appstore
  let appstore = fs.readFileSync(path.join(__dirname, '../app/appstore.json'), 'utf8')
  // turn it into json
  appstore = JSON.parse(appstore)
  // find the 'Local Files' one
  const appstoreApps = appstore.apps.map(app => {
    const title = _.get(app, 'details.title', null)
    if (title === "Local files") {
      _.set(app, 'connection.protocol', 'http')
      _.set(app, 'connection.url', `/fileupload/${windowID}`)
    }
    return app
  })
  // return the appstore
  ctx.body = Object.assign({}, appstore, { apps: appstoreApps })
});

router.post('/fileupload', (ctx, next) => {
  // access the files
  const files = ctx.request.body.files;
  // get the files
  _.each(files, file => {
    console.log(file.path)
  })
});

app
  .use(router.routes())
  .use(json({ pretty: false, param: 'pretty' }))

app.listen(3000)