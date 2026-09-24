import { describe, expect, it } from 'vitest'
import type { Specimen } from '../../types/specimen'
import { collectionSummary, countryOf, isUnknownLocation, specimenAlt, splitScientificName } from './specimenFormat'

const specimen = (overrides: Partial<Specimen>): Specimen => ({
  id: 1,
  name: 'Specimen',
  scientificName: null,
  type: 'mineral',
  locationFound: null,
  imageAlt: null,
  imageUrl: null,
  notes: null,
  geologicPeriod: null,
  approximateAge: null,
  formation: null,
  dimensions: null,
  acquired: null,
  ...overrides,
})

describe('splitScientificName', () => {
  it('italicizes only the binomial, not a trailing descriptor', () => {
    expect(splitScientificName('Crotalocephalus gibbus (pair)', 'Crotalocephalus gibbus')).toEqual({
      before: '',
      italic: 'Crotalocephalus gibbus',
      after: ' (pair)',
    })
  })

  it('returns null without a scientific name or a match', () => {
    expect(splitScientificName('Wulfenite', null)).toBeNull()
    expect(splitScientificName('Wulfenite', 'Phacops')).toBeNull()
  })
})

describe('countryOf', () => {
  it('takes the last part of a location and maps US states to the USA', () => {
    expect(countryOf('Sahara Desert, Morocco')).toBe('Morocco')
    expect(countryOf('Red Cloud Mine, Arizona')).toBe('USA')
    expect(countryOf('South Carolina, USA')).toBe('USA')
    expect(countryOf('Republic of Congo')).toBe('Republic of Congo')
  })

  it('ignores unknown or empty locations', () => {
    expect(countryOf('Unknown')).toBeNull()
    expect(countryOf(null)).toBeNull()
    expect(isUnknownLocation(' unknown ')).toBe(true)
  })
})

describe('collectionSummary', () => {
  it('counts types and distinct known countries', () => {
    const summary = collectionSummary([
      specimen({ type: 'mineral', locationFound: 'Durango, Mexico' }),
      specimen({ type: 'mineral', locationFound: 'Ojuela Mine, Mexico' }),
      specimen({ type: 'fossil', locationFound: 'Ohio, USA' }),
      specimen({ type: 'fossil', locationFound: 'Unknown' }),
    ])
    expect(summary).toEqual({ total: 4, minerals: 2, fossils: 2, countries: 2 })
  })
})

describe('specimenAlt', () => {
  it('uses the caption, else name and type', () => {
    expect(specimenAlt(specimen({ imageAlt: 'A radiating orange cluster.' }))).toBe('A radiating orange cluster.')
    expect(specimenAlt(specimen({ name: 'Moroccops', type: 'fossil' }))).toBe('Moroccops, fossil')
  })
})
