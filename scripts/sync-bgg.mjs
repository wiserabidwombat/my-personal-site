// Fills a Notion games row's BoardGameGeek-sourced fields from BGG -- box
// art plus players, playtimes, year, BGG rating, weight, designer,
// publisher, categories, mechanics, and thumbnail -- so the site never calls
// BGG at request time; api/games.ts just reads Notion. Only EMPTY fields are
// written: nothing already filled is ever overwritten, and personal fields
// (Status, Condition, Notes, Owned, Acquired, ...) are never touched. Safe to
// re-run; a newly added row only needs its name and "BGG Link".
//
//   npm run sync:bgg            # dry run: report what would change
//   npm run sync:bgg -- --write # apply
//
// Requires NOTION_TOKEN, NOTION_DATA_SOURCE_ID, and BGG_API_TOKEN (a
// registered BGG XML API application token, sent as a Bearer header -- BGG
// requires registration for all XML API use). The Notion integration needs
// "Update content" capability for --write.
import { Client, collectAllDataSourceRows, isFullPage } from '@notionhq/client'

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

const decode = (text) =>
  text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

// One BGG <item> -> the Notion property values it can supply, keyed by the
// Notion property name. Numbers of 0 mean "unknown" on BGG, so they're dropped.
function bggFields(block) {
  const value = (tag) => block.match(new RegExp(`<${tag}[^>]*\\bvalue="([^"]*)"`))?.[1]
  const number = (tag) => {
    const n = Number(value(tag))
    return Number.isFinite(n) && n > 0 ? n : undefined
  }
  const links = (type) =>
    [...block.matchAll(new RegExp(`<link type="${type}"[^>]*\\bvalue="([^"]*)"`, 'g'))].map((m) => decode(m[1]))
  const text = (tag) => block.match(new RegExp(`<${tag}>\\s*([^<]+?)\\s*</${tag}>`))?.[1]

  const designers = links('boardgamedesigner').filter((d) => d !== '(Uncredited)')
  return {
    'Players (Min)': number('minplayers'),
    'Players (Max)': number('maxplayers'),
    'Playtime (min)': number('playingtime'),
    'Minimum Playtime': number('minplaytime'),
    'Maximum Playtime': number('maxplaytime'),
    'Year Published': number('yearpublished'),
    'Rating (1–10)': number('average'),
    Weight: number('averageweight'),
    Designer: designers.length ? designers.join(', ') : undefined,
    // BGG lists every regional publisher; the first is the original.
    Publisher: links('boardgamepublisher')[0],
    Categories: links('boardgamecategory'),
    Mechanics: links('boardgamemechanic'),
    'Thumbnail URL': text('thumbnail'),
    'Image URL': text('image'),
  }
}

// BGG answers 202 while it queues a request and 429 when rate limited; both
// mean "try again shortly", so back off and retry a few times.
async function fetchBgg(ids) {
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${ids.join(',')}&stats=1`
  for (let attempt = 1; attempt <= 5; attempt++) {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${BGG_API_TOKEN}` } })
    if (response.status === 200) {
      const xml = await response.text()
      const items = new Map()
      for (const [block, id] of xml.matchAll(/<item [^>]*\bid="(\d+)"[\s\S]*?<\/item>/g)) items.set(id, bggFields(block))
      return items
    }
    if (response.status !== 202 && response.status !== 429) {
      throw new Error(`BGG API error ${response.status}: ${(await response.text()).slice(0, 200)}`)
    }
    await sleep(BGG_DELAY_MS * attempt)
  }
  throw new Error(`BGG API kept deferring the request for ids ${ids.join(',')}`)
}

const { properties: schema } = await notion.dataSources.retrieve({ data_source_id: NOTION_DATA_SOURCE_ID })

function isEmpty(property) {
  switch (property?.type) {
    case 'number':
      return property.number == null
    case 'url':
      return !property.url
    case 'rich_text':
      return property.rich_text.length === 0
    case 'multi_select':
      return property.multi_select.length === 0
    case 'files':
      return property.files.length === 0
    default:
      return false // missing or an unsupported type: never written
  }
}

// Builds the Notion API value for a property from a BGG value, matching the
// property's actual type ("Image URL" is Files & media in this database).
function toNotion(type, value) {
  switch (type) {
    case 'number':
      return { number: Math.round(value * 100000) / 100000 }
    case 'url':
      return { url: value }
    case 'rich_text':
      return { rich_text: [{ type: 'text', text: { content: value } }] }
    case 'multi_select':
      // Notion caps option names at 100 chars and rejects commas in them.
      return { multi_select: value.map((name) => ({ name: name.replace(/,/g, '').slice(0, 100) })) }
    case 'files':
      return { files: [{ type: 'external', name: 'Box art', external: { url: value } }] }
  }
}

const rows = (await collectAllDataSourceRows(notion, { data_source_id: NOTION_DATA_SOURCE_ID, page_size: 100 })).filter(isFullPage)
const fieldNames = Object.keys(bggFields(''))
const games = rows.map((page) => {
  const p = page.properties
  return {
    pageId: page.id,
    name: p.Game?.type === 'title' ? p.Game.title.map((t) => t.plain_text).join('') : 'Untitled',
    id: (p['BGG Link']?.type === 'url' ? p['BGG Link'].url : null)?.match(/\/boardgame(?:expansion)?\/(\d+)/)?.[1] ?? null,
    empty: fieldNames.filter((field) => field in schema && isEmpty(p[field])),
  }
})

const noBggLink = games.filter((game) => !game.id)
const todo = games.filter((game) => game.id && game.empty.length)
console.log(`${games.length} games: ${todo.length} with empty BGG fields to look up, ${noBggLink.length} without a BGG link.`)
for (const game of noBggLink) console.log(`  no BGG link: ${game.name}`)

const bgg = new Map()
const ids = [...new Set(todo.map((game) => game.id))]
for (let i = 0; i < ids.length; i += BGG_BATCH) {
  for (const [id, fields] of await fetchBgg(ids.slice(i, i + BGG_BATCH))) bgg.set(id, fields)
  if (i + BGG_BATCH < ids.length) await sleep(BGG_DELAY_MS)
}

const updates = []
for (const game of todo) {
  const fields = bgg.get(game.id)
  if (!fields) {
    console.log(`  not found on BGG: ${game.name} (id ${game.id})`)
    continue
  }
  const properties = {}
  for (const field of game.empty) {
    const value = fields[field]
    if (value === undefined || (Array.isArray(value) && value.length === 0)) continue
    properties[field] = toNotion(schema[field].type, value)
  }
  if (Object.keys(properties).length) updates.push({ game, properties })
}

console.log(`\n${write ? 'Writing' : 'Dry run: would write'} ${updates.length} game(s):`)
for (const { game, properties } of updates) {
  console.log(`  ${game.name}: ${Object.keys(properties).join(', ')}`)
}
if (!write) {
  console.log('Re-run with --write to apply.')
  process.exit(0)
}

for (const { game, properties } of updates) {
  await notion.pages.update({ page_id: game.pageId, properties })
  await sleep(NOTION_DELAY_MS)
}
console.log(`\nDone: updated ${updates.length} game(s).`)
