import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applySeasonChoice,
  isHalloweenDate,
  isSeasonAvailable,
  OPT_OUT_KEY,
  PREVIEW_KEY,
  resolveSeason,
  themeColorFor,
  type SeasonInputs,
} from './season'

// Local-time dates (month is 0-based: 9 = October).
const local = (month: number, day: number, hour = 0, minute = 0, second = 0) =>
  new Date(2026, month, day, hour, minute, second)

const OCT_1_MIDNIGHT = local(9, 1, 0, 0, 0)
const OCT_31_2359 = local(9, 31, 23, 59, 59)
const SEP_30_LAST_SECOND = local(8, 30, 23, 59, 59)
const NOV_1_MIDNIGHT = local(10, 1, 0, 0, 0)
const MID_OCTOBER = local(9, 15, 12)
const MID_JULY = local(6, 4, 12)

const inputs = (overrides: Partial<SeasonInputs> = {}): SeasonInputs => ({
  now: MID_JULY,
  search: '',
  preview: null,
  optOut: null,
  ...overrides,
})

describe('isHalloweenDate', () => {
  it('is true for all of October, local time, and nothing else', () => {
    expect(isHalloweenDate(OCT_1_MIDNIGHT)).toBe(true)
    expect(isHalloweenDate(OCT_31_2359)).toBe(true)
    expect(isHalloweenDate(SEP_30_LAST_SECOND)).toBe(false)
    expect(isHalloweenDate(NOV_1_MIDNIGHT)).toBe(false)
  })
})

// Shared by resolveSeason and the inline <head> script in index.html.
type Case = { name: string; input: SeasonInputs; season: 'halloween' | 'none'; savePreview: 'halloween' | 'none' | null }

const cases: Case[] = [
  { name: 'Oct 1 00:00 turns it on', input: inputs({ now: OCT_1_MIDNIGHT }), season: 'halloween', savePreview: null },
  { name: 'Oct 31 23:59 keeps it on', input: inputs({ now: OCT_31_2359 }), season: 'halloween', savePreview: null },
  { name: 'Sep 30 23:59:59 is off', input: inputs({ now: SEP_30_LAST_SECOND }), season: 'none', savePreview: null },
  { name: 'Nov 1 00:00 is off', input: inputs({ now: NOV_1_MIDNIGHT }), season: 'none', savePreview: null },
  {
    name: '?season=halloween forces it on outside October and saves the preview',
    input: inputs({ search: '?season=halloween' }),
    season: 'halloween',
    savePreview: 'halloween',
  },
  {
    name: '?season=none forces it off in October and saves the preview',
    input: inputs({ now: MID_OCTOBER, search: '?season=none' }),
    season: 'none',
    savePreview: 'none',
  },
  {
    name: 'the URL parameter beats a saved preview and the opt-out',
    input: inputs({ now: MID_OCTOBER, search: '?season=halloween', preview: 'none', optOut: 'true' }),
    season: 'halloween',
    savePreview: 'halloween',
  },
  {
    name: 'a saved preview lasts through navigation (no URL parameter)',
    input: inputs({ preview: 'halloween' }),
    season: 'halloween',
    savePreview: null,
  },
  {
    name: 'a saved preview beats the opt-out',
    input: inputs({ now: MID_OCTOBER, preview: 'halloween', optOut: 'true' }),
    season: 'halloween',
    savePreview: null,
  },
  { name: 'the opt-out turns October off', input: inputs({ now: MID_OCTOBER, optOut: 'true' }), season: 'none', savePreview: null },
  {
    name: 'unknown values are ignored',
    input: inputs({ now: MID_OCTOBER, search: '?season=xmas', preview: 'spooky', optOut: 'yes' }),
    season: 'halloween',
    savePreview: null,
  },
]

describe('resolveSeason', () => {
  it.each(cases)('$name', ({ input, season, savePreview }) => {
    expect(resolveSeason(input)).toEqual({ season, savePreview })
  })
})

describe('themeColorFor', () => {
  it('matches the page background for each theme and season', () => {
    expect(themeColorFor('none', 'dark')).toBe('#0a0612')
    expect(themeColorFor('none', 'light')).toBe('#f7f5fb')
    expect(themeColorFor('halloween', 'dark')).toBe('#0c0710')
    expect(themeColorFor('halloween', 'light')).toBe('#fbf5ec')
  })
})

describe('isSeasonAvailable', () => {
  it('is true in October or while previewing', () => {
    expect(isSeasonAvailable({ now: MID_OCTOBER, preview: null })).toBe(true)
    expect(isSeasonAvailable({ now: MID_JULY, preview: 'halloween' })).toBe(true)
    expect(isSeasonAvailable({ now: MID_JULY, preview: 'none' })).toBe(true)
    expect(isSeasonAvailable({ now: MID_JULY, preview: null })).toBe(false)
    expect(isSeasonAvailable({ now: MID_JULY, preview: 'spooky' })).toBe(false)
  })
})

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

describe('applySeasonChoice', () => {
  it('turning off in October records the opt-out and ends a preview', () => {
    const localStore = memoryStorage()
    const sessionStore = memoryStorage({ [PREVIEW_KEY]: 'halloween' })
    applySeasonChoice(false, MID_OCTOBER, localStore, sessionStore)
    expect(localStore.data.get(OPT_OUT_KEY)).toBe('true')
    expect(sessionStore.data.has(PREVIEW_KEY)).toBe(false)
    expect(resolveSeason(inputs({ now: MID_OCTOBER, optOut: 'true' })).season).toBe('none')
  })

  it('turning off during a preview outside October keeps previewing, switched off', () => {
    const localStore = memoryStorage()
    const sessionStore = memoryStorage({ [PREVIEW_KEY]: 'halloween' })
    applySeasonChoice(false, MID_JULY, localStore, sessionStore)
    expect(sessionStore.data.get(PREVIEW_KEY)).toBe('none')
    expect(resolveSeason(inputs({ preview: 'none', optOut: 'true' })).season).toBe('none')
    expect(isSeasonAvailable({ now: MID_JULY, preview: 'none' })).toBe(true)
  })

  it('turning on in October clears the opt-out', () => {
    const localStore = memoryStorage({ [OPT_OUT_KEY]: 'true' })
    const sessionStore = memoryStorage()
    applySeasonChoice(true, MID_OCTOBER, localStore, sessionStore)
    expect(localStore.data.has(OPT_OUT_KEY)).toBe(false)
    expect(sessionStore.data.has(PREVIEW_KEY)).toBe(false)
  })

  it('turning on outside October keeps it on for the session as a preview', () => {
    const localStore = memoryStorage({ [OPT_OUT_KEY]: 'true' })
    const sessionStore = memoryStorage()
    applySeasonChoice(true, MID_JULY, localStore, sessionStore)
    expect(sessionStore.data.get(PREVIEW_KEY)).toBe('halloween')
  })
})

// The inline <head> script is a hand-copied mirror of resolveSeason (it has
// to run before any bundle loads). Run the real script from index.html
// against the same cases so the two can't drift apart.
describe('index.html season script', () => {
  const html = readFileSync(path.join(__dirname, '../../index.html'), 'utf8')
  const script = html.match(/<script id="season-script">([\s\S]*?)<\/script>/)?.[1]

  afterEach(() => {
    vi.useRealTimers()
  })

  function runScript(input: SeasonInputs, { storageThrows = false, theme = 'dark' as 'dark' | 'light' } = {}) {
    vi.useFakeTimers()
    vi.setSystemTime(input.now)
    const session = memoryStorage(input.preview ? { [PREVIEW_KEY]: input.preview } : {})
    const localStore = memoryStorage(input.optOut ? { [OPT_OUT_KEY]: input.optOut } : {})
    const blocked = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    const attributes = new Map<string, string>([['data-theme', theme]])
    let themeColor = ''
    const documentStub = {
      documentElement: {
        setAttribute: (name: string, value: string) => void attributes.set(name, value),
        removeAttribute: (name: string) => void attributes.delete(name),
        getAttribute: (name: string) => attributes.get(name) ?? null,
      },
      querySelector: () => ({ setAttribute: (_name: string, value: string) => void (themeColor = value) }),
    }
    new Function('window', 'document', 'sessionStorage', 'localStorage', script!)(
      { location: { search: input.search } },
      documentStub,
      storageThrows ? blocked : session,
      storageThrows ? blocked : localStore,
    )
    return {
      season: attributes.get('data-season') === 'halloween' ? 'halloween' : 'none',
      saved: session.data.get(PREVIEW_KEY),
      themeColor,
    }
  }

  it('is present in index.html', () => {
    expect(script).toBeTruthy()
  })

  it.each(cases)('matches resolveSeason: $name', ({ input, season, savePreview }) => {
    const result = runScript(input)
    expect(result.season).toBe(season)
    if (savePreview) expect(result.saved).toBe(savePreview)
  })

  it('sets the same theme-color as themeColorFor', () => {
    for (const theme of ['dark', 'light'] as const) {
      expect(runScript(inputs({ now: MID_OCTOBER }), { theme }).themeColor).toBe(themeColorFor('halloween', theme))
      expect(runScript(inputs({ now: MID_JULY }), { theme }).themeColor).toBe(themeColorFor('none', theme))
    }
  })

  it('falls back to the date rule when storage is blocked', () => {
    expect(runScript(inputs({ now: MID_OCTOBER }), { storageThrows: true }).season).toBe('halloween')
    expect(runScript(inputs({ now: MID_JULY }), { storageThrows: true }).season).toBe('none')
  })
})
