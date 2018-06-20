const fetch = require('isomorphic-unfetch')

const { getHeaders, parseXml, parseBool, parseEpoch } = require('../utils')

function mapDirectories(obj) {
  return obj.MediaContainer.Directory.map(({ $, Location = [] }) => ({
    allowSync: parseBool($.allowSync),
    art: $.art,
    composite: $.composite,
    filters: parseBool($.filters),
    refreshing: parseBool($.refreshing),
    thumb: $.thumb,
    key: $.key,
    type: $.type,
    title: $.title,
    agent: $.agent,
    scanner: $.scanner,
    language: $.language,
    uuid: $.uuid,
    updatedAt: parseEpoch($.updatedAt),
    createdAt: parseEpoch($.createdAt),
    scannedAt: parseEpoch($.scannedAt),
    locations: Location.map(({ $ }) => ({
      id: parseInt($.id),
      path: $.path
    }))
  }))
}

async function getSections(ctx, uri) {
  const response = await fetch(`${uri}/library/sections`, {
    headers: getHeaders(ctx)
  })

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)

  const xml = await response.text()
  return await parseXml(xml, obj => mapDirectories(obj))
}

async function getSection(ctx, uri, key) {
  const response = await fetch(`${uri}/library/sections/${key}`, {
    headers: getHeaders(ctx)
  })

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)

  const xml = await response.text()

  return await parseXml(xml, obj => mapDirectories(obj))
}

module.exports.sections = async (obj, { uri }, ctx) => {
  return await getSections(ctx, uri)
}

module.exports.section = async (obj, { uri, key }, ctx) => {
  return await getSection(ctx, uri, key)
}
