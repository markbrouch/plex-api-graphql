const crypto = require('crypto')
const { GraphQLServer } = require('graphql-yoga')
const resolvers = require('./graphql/resolvers')

const { version } = require('./package.json')

function createPlexGraphQLServer({
  jwtSecret = crypto.randomBytes(256).toString('base64'),
  appName = 'PlexGraphQL',
  appVersion = version,
  ...options
} = {}) {
  const server = new GraphQLServer({
    typeDefs: './graphql/schema.graphql',
    resolvers,
    context: req => ({
      ...req,
      jwtSecret,
      app: {
        name: appName,
        version: appVersion
      }
    })
  })

  server.createHttpServer(options)

  return server.express
}

module.exports = createPlexGraphQLServer
