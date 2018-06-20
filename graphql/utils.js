const jwt = require('jsonwebtoken')
const { parseString } = require('xml2js')

module.exports.parseBool = string => string && !!parseInt(string)

module.exports.parseEpoch = string => string && new Date(parseInt(string) * 1e3)

module.exports.getHeaders = ctx => {
  const Authorization = ctx.request.get('Authorization')

  if (!Authorization) throw new Error('Not authorized')

  const token = Authorization.replace('Bearer ', '')

  const { authToken, identifier } = jwt.verify(token, ctx.jwtSecret)

  return {
    Host: 'plex.tv',
    'X-Plex-Token': authToken,
    'X-Plex-Client-Identifier': identifier,
    'X-Plex-Product': ctx.app.name,
    'X-Plex-Version': ctx.app.version
  }
}

module.exports.parseXml = (xmlString, mapFn) =>
  new Promise((resolve, reject) => {
    parseString(xmlString, (err, result) => {
      if (err) reject(err)
      if (result.errors) reject(result.errors.error.join('\n'))

      resolve(mapFn ? mapFn(result) : result)
    })
  })
