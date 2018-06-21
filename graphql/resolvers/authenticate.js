const querystring = require('querystring')
const uuidv4 = require('uuid/v4')
const jwt = require('jsonwebtoken')
const fetch = require('isomorphic-unfetch')
const { ResponseError } = require('../utils')

async function getUser(ctx, credentials = {}) {
  const identifier = uuidv4()
  const response = await fetch('https://plex.tv/users/sign_in.json', {
    method: 'POST',
    headers: {
      'X-Plex-Client-Identifier': identifier,
      'X-Plex-Product': ctx.app.name,
      'X-Plex-Version': ctx.app.version
    },
    body: querystring.stringify({
      'user[login]': credentials.username,
      'user[password]': credentials.password
    })
  })

  if (!response.ok) throw new ResponseError(response)

  const {
    error,
    user: {
      id,
      uuid,
      email,
      joined_at: joinedAt,
      username,
      title,
      thumb,
      hasPassword,
      authToken
    } = {}
  } = await response.json()

  if (error) throw new Error(error)

  const token = jwt.sign({ authToken, identifier }, ctx.jwtSecret)

  return {
    token,
    user: {
      id,
      uuid,
      email,
      joinedAt,
      username,
      title,
      thumb,
      hasPassword,
      authToken
    }
  }
}

module.exports.authenticate = async (obj, { username, password }, ctx) => {
  const { token, user } = await getUser(ctx, { username, password })
  return { token, user }
}
