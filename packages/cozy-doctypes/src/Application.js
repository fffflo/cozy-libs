const Document = require('./Document')

const APP_DOCTYPE = 'io.cozy.apps'

class Application extends Document.originalClass {}

Application.schema = {
  doctype: APP_DOCTYPE,
  attributes: {}
}

Application.doctype = APP_DOCTYPE

module.exports = Application
