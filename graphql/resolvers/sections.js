const fetch = require('isomorphic-unfetch')

const {
  ResponseError,
  getHeaders,
  parseXml,
  parseBool,
  parseEpoch
} = require('../utils')

const flattenTag = (Node = []) => Node.map(({ $ }) => $.tag)

const mapSections = (Section = []) =>
  Section.map(({ $, Location = [] }) => ({
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

const mapDirectories = (Directory = [], uri) =>
  Directory.map(({ $ }) => ({
    key: $.key,
    title: $.title,
    secondary: parseBool($.secondary),
    prompt: $.prompt,
    uri: `${uri}/${$.key}`
  }))

const mapVideos = (Video = [], uri) =>
  Video.map(
    ({
      $,
      Media = [],
      Genre = [],
      Director = [],
      Writer = [],
      Country = [],
      Role = []
    }) => ({
      ratingKey: parseInt($.ratingKey),
      parentRatingKey: parseInt($.parentRatingKey),
      grandparentRatingKey: parseInt($.grandparentRatingKey),
      key: $.key,
      parentKey: $.parentKey,
      grandparentKey: $.grandparentKey,
      studio: $.studio,
      type: $.type,
      title: $.title,
      parentTitle: $.parentTitle,
      grandparentTitle: $.grandparentTitle,
      contentRating: $.contentRating,
      summary: $.summary,
      rating: parseFloat($.rating),
      audienceRating: parseFloat($.audienceRating),
      viewCount: parseInt($.viewCount),
      lastViewedAt: parseEpoch($.lastViewedAt),
      index: parseInt($.index),
      parentIndex: parseInt($.parentIndex),
      year: parseInt($.year),
      tagline: $.tagline,
      thumb: $.thumb,
      parentThumb: $.parentThumb,
      grandparentThumb: $.grandparentThumb,
      art: $.art,
      grandparentArt: $.grandparentArt,
      grandparentTheme: $.grandparentTheme,
      duration: parseInt($.duration),
      originallyAvailableAt: $.originallyAvailableAt,
      addedAt: parseEpoch($.addedAt),
      updatedAt: parseEpoch($.updatedAt),
      audienceRatingImage: $.audienceRatingImage,
      chapterSource: $.chapterSource,
      primaryExtraKey: $.primaryExtraKey,
      ratingImage: $.ratingImage,
      media: Media.map(({ $, Part = [] }) => ({
        videoResolution: $.videoResolution,
        id: parseInt($.id),
        duration: parseInt($.duration),
        bitrate: parseInt($.bitrate),
        width: parseInt($.width),
        height: parseInt($.height),
        aspectRatio: parseFloat($.aspectRatio),
        audioChannels: parseInt($.audioChannels),
        audioCodec: $.audioCodec,
        videoCodec: $.videoCodec,
        container: $.container,
        videoFrameRate: $.videoFrameRate,
        audioProfile: $.audioProfile,
        videoProfile: $.videoProfile,
        parts: Part.map(({ $ }) => ({
          id: parseInt($.id),
          key: $.key,
          duration: parseInt($.duration),
          file: $.file,
          size: parseFloat($.size),
          audioProfile: $.audioProfile,
          container: $.container,
          has64bitOffsets: parseBool($.has64bitOffsets),
          optimizedForStreaming: parseBool($.optimizedForStreaming),
          videoProfile: $.videoProfile
        }))
      })),
      genres: flattenTag(Genre),
      directors: flattenTag(Director),
      writers: flattenTag(Writer),
      countries: flattenTag(Country),
      roles: flattenTag(Role)
    })
  )

const mapDirectory = (MediaContainer = {}, uri) => ({
  directories: mapDirectories(MediaContainer.Directory, uri),
  videos: mapVideos(MediaContainer.Video)
})

async function getSections(ctx, uri) {
  const response = await fetch(`${uri}/library/sections`, {
    headers: getHeaders(ctx)
  })

  if (!response.ok) throw new ResponseError(response)

  const xml = await response.text()
  return await parseXml(xml, obj => mapSections(obj.MediaContainer.Directory))
}

async function getSection(ctx, uri, index) {
  const response = await fetch(`${uri}/library/sections/${index}`, {
    headers: getHeaders(ctx)
  })

  if (!response.ok) throw new ResponseError(response)

  const xml = await response.text()

  return await parseXml(xml, obj =>
    mapDirectories(
      obj.MediaContainer.Directory,
      `${uri}/library/sections/${index}`
    )
  )
}

async function getDirectory(ctx, uri) {
  const response = await fetch(`${uri}`, { headers: getHeaders(ctx) })

  if (!response.ok) throw new ResponseError(response)

  const xml = await response.text()

  return await parseXml(xml, obj => mapDirectory(obj.MediaContainer, uri))
}

module.exports.sections = async (obj, { uri }, ctx) => {
  return await getSections(ctx, uri)
}

module.exports.section = async (obj, { uri, index }, ctx) => {
  return await getSection(ctx, uri, index)
}

module.exports.directory = async (obj, { uri, key }, ctx) => {
  return await getDirectory(ctx, uri, key)
}
