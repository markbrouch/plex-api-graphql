const { authenticate } = require('./authenticate')
const { resources } = require('./resources')
const sections = require('./sections')

module.exports = {
  Query: {
    authenticate,
    resources,
    ...sections
  }
}
