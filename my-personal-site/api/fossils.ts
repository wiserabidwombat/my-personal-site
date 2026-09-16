import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export type SpecimenType = 'mineral' | 'fossil'

export type Specimen = {
  id: number
  name: string
  type: SpecimenType
  locationFound: string | null
  description: string | null
  imageUrl: string | null
}

type SpecimenRow = {
  id: number
  name: string
  // Stored capitalized ('Mineral' / 'Fossil') in fossils_and_minerals;
  // normalized to lowercase in mapRow to match the SpecimenType contract
  // the frontend's type filter (CatalogLedger) actually compares against.
  type: string
  location_found: string | null
  description: string | null
  image_url: string | null
}

function mapRow(row: SpecimenRow): Specimen {
  return {
    id: row.id,
    name: row.name,
    type: row.type.toLowerCase() as SpecimenType,
    locationFound: row.location_found,
    description: row.description,
    // A handful of rows store an empty string rather than NULL for "no
    // image yet" -- normalize so callers only ever have to check for a
    // single falsy shape.
    imageUrl: row.image_url || null,
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
    // NOTE: fossils_and_minerals, not the legacy `specimens` table left
    // over from initial scaffolding (a single stray "Rose Quartz" row --
    // see db/migrations/001_create_specimens.sql). This is the table the
    // real collection has actually been added to.
    //
    // date_collected is intentionally not selected: this collection is
    // primarily purchased, not found, so a "found date" isn't meaningful
    // and the field has been dropped from the app entirely. Newest
    // additions (highest id) surface first instead.
    const rows = (await sql.query(
      `SELECT id, name, type, location_found, description, image_url
       FROM fossils_and_minerals
       ORDER BY id DESC`
    )) as SpecimenRow[]

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    res.status(200).json({ specimens: rows.map(mapRow) })
  } catch (error) {
    console.error('Neon query failed', error)
    res.status(502).json({ error: 'Failed to load the collection.' })
  }
}
