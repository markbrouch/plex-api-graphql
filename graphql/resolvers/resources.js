const fetch = require('isomorphic-unfetch')

const {
  ResponseError,
  getHeaders,
  parseXml,
  parseBool,
  parseEpoch
} = require('../utils')

async function getResources(ctx) {
  const response = await fetch('https://plex.tv/api/resources', {
    headers: getHeaders(ctx)
  })

  if (!response.ok) throw new ResponseError(response)

  const xml = await response.text()
  return await parseXml(xml, obj =>
    obj.MediaContainer.Device.map(({ $, Connection }) => ({
      name: $.name,
      product: $.product,
      productVersion: $.productVersion,
      platform: $.platform,
      platformVersion: $.platformVersion,
      device: $.device,
      clientIdentifier: $.clientIdentifier,
      createdAt: parseEpoch($.createdAt),
      lastSeenAt: parseEpoch($.lastSeenAt),
      provides: $.provides,
      owned: parseBool($.owned),
      accessToken: $.accessToken,
      publicAddress: $.publicAddress,
      httpsRequired: parseBool($.httpsRequired),
      synced: parseBool($.synced),
      relay: parseBool($.relay),
      publicAddressMatches: parseBool($.publicAddressMatches),
      presence: parseBool($.presence),
      connections: Connection.map(({ $ }) => ({
        protocol: $.protocol,
        address: $.address,
        port: parseInt($.port),
        uri: $.uri,
        local: parseBool($.local)
      }))
    }))
  )
}

module.exports.resources = async (obj, args, ctx) => {
  return await getResources(ctx)
}
