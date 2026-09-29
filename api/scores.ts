import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHmac } from 'node:crypto'
import { neon } from '@neondatabase/serverless'
import {
  BOARD_SIZE,
  MAX_SCORE,
  MAX_WAVE,
  normalizeInitials,
  rankEntries,
  scoreCeiling,
  type ScoreEntry,
} from '../src/components/skyline-defense/scoreboard.js'
import { isBlockedInitials } from './_initialsBlocklist.js'

// Global Top 10 for the Skyline Defense Easter egg (/skyline-defense).
//
// GET returns the board. POST adds a score and returns the updated board
// plus the new entry's id so the game can highlight it.
//
// Scores are client-reported: the game runs in the browser, so anyone could
// send any number. This is a friendly leaderboard, not a bank, so the checks
// here are proportionate -- valid initials (with a small blocklist), a
// plausibility ceiling derived from the game's real point values, and a
// per-IP rate limit -- with no replay verification.

// Submissions allowed per hashed IP per minute.
export const RATE_LIMIT_PER_MINUTE = 3

type ScoreRow = { id: number | string; initials: string; score: number; wave: number; created_at: string | Date }

export type Submission = { initials: string; score: number; wave: number }

export type ValidationResult =
  | { ok: true; value: Submission }
  | { ok: false; field: 'initials' | 'score' | 'wave' | 'body'; error: string }

// Checks a POST body. Initials are uppercased; everything else must already
// be exactly right (whole numbers, in range).
export function validateSubmission(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') return { ok: false, field: 'body', error: 'Send initials, score, and wave.' }
  const { initials: rawInitials, score, wave } = body as Record<string, unknown>
  const initials = normalizeInitials(rawInitials)
  if (!initials) return { ok: false, field: 'initials', error: 'Initials must be three letters, A to Z.' }
  if (isBlockedInitials(initials)) return { ok: false, field: 'initials', error: 'Please pick different initials.' }
  if (typeof wave !== 'number' || !Number.isInteger(wave) || wave < 1 || wave > MAX_WAVE) {
    return { ok: false, field: 'wave', error: 'That wave number is not valid.' }
  }
  if (typeof score !== 'number' || !Number.isInteger(score) || score <= 0 || score > MAX_SCORE) {
    return { ok: false, field: 'score', error: 'That score is not valid.' }
  }
  if (score > scoreCeiling(wave)) {
    return { ok: false, field: 'score', error: 'That score is higher than wave ' + wave + ' allows.' }
  }
  return { ok: true, value: { initials, score, wave } }
}

// The caller's IP from Vercel's forwarding headers (first hop), or null.
export function clientIp(req: Pick<VercelRequest, 'headers'>): string | null {
  const forwarded = req.headers['x-forwarded-for']
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim()
  const real = req.headers['x-real-ip']
  return first || (Array.isArray(real) ? real[0] : real) || null
}

// A keyed hash of the IP, so rate limiting works without storing IPs.
export function hashIp(ip: string, secret: string): string {
  return createHmac('sha256', secret).update(ip).digest('hex')
}

function toEntry(row: ScoreRow): Omit<ScoreEntry, 'rank'> {
  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()
  return { id: Number(row.id), initials: row.initials.trim(), score: row.score, wave: row.wave, createdAt }
}

// The public shape: never includes ip_hash.
const publicEntry = ({ rank, initials, score, wave, createdAt }: ScoreEntry) => ({ rank, initials, score, wave, createdAt })

type Query = (text: string, params?: unknown[]) => Promise<unknown>

async function loadBoard(query: Query): Promise<ScoreEntry[]> {
  const rows = (await query(
    `SELECT id, initials, score, wave, created_at
     FROM skyline_scores
     ORDER BY score DESC, created_at ASC, id ASC
     LIMIT ${BOARD_SIZE}`,
  )) as ScoreRow[]
  return rankEntries(rows.map(toEntry))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { DATABASE_URL, SCORES_IP_SECRET } = process.env
  if (!DATABASE_URL) {
    res.status(500).json({ error: 'The database is not configured on the server.' })
    return
  }
  const sql = neon(DATABASE_URL)
  const query: Query = (text, params) => sql.query(text, params)

  if (req.method === 'GET') {
    try {
      const board = await loadBoard(query)
      res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=60')
      res.status(200).json({ scores: board.map(publicEntry) })
    } catch (error) {
      console.error('Neon query failed', error)
      res.status(502).json({ error: 'Failed to load the leaderboard.' })
    }
    return
  }

  res.setHeader('Cache-Control', 'no-store')
  if (!SCORES_IP_SECRET) {
    res.status(500).json({ error: 'Score submission is not configured on the server.' })
    return
  }
  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body
  const result = validateSubmission(body)
  // `'error' in result` (not `!result.ok`) narrows the same way under
  // Vercel's non-strict build-time type check too.
  if ('error' in result) {
    res.status(400).json({ error: result.error, field: result.field })
    return
  }
  const ipHash = hashIp(clientIp(req) ?? 'unknown', SCORES_IP_SECRET)

  try {
    const [{ count }] = (await query(
      `SELECT count(*)::int AS count FROM skyline_scores
       WHERE ip_hash = $1 AND created_at > now() - interval '1 minute'`,
      [ipHash],
    )) as { count: number }[]
    if (count >= RATE_LIMIT_PER_MINUTE) {
      res.status(429).json({ error: 'Too many scores in a row. Try again in a minute.' })
      return
    }

    const { initials, score, wave } = result.value
    const [inserted] = (await query(
      `INSERT INTO skyline_scores (initials, score, wave, ip_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [initials, score, wave, ipHash],
    )) as { id: number | string }[]
    const id = Number(inserted.id)

    // Re-checked after the insert, against the board as it is now: someone
    // else may have posted a higher score since the game checked. The score
    // is kept either way.
    const board = await loadBoard(query)
    const onBoard = board.some((entry) => entry.id === id)
    res.status(201).json({
      id,
      onBoard,
      message: onBoard ? null : 'Saved, but the Top 10 moved on before it landed.',
      scores: board.map((entry) => ({ ...publicEntry(entry), id: entry.id })),
    })
  } catch (error) {
    console.error('Neon query failed', error)
    res.status(502).json({ error: 'Failed to save the score.' })
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
