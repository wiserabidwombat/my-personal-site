import { describe, expect, it } from 'vitest'
import { availableRanges, displayTrackName, formatRelativeTime, isEmptyMusic } from './musicFormat'

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

describe('displayTrackName', () => {
  it.each([
    ['With Or Without You - Remastered 2007', 'With Or Without You'],
    ['Heroes - 2017 Remaster', 'Heroes'],
    ["Baba O'Riley - Remastered", "Baba O'Riley"],
    ['Paint It Black - Remaster', 'Paint It Black'],
    ['Dreams - 2004 Remastered Version', 'Dreams'],
    ['Go Your Own Way - Remastered Version', 'Go Your Own Way'],
    ['Song - Radio Edit', 'Song'],
    ['Song - Single Version', 'Song'],
    ['Song - Album Version', 'Song'],
    ['Song - Mono Version', 'Song'],
    ['Song (Remastered 2011)', 'Song'],
    ['Song [2009 Remaster]', 'Song'],
    ['Song - Radio Edit - Remastered', 'Song'],
  ])('strips "%s"', (input, expected) => {
    expect(displayTrackName(input)).toBe(expected)
  })

  it.each([
    'Seven Nation Army - The Glitch Mob Remix',
    'Seven Nation Army - Live',
    'Hurt - Live at the Troubadour',
    'Creep - Acoustic',
    'Hey Jude - Remix',
    'Song (feat. Someone)',
    'Pre-Remastered Dreams',
    'Ocotillo',
    'A - B',
  ])('keeps "%s"', (input) => {
    expect(displayTrackName(input)).toBe(input)
  })

  it('keeps a remix credit that precedes a remaster tag', () => {
    expect(displayTrackName('Song - Club Remix - Remastered 2010')).toBe('Song - Club Remix')
  })
})
