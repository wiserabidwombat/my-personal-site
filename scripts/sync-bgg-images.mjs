// One-time (re-runnable) sync: copies each game's full-size box art URL from
// BoardGameGeek into the Notion games database's "Image URL" property, so the
// site never calls BGG at request time -- api/games.ts just reads the stored
// URL. Only fills rows whose "Image URL" is empty, so re-running it is safe.
//
//   npm run sync:bgg-images            # dry run: report what would change
//   npm run sync:bgg-images -- --write # create the property if needed, write
//
// Requires NOTION_TOKEN, NOTION_DATA_SOURCE_ID, and BGG_API_TOKEN (a
// registered BGG XML API application token, sent as a Bearer header -- BGG
// requires registration for all XML API use). The Notion integration needs
// "Update content" capability for --write.
import { Client, collectAllDataSourceRows, isFullPage } from '@notionhq/client'

const PROPERTY = 'Image URL'
const BGG_BATCH = 20 // BGG's documented max ids per /thing request
const BGG_DELAY_MS = 5000 // stay well under BGG's rate limit between requests
const NOTION_DELAY_MS = 350 // Notion allows ~3 requests/second

const { NOTION_TOKEN, NOTION_DATA_SOURCE_ID, BGG_API_TOKEN } = process.env
const write = process.argv.includes('--write')

for (const [name, value] of Object.entries({ NOTION_TOKEN, NOTION_DATA_SOURCE_ID, BGG_API_TOKEN })) {
  if (!value) {
    console.error(`Missing ${name}. Add it to .env.local.`)
    process.exit(1)
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const notion = new Client({ auth: NOTION_TOKEN })

function storedUrl(property) {
  if (property?.type === 'url') return property.url
  if (property?.type === 'files') {
    const file = property.files[0]
    return file?.type === 'external' ? file.external.url : (file?.file?.url ?? null)
  }
  return null
}

function propertyValue(url) {
  return propertyType === 'files' ? { files: [{ type: 'external', name: 'Box art', external: { url } }] } : { url }
}

function bggId(url) {
  return url?.match(/\/boardgame(?:expansion)?\/(\d+)/)?.[1] ?? null
}

// BGG answers 202 while it queues a request and 429 when rate limited; both
// mean "try again shortly", so back off and retry a few times.
async function fetchBggImages(ids) {
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${ids.join(',')}`
  for (let attempt = 1; attempt <= 5; attempt++) {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${BGG_API_TOKEN}` } })
    if (response.status === 200) {
      const xml = await response.text()
      const images = new Map()
      for (const [block, id] of xml.matchAll(/<item [^>]*\bid="(\d+)"[\s\S]*?<\/item>/g)) {
        const image = block.match(/<image>\s*([^<]+?)\s*<\/image>/)?.[1]
        if (image) images.set(id, image)
      }
      return images
    }
    if (response.status !== 202 && response.status !== 429) {
      throw new Error(`BGG API error ${response.status}: ${(await response.text()).slice(0, 200)}`)
    }
    await sleep(BGG_DELAY_MS * attempt)
  }
  throw new Error(`BGG API kept deferring the request for ids ${ids.join(',')}`)
}

const dataSource = await notion.dataSources.retrieve({ data_source_id: NOTION_DATA_SOURCE_ID })
// Works with either property type: "Files & media" (the URL is stored as an
// external file, so Notion shows a preview) or "URL". A missing property is
// created as a URL property.
const propertyType = dataSource.properties[PROPERTY]?.type ?? 'url'
if (propertyType !== 'url' && propertyType !== 'files') {
  console.error(`"${PROPERTY}" is a ${propertyType} property; expected Files & media or URL.`)
  process.exit(1)
}
if (!(PROPERTY in dataSource.properties)) {
  console.log(`"${PROPERTY}" property doesn't exist yet${write ? ' -- creating it (type: url).' : ' -- --write would create it (type: url).'}`)
  if (write) {
    await notion.dataSources.update({ data_source_id: NOTION_DATA_SOURCE_ID, properties: { [PROPERTY]: { url: {} } } })
  }
}

const rows = (await collectAllDataSourceRows(notion, { data_source_id: NOTION_DATA_SOURCE_ID, page_size: 100 })).filter(isFullPage)
const games = rows.map((page) => {
  const p = page.properties
  return {
    pageId: page.id,
    name: p.Game?.type === 'title' ? p.Game.title.map((t) => t.plain_text).join('') : 'Untitled',
    id: bggId(p['BGG Link']?.type === 'url' ? p['BGG Link'].url : null),
    current: storedUrl(p[PROPERTY]),
  }
})

const alreadySet = games.filter((game) => game.current)
const noBggLink = games.filter((game) => !game.current && !game.id)
const todo = games.filter((game) => !game.current && game.id)
console.log(`${games.length} games: ${alreadySet.length} already have an image, ${todo.length} to look up, ${noBggLink.length} without a BGG link.`)
for (const game of noBggLink) console.log(`  no BGG link: ${game.name}`)

const found = new Map()
const ids = [...new Set(todo.map((game) => game.id))]
for (let i = 0; i < ids.length; i += BGG_BATCH) {
  const batch = ids.slice(i, i + BGG_BATCH)
  for (const [id, image] of await fetchBggImages(batch)) found.set(id, image)
  console.log(`  BGG: looked up ${Math.min(i + BGG_BATCH, ids.length)}/${ids.length}`)
  if (i + BGG_BATCH < ids.length) await sleep(BGG_DELAY_MS)
}

const updates = todo.filter((game) => found.has(game.id))
const missing = todo.filter((game) => !found.has(game.id))
for (const game of missing) console.log(`  no image on BGG: ${game.name} (id ${game.id})`)

if (!write) {
  console.log(`\nDry run: would set "${PROPERTY}" on ${updates.length} games. Samples:`)
  for (const game of updates.slice(0, 3)) console.log(`  ${game.name}: ${found.get(game.id)}`)
  console.log('Re-run with --write to apply.')
  process.exit(0)
}

let written = 0
for (const game of updates) {
  await notion.pages.update({ page_id: game.pageId, properties: { [PROPERTY]: propertyValue(found.get(game.id)) } })
  written++
  if (written % 20 === 0) console.log(`  Notion: wrote ${written}/${updates.length}`)
  await sleep(NOTION_DELAY_MS)
}
console.log(`\nDone: set "${PROPERTY}" on ${written} games (${missing.length} had no image on BGG).`)
