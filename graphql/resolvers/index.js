const { authenticate } = require('./authenticate')
const { resources } = require('./resources')

module.exports = {
  Query: {
    authenticate,
    resources
  }
}
