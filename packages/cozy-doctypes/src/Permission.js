const Document = require('./Document')

class Permission extends Document.originalClass {}

Permission.schema = {
  doctype: 'io.cozy.permissions',
  attributes: {}
}

module.exports = Permission
