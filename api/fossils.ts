import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export type SpecimenType = 'mineral' | 'fossil'

export type Specimen = {
  id: number
  name: string
  // The part of `name` to italicize (a binomial or genus), when set.
  scientificName: string | null
  type: SpecimenType
  locationFound: string | null
  // Alt text for the specimen photo, derived from the description column
  // (see imageAltText). The full description itself is not sent.
  imageAlt: string | null
  imageUrl: string | null
  notes: string | null
  geologicPeriod: string | null
  approximateAge: string | null
  formation: string | null
  dimensions: string | null
  acquired: string | null // YYYY-MM-DD
}

// Columns added by db/migrations/003_add_specimen_details.sql are optional
// here: the query selects *, so this API keeps working (with those fields
// null) even before that migration has been applied.
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
  notes?: string | null
  scientific_name?: string | null
  geologic_period?: string | null
  approximate_age?: string | null
  formation?: string | null
  dimensions?: string | null
  acquired?: string | Date | null
}

// The description column holds image captions ("The image shows a ...")
// for most specimens, which make good alt text once the redundant lead-in
// is trimmed. It isn't always a caption, though: some rows hold long
// specimen write-ups or a pasted chat transcript, which would be unusable
// alt text -- those return null and the UI falls back to the name.
const MAX_ALT_LENGTH = 250
const CAPTION_LEAD_IN =
  /^(the (image|photo|selected region) (shows|features|highlights|showcases)|this (image|photo) (shows|features))\s+/i

export function imageAltText(description: string | null | undefined): string | null {
  const text = description?.trim()
  if (!text || text.length > MAX_ALT_LENGTH || /you sent:|ai mode conversation/i.test(text)) return null
  const trimmed = text.replace(CAPTION_LEAD_IN, '')
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

const orNull = (value: string | null | undefined) => (value && value.trim() ? value.trim() : null)

function toDateString(value: string | Date | null | undefined): string | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10)
  return value.slice(0, 10)
}

function mapRow(row: SpecimenRow): Specimen {
  return {
    id: row.id,
    name: row.name,
    scientificName: orNull(row.scientific_name),
    type: row.type.toLowerCase() as SpecimenType,
    locationFound: row.location_found,
    imageAlt: imageAltText(row.description),
    // A handful of rows store an empty string rather than NULL for "no
    // image yet" -- normalize so callers only ever have to check for a
    // single falsy shape.
    imageUrl: row.image_url || null,
    notes: orNull(row.notes),
    geologicPeriod: orNull(row.geologic_period),
    approximateAge: orNull(row.approximate_age),
    formation: orNull(row.formation),
    dimensions: orNull(row.dimensions),
    acquired: toDateString(row.acquired),
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
    // SELECT * (not a column list) so the detail columns from migration 003
    // are picked up once applied, without breaking before then. mapRow only
    // passes through known fields -- date_collected, the image_*_url
    // variants, and the raw description are never sent. Newest additions
    // (highest id) surface first.
    const rows = (await sql.query(
      `SELECT *
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
