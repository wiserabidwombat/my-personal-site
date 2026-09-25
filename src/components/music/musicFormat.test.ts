import { describe, expect, it } from 'vitest'
import { availableRanges, formatRelativeTime, isEmptyMusic } from './musicFormat'

const now = new Date('2026-09-25T12:00:00Z')
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString()
const MIN = 60_000

describe('formatRelativeTime', () => {
  it('formats minutes, hours, and days', () => {
    expect(formatRelativeTime(ago(20_000), now)).toBe('just now')
    expect(formatRelativeTime(ago(12 * MIN), now)).toBe('12 min ago')
    expect(formatRelativeTime(ago(59 * MIN), now)).toBe('59 min ago')
    expect(formatRelativeTime(ago(3 * 60 * MIN), now)).toBe('3 hr ago')
    expect(formatRelativeTime(ago(26 * 60 * MIN), now)).toBe('1 day ago')
    expect(formatRelativeTime(ago(3 * 24 * 60 * MIN), now)).toBe('3 days ago')
  })

  it('falls back to a short date after a week', () => {
    expect(formatRelativeTime('2026-09-12T12:00:00Z', now)).toBe('Sep 12')
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatRelativeTime('not a date', now)).toBe('')
  })
})

describe('availableRanges', () => {
  it('lists ranges that have tracks or artists, in order', () => {
    expect(availableRanges({ shortTerm: [1], mediumTerm: [1] }, undefined)).toEqual(['shortTerm', 'mediumTerm'])
    expect(availableRanges({ mediumTerm: [1] }, { shortTerm: [] })).toEqual(['mediumTerm'])
    expect(availableRanges(undefined, { shortTerm: [1] })).toEqual(['shortTerm'])
    expect(availableRanges(undefined, undefined)).toEqual([])
  })
})

describe('isEmptyMusic', () => {
  it('is true only when no section has anything to show', () => {
    expect(isEmptyMusic({})).toBe(true)
    expect(isEmptyMusic({ playlists: [], podcasts: [], topTracks: { shortTerm: [] } })).toBe(true)
    expect(isEmptyMusic({ podcasts: [{ name: 'Show', imageUrl: null, spotifyUrl: null }] })).toBe(false)
  })
})
