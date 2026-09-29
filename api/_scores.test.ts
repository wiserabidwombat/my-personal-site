import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { qualifies, rankEntries, scoreCeiling } from '../src/components/skyline-defense/scoreboard'
import { waveBonus, waveMultiplier } from '../src/components/skyline-defense/game/scoring'
import { TUNING } from '../src/components/skyline-defense/game/tuning'
import { isBlockedInitials } from './_initialsBlocklist'

// The handler's database calls go through this mock: each test queues the
// results its queries should return, in order.
const queryMock = vi.fn()
vi.mock('@neondatabase/serverless', () => ({ neon: () => ({ query: queryMock }) }))

const { default: handler, clientIp, hashIp, RATE_LIMIT_PER_MINUTE, validateSubmission } = await import('./scores')

const entry = (id: number, score: number, createdAt: string) => ({ id, initials: 'AAA', score, wave: 3, createdAt })

describe('validateSubmission', () => {
  it('accepts valid entries and uppercases initials', () => {
    expect(validateSubmission({ initials: 'abc', score: 1200, wave: 3 })).toEqual({
      ok: true,
      value: { initials: 'ABC', score: 1200, wave: 3 },
    })
  })

  it('rejects initials that are not exactly three letters A-Z', () => {
    for (const initials of ['AB', 'ABCD', 'A1C', 'A C', '', 'ÄBC', 42, null]) {
      const result = validateSubmission({ initials, score: 100, wave: 1 })
      expect(result.ok, String(initials)).toBe(false)
      if (!result.ok) expect(result.field).toBe('initials')
    }
  })

  it('rejects non-integer, zero, negative, and out-of-range scores and waves', () => {
    for (const score of [0, -5, 12.5, '100', Number.NaN, 3_000_000_000]) {
      expect(validateSubmission({ initials: 'ABC', score, wave: 3 }).ok, String(score)).toBe(false)
    }
    for (const wave of [0, -1, 2.5, '3', 10_000]) {
      expect(validateSubmission({ initials: 'ABC', score: 100, wave }).ok, String(wave)).toBe(false)
    }
    expect(validateSubmission(null).ok).toBe(false)
    expect(validateSubmission('ABC').ok).toBe(false)
  })
})

describe('initials blocklist', () => {
  it('blocks listed combinations in any case, and rejects them on submit', () => {
    expect(isBlockedInitials('ASS')).toBe(true)
    expect(isBlockedInitials('kkk')).toBe(true)
    expect(isBlockedInitials('AJT')).toBe(false)
    const result = validateSubmission({ initials: 'fuk', score: 100, wave: 1 })
    expect(result).toEqual({ ok: false, field: 'initials', error: 'Please pick different initials.' })
  })
})

describe('plausibility ceiling', () => {
  it("equals wave 1's maximum: every kill at the chain cap plus a perfect wave bonus", () => {
    const meteorKills = TUNING.meteorCountBase * TUNING.splitFragments
    const kills = meteorKills * TUNING.meteorPoints * waveMultiplier(1) * TUNING.chainMultiplierCap
    const bonus = waveBonus(10, TUNING.ammoPerLauncher * 3, 1).total
    expect(scoreCeiling(1)).toBe(kills + bonus)
  })

  it('grows with every wave reached', () => {
    for (let wave = 1; wave < 12; wave++) expect(scoreCeiling(wave + 1)).toBeGreaterThan(scoreCeiling(wave))
  })

  it('accepts a score at the ceiling and rejects one just above it', () => {
    const ceiling = scoreCeiling(4)
    expect(validateSubmission({ initials: 'ABC', score: ceiling, wave: 4 }).ok).toBe(true)
    const over = validateSubmission({ initials: 'ABC', score: ceiling + 1, wave: 4 })
    expect(over.ok).toBe(false)
    if (!over.ok) expect(over.field).toBe('score')
  })
})

describe('board order', () => {
  it('ranks by score, giving ties to the earlier entry, then the lower id', () => {
    const board = rankEntries([
      entry(1, 500, '2026-09-28T10:00:02Z'),
      entry(2, 900, '2026-09-28T10:00:05Z'),
      entry(3, 500, '2026-09-28T10:00:01Z'),
      entry(4, 500, '2026-09-28T10:00:01Z'),
    ])
    expect(board.map((e) => e.id)).toEqual([2, 3, 4, 1])
    expect(board.map((e) => e.rank)).toEqual([1, 2, 3, 4])
  })

  it('keeps only the top 10', () => {
    const many = Array.from({ length: 14 }, (_, i) => entry(i + 1, (i + 1) * 100, '2026-09-28T10:00:00Z'))
    const board = rankEntries(many)
    expect(board).toHaveLength(10)
    expect(board[9].score).toBe(500)
  })

  it('qualifies a score when there is room or it beats 10th place (a tie does not)', () => {
    const full = Array.from({ length: 10 }, (_, i) => ({ score: 1000 - i * 50 }))
    expect(qualifies(100, full.slice(0, 9))).toBe(true)
    expect(qualifies(551, full)).toBe(true)
    expect(qualifies(550, full)).toBe(false)
    expect(qualifies(0, [])).toBe(false)
  })
})

describe('client IP hashing', () => {
  it('uses the first forwarded hop and hashes it with the secret', () => {
    expect(clientIp({ headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } })).toBe('203.0.113.9')
    expect(clientIp({ headers: { 'x-real-ip': '198.51.100.2' } })).toBe('198.51.100.2')
    expect(clientIp({ headers: {} })).toBeNull()
    expect(hashIp('203.0.113.9', 'secret')).toMatch(/^[0-9a-f]{64}$/)
    expect(hashIp('203.0.113.9', 'secret')).not.toBe(hashIp('203.0.113.9', 'other'))
  })
})

describe('handler', () => {
  const env = { ...process.env }
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgres://example'
    process.env.SCORES_IP_SECRET = 'test-secret'
    queryMock.mockReset()
  })
  afterEach(() => {
    process.env = { ...env }
  })

  // A minimal stand-in for VercelResponse that records what the handler sent.
  function makeRes() {
    const res = {
      statusCode: 0,
      body: undefined as unknown,
      headers: {} as Record<string, string>,
      status(code: number) {
        res.statusCode = code
        return res
      },
      setHeader(name: string, value: string) {
        res.headers[name] = value
        return res
      },
      json(body: unknown) {
        res.body = body
        return res
      },
    }
    return res
  }
  const call = async (req: object) => {
    const res = makeRes()
    await handler({ headers: { 'x-forwarded-for': '203.0.113.9' }, ...req } as never, res as never)
    return res
  }

  const row = (id: number, score: number) => ({
    id,
    initials: 'ABC',
    score,
    wave: 3,
    created_at: '2026-09-28T10:00:00Z',
    ip_hash: 'should-never-leak',
  })

  it('GET returns the ranked board without ip_hash, cached briefly', async () => {
    queryMock.mockResolvedValueOnce([row(1, 900), row(2, 500)])
    const res = await call({ method: 'GET' })
    expect(res.statusCode).toBe(200)
    expect(res.headers['Cache-Control']).toContain('s-maxage=15')
    expect(res.body).toEqual({
      scores: [
        { rank: 1, initials: 'ABC', score: 900, wave: 3, createdAt: '2026-09-28T10:00:00.000Z' },
        { rank: 2, initials: 'ABC', score: 500, wave: 3, createdAt: '2026-09-28T10:00:00.000Z' },
      ],
    })
    expect(JSON.stringify(res.body)).not.toContain('ip_hash')
  })

  it('POST rejects bad input before touching the database', async () => {
    const res = await call({ method: 'POST', body: { initials: 'A1', score: 100, wave: 1 } })
    expect(res.statusCode).toBe(400)
    expect(res.body).toMatchObject({ field: 'initials' })
    expect(queryMock).not.toHaveBeenCalled()
  })

  it('POST rate-limits a hashed IP after a few submissions a minute', async () => {
    queryMock.mockResolvedValueOnce([{ count: RATE_LIMIT_PER_MINUTE }])
    const res = await call({ method: 'POST', body: { initials: 'ABC', score: 100, wave: 1 } })
    expect(res.statusCode).toBe(429)
    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(queryMock.mock.calls[0][1]).toEqual([hashIp('203.0.113.9', 'test-secret')])
  })

  it('POST stores the score and returns the board with the new id', async () => {
    queryMock
      .mockResolvedValueOnce([{ count: 0 }])
      .mockResolvedValueOnce([{ id: 7 }])
      .mockResolvedValueOnce([row(7, 1200), row(1, 900)])
    const res = await call({ method: 'POST', body: JSON.stringify({ initials: 'xyz', score: 1200, wave: 3 }) })
    expect(res.statusCode).toBe(201)
    expect(res.body).toMatchObject({ id: 7, onBoard: true, message: null })
    expect(queryMock.mock.calls[1][1]).toEqual(['XYZ', 1200, 3, hashIp('203.0.113.9', 'test-secret')])
  })

  it('POST keeps a score that no longer makes the board, and says so', async () => {
    const board = Array.from({ length: 10 }, (_, i) => row(i + 1, 5000 - i * 10))
    queryMock.mockResolvedValueOnce([{ count: 0 }]).mockResolvedValueOnce([{ id: 99 }]).mockResolvedValueOnce(board)
    const res = await call({ method: 'POST', body: { initials: 'ABC', score: 300, wave: 3 } })
    expect(res.statusCode).toBe(201)
    expect(res.body).toMatchObject({ id: 99, onBoard: false })
  })

  it('POST refuses to run without the IP-hash secret', async () => {
    delete process.env.SCORES_IP_SECRET
    const res = await call({ method: 'POST', body: { initials: 'ABC', score: 100, wave: 1 } })
    expect(res.statusCode).toBe(500)
  })
})
