// Build-time only. Reads NOTION_TOKEN / NOTION_DATABASE_ID from the environment
// (see .env.local, gitignored) and writes a plain JSON snapshot to src/data/board-games.json.
// The token never touches client code -- only this Node script sees it.
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const NOTION_TOKEN = process.env.NOTION_TOKEN
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error(
    'Missing NOTION_TOKEN or NOTION_DATABASE_ID. Copy .env.example to .env.local and fill them in.'
  )
  process.exit(1)
}

function plainText(richTextArray) {
  return richTextArray?.map((t) => t.plain_text).join('') || null
}

function mapPage(page) {
  const p = page.properties
  return {
    id: page.id,
    name: p.Game?.title?.[0]?.plain_text ?? 'Untitled',
    tags: p.Tags?.multi_select?.map((t) => t.name) ?? [],
    rating: p['Rating (1–10)']?.number ?? null,
    status: p.Status?.status?.name ?? null,
    owned: p.Owned?.checkbox ?? false,
    playersMin: p['Players (Min)']?.number ?? null,
    playersMax: p['Players (Max)']?.number ?? null,
    playtimeMinutes: p['Playtime (min)']?.number ?? null,
    designer: plainText(p.Designer?.rich_text),
    publisher: plainText(p.Publisher?.rich_text),
    yearPublished: p['Year Published']?.number ?? null,
    lastPlayed: p['Last Played']?.date?.start ?? null,
    bggLink: p['BGG Link']?.url ?? null,
    notionUrl: page.url,
  }
}

async function fetchAllPages() {
  const games = []
  let cursor = undefined

  do {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
      }
    )

    if (!response.ok) {
      throw new Error(`Notion API error ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    games.push(...data.results.map(mapPage))
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  return games
}

const games = await fetchAllPages()
const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'data',
  'board-games.json'
)
await writeFile(outPath, JSON.stringify(games, null, 2) + '\n')
console.log(`Wrote ${games.length} games to ${path.relative(process.cwd(), outPath)}`)
