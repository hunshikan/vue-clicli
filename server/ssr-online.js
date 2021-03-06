const Router = require('koa-router')
const path = require('path')
const fs = require('fs')
const weekList = require('./week-list')
const Jx = require('./jx')
const tyy = require('./api/tyy')
const hcy = require('./api/hcy')
const bit = require('./api/bit')
const kandian = require('./api/kandian')
const bjh = require('./api/bjh')
const uraban = require('./api/uraban')


const VueServerRenderer = require('vue-server-renderer')
const clientManifest = require('../dist/vue-ssr-client-manifest.json')

const bundle = require('../dist/server-build.js').default
const template = fs.readFileSync(
  path.join(__dirname, './template.html'),
  'utf-8'
)
const renderer = VueServerRenderer.createRenderer({
  template,
  clientManifest
})

const router = new Router()

router.get('/jx/', Jx.default)
router.get('/bit/down/:fid', bit.getUrl)
router.get('/bit/list', bit.getList)
router.get('/hcy/down/:fid', hcy.getUrl)
router.get('/hcy/list', hcy.getList)
router.get('/tyy/down', tyy.getUrl)
router.get('/kandian/down/:vid', kandian.getUrl)
router.get('/kandian/list', kandian.getList)
router.get('/bjh/down/:mid', bjh.getUrl)
router.get('/uraban', uraban.uraban)

router.get('/week/', weekList.getWeekList)

router.get('*', async ctx => {
  ctx.request.headers['user-agent'] = ctx.request.headers['user-agent'] + ' 115Browser/9.0.0'
  ctx.type = 'html'
  const cookie = ctx.cookies.get('uname')
  if (cookie) {
    let data = fs.readFileSync(path.join(__dirname, '../dist/spa/index.html'))
    ctx.body = data.toString()
  } else {
    const context = {
      url: ctx.path
    }
    try {
      const app = await bundle(context)

      const appString = await renderer.renderToString(app, context)

      ctx.body = appString
    } catch (err) {
      console.log('render error', err)
      throw err
    }
  }
})
module.exports = router
