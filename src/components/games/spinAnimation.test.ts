import { describe, expect, it } from 'vitest'
import type { BoardGame } from '../../types/board-game'
import { SPIN_FRAME_DELAYS, buildSpinSequence } from './spinAnimation'

function makeGame(id: string): BoardGame {
  return {
    id,
    name: id,
    tags: [],
    categories: [],
    mechanics: [],
    rating: null,
    status: null,
    condition: null,
    owned: true,
    playersMin: null,
    playersMax: null,
    playtimeMinutes: null,
    minPlaytime: null,
    maxPlaytime: null,
    weight: null,
    designer: null,
    publisher: null,
    yearPublished: null,
    lastPlayed: null,
    bggLink: null,
    thumbnailUrl: null,
    notes: null,
    notes2: null,
    notes3: null,
    notionUrl: 'https://example.com',
  }
}

const catan = makeGame('catan')
const codenames = makeGame('codenames')
const gloomhaven = makeGame('gloomhaven')
const library = [catan, codenames, gloomhaven]

describe('SPIN_FRAME_DELAYS', () => {
  it('totals a duration within the 1.5s-2.5s target', () => {
    const total = SPIN_FRAME_DELAYS.reduce((sum, ms) => sum + ms, 0)
    expect(total).toBeGreaterThanOrEqual(1500)
    expect(total).toBeLessThanOrEqual(2500)
  })

  it('eases out: never speeds back up frame-to-frame', () => {
    for (let i = 1; i < SPIN_FRAME_DELAYS.length; i++) {
      expect(SPIN_FRAME_DELAYS[i]).toBeGreaterThanOrEqual(SPIN_FRAME_DELAYS[i - 1])
    }
  })
})

describe('buildSpinSequence', () => {
  it('always ends on the winner', () => {
    for (let i = 0; i < 20; i++) {
      const sequence = buildSpinSequence(library, gloomhaven)
      expect(sequence[sequence.length - 1]).toBe(gloomhaven)
    }
  })

  it('produces one frame per configured delay by default', () => {
    const sequence = buildSpinSequence(library, catan)
    expect(sequence).toHaveLength(SPIN_FRAME_DELAYS.length)
  })

  it('honors an explicit frame count', () => {
    const sequence = buildSpinSequence(library, catan, 5)
    expect(sequence).toHaveLength(5)
    expect(sequence[4]).toBe(catan)
  })

  it('never repeats the same game on two consecutive frames when more than one is eligible', () => {
    for (let trial = 0; trial < 20; trial++) {
      const sequence = buildSpinSequence(library, codenames, 12)
      for (let i = 1; i < sequence.length; i++) {
        expect(sequence[i].id).not.toBe(sequence[i - 1].id)
      }
    }
  })

  it('never introduces a winner other than the one passed in, regardless of the eligible set', () => {
    for (let trial = 0; trial < 20; trial++) {
      const sequence = buildSpinSequence(library, catan)
      expect(sequence.filter((g) => g === catan).length).toBeGreaterThanOrEqual(1)
      expect(sequence[sequence.length - 1]).toBe(catan)
    }
  })

  it('degrades gracefully with only the winner eligible (no other games to cycle through)', () => {
    const sequence = buildSpinSequence([catan], catan, 6)
    expect(sequence).toHaveLength(6)
    expect(sequence.every((g) => g === catan)).toBe(true)
  })

  it('returns just the winner when the eligible set is empty', () => {
    const sequence = buildSpinSequence([], catan)
    expect(sequence).toEqual([catan])
  })
})
