import type { ScoreEntry } from '../scoreboard'

// Client side of api/scores.ts. When the API isn't reachable -- Vite's dev
// server doesn't run api/ functions (it answers /api/scores with the app's
// HTML), or the network is down -- the board is reported as unavailable
// and the game falls back to its local-only high score.

// Entries from GET have no id; entries returned by a POST do.
export type BoardEntry = Omit<ScoreEntry, 'id'> & { id?: number }

const ENDPOINT = '/api/scores'
const TIMEOUT_MS = 6000

async function request(init?: RequestInit): Promise<{ status: number; data: Record<string, unknown> } | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(ENDPOINT, { ...init, signal: controller.signal })
    if (!(response.headers.get('content-type') ?? '').includes('application/json')) return null
    return { status: response.status, data: (await response.json()) as Record<string, unknown> }
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

const isBoard = (value: unknown): value is BoardEntry[] => Array.isArray(value)

// The current Top 10, or null when the global board isn't available.
export async function fetchBoard(): Promise<BoardEntry[] | null> {
  const result = await request()
  if (!result || result.status !== 200 || !isBoard(result.data.scores)) return null
  return result.data.scores
}

export type SubmitResult =
  | { kind: 'saved'; id: number; onBoard: boolean; message: string | null; board: BoardEntry[] }
  | { kind: 'rejected'; field: string; error: string }
  | { kind: 'retry'; error: string }

export async function submitScore(initials: string, score: number, wave: number): Promise<SubmitResult> {
  const result = await request({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initials, score, wave }),
  })
  if (!result) return { kind: 'retry', error: "Couldn't reach the leaderboard." }
  const { status, data } = result
  if (status === 201 && typeof data.id === 'number' && isBoard(data.scores)) {
    const message = typeof data.message === 'string' ? data.message : null
    return { kind: 'saved', id: data.id, onBoard: data.onBoard === true, message, board: data.scores }
  }
  const error = typeof data.error === 'string' ? data.error : 'Something went wrong.'
  if (status === 400) return { kind: 'rejected', field: typeof data.field === 'string' ? data.field : 'body', error }
  return { kind: 'retry', error }
}
