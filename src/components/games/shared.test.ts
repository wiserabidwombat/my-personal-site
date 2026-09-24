import { describe, expect, it } from 'vitest'
import { formatPlaytime } from './shared'

describe('formatPlaytime', () => {
  it('shows the BGG range when min and max differ', () => {
    expect(formatPlaytime({ playtimeMinutes: 90, minPlaytime: 60, maxPlaytime: 90 })).toBe('60–90 min')
  })

  it('shows a single value when there is no real range', () => {
    expect(formatPlaytime({ playtimeMinutes: 20, minPlaytime: 20, maxPlaytime: 20 })).toBe('20 min')
    expect(formatPlaytime({ playtimeMinutes: 45, minPlaytime: null, maxPlaytime: null })).toBe('45 min')
  })

  it('treats 0 as unknown', () => {
    expect(formatPlaytime({ playtimeMinutes: 0, minPlaytime: 0, maxPlaytime: 0 })).toBe('—')
  })
})
