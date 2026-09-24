// Run manually (`npm run fetch:games`), not part of `build`. Reads the Notion
// games data source and writes src/data/board-games.json -- the fallback
// snapshot src/hooks/useBoardGames.ts shows only when /api/games fails. Reads
// NOTION_TOKEN / NOTION_DATA_SOURCE_ID from .env.local (gitignored); the
// token never touches client code -- only this Node script sees it.
//
// Rows are mapped with api/games.ts's own mapPage(), loaded through Vite's
// SSR module loader (like scripts/generate-rss.mjs), so the snapshot always
// has exactly the fields the live API returns -- the old hand-copied mapping
// here had drifted and was missing categories, mechanics, and box art.
import { createServer } from 'vite'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Client, collectAllDataSourceRows, isFullPage } from '@notionhq/client'

const { NOTION_TOKEN, NOTION_DATA_SOURCE_ID } = process.env

if (!NOTION_TOKEN || !NOTION_DATA_SOURCE_ID) {
  console.error('Missing NOTION_TOKEN or NOTION_DATA_SOURCE_ID. Copy .env.example to .env.local and fill them in.')
  process.exit(1)
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const outFile = path.join(root, 'src', 'data', 'board-games.json')

const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { mapPage } = await server.ssrLoadModule('/api/games.ts')
  const notion = new Client({ auth: NOTION_TOKEN })
  const rows = await collectAllDataSourceRows(notion, { data_source_id: NOTION_DATA_SOURCE_ID, page_size: 100 })
  const games = rows.filter(isFullPage).map(mapPage)
  await writeFile(outFile, JSON.stringify(games, null, 2) + '\n')
  console.log(`Wrote ${games.length} games to ${path.relative(root, outFile)}`)
} finally {
  await server.close()
}
