import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Client, collectAllDataSourceRows, isFullPage } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client'

export type BoardGame = {
  id: string
  name: string
  tags: string[]
  categories: string[]
  mechanics: string[]
  rating: number | null
  status: string | null
  owned: boolean
  playersMin: number | null
  playersMax: number | null
  playtimeMinutes: number | null
  designer: string | null
  publisher: string | null
  yearPublished: number | null
  lastPlayed: string | null
  bggLink: string | null
  notionUrl: string
}

function plainText(richText: { plain_text: string }[] | undefined) {
  return richText?.map((t) => t.plain_text).join('') || null
}

function mapPage(page: PageObjectResponse): BoardGame {
  const p = page.properties

  const title = p.Game?.type === 'title' ? p.Game.title : []
  const tags = p.Tags?.type === 'multi_select' ? p.Tags.multi_select : []
  const categories = p.Categories?.type === 'multi_select' ? p.Categories.multi_select : []
  const mechanics = p.Mechanics?.type === 'multi_select' ? p.Mechanics.multi_select : []
  const rating = p['Rating (1–10)']?.type === 'number' ? p['Rating (1–10)'].number : null
  const status = p.Status?.type === 'status' ? p.Status.status : null
  const owned = p.Owned?.type === 'checkbox' ? p.Owned.checkbox : false
  const playersMin = p['Players (Min)']?.type === 'number' ? p['Players (Min)'].number : null
  const playersMax = p['Players (Max)']?.type === 'number' ? p['Players (Max)'].number : null
  const playtimeMinutes =
    p['Playtime (min)']?.type === 'number' ? p['Playtime (min)'].number : null
  const designer = p.Designer?.type === 'rich_text' ? plainText(p.Designer.rich_text) : null
  const publisher = p.Publisher?.type === 'rich_text' ? plainText(p.Publisher.rich_text) : null
  const yearPublished =
    p['Year Published']?.type === 'number' ? p['Year Published'].number : null
  const lastPlayed =
    p['Last Played']?.type === 'date' ? (p['Last Played'].date?.start ?? null) : null
  const bggLink = p['BGG Link']?.type === 'url' ? p['BGG Link'].url : null

  return {
    id: page.id,
    name: plainText(title) ?? 'Untitled',
    tags: tags.map((tag) => tag.name),
    categories: categories.map((category) => category.name),
    mechanics: mechanics.map((mechanic) => mechanic.name),
    rating,
    status: status?.name ?? null,
    owned,
    playersMin,
    playersMax,
    playtimeMinutes,
    designer,
    publisher,
    yearPublished,
    lastPlayed,
    bggLink,
    notionUrl: page.url,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { NOTION_TOKEN, NOTION_DATA_SOURCE_ID } = process.env

  if (!NOTION_TOKEN || !NOTION_DATA_SOURCE_ID) {
    res.status(500).json({ error: 'Notion is not configured on the server.' })
    return
  }

  try {
    const notion = new Client({ auth: NOTION_TOKEN })
    const rows = await collectAllDataSourceRows(notion, {
      data_source_id: NOTION_DATA_SOURCE_ID,
      page_size: 100,
    })
    const games = rows.filter(isFullPage).map(mapPage)

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({ games })
  } catch (error) {
    console.error('Notion fetch failed', error)
    res.status(502).json({ error: 'Failed to fetch games from Notion.' })
  }
}
