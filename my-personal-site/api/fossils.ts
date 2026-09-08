import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export type SpecimenType = 'mineral' | 'fossil'

export type Specimen = {
  id: number
  name: string
  type: SpecimenType
  dateCollected: string | null
  locationFound: string | null
  description: string | null
  imageUrl: string | null
}

type SpecimenRow = {
  id: number
  name: string
  type: SpecimenType
  date_collected: string | null
  location_found: string | null
  description: string | null
  image_url: string | null
}

function mapRow(row: SpecimenRow): Specimen {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    dateCollected: row.date_collected,
    locationFound: row.location_found,
    description: row.description,
    imageUrl: row.image_url,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { DATABASE_URL } = process.env

  if (!DATABASE_URL) {
    res.status(500).json({ error: 'The database is not configured on the server.' })
    return
  }

  try {
    const sql = neon(DATABASE_URL)
    const rows = (await sql.query(
      `SELECT id, name, type, date_collected, location_found, description, image_url
       FROM specimens
       ORDER BY date_collected DESC NULLS LAST, id DESC`
    )) as SpecimenRow[]

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    res.status(200).json({ specimens: rows.map(mapRow) })
  } catch (error) {
    console.error('Neon query failed', error)
    res.status(502).json({ error: 'Failed to load the collection.' })
  }
}
