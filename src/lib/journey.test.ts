import { describe, expect, it } from 'vitest'
import { buildJourneyEntries, yearsOf } from './journey'
import { credentials, experience, type Company } from './resume-data'

describe('yearsOf', () => {
  it('reduces month-year ranges to years', () => {
    expect(yearsOf('April 2023 – June 2026')).toBe('2023 – 2026')
    expect(yearsOf('June 2026 – Present')).toBe('2026 – Present')
    expect(yearsOf('2011 – 2016')).toBe('2011 – 2016')
  })

  it('handles a single date and a same-year range', () => {
    expect(yearsOf('December 2004')).toBe('2004')
    expect(yearsOf('March 2020 – October 2020')).toBe('2020')
  })
})

describe('buildJourneyEntries', () => {
  const companies: Company[] = [
    {
      name: 'Newer Co',
      dateRange: '2020 – Present',
      roles: [
        { title: 'Lead', dateRange: 'May 2022 – Present', aboutDetail: 'Leading.' },
        { title: 'Engineer', dateRange: 'Jan 2020 – May 2022' },
      ],
    },
    {
      name: 'Older Co',
      location: 'Plano, TX',
      dateRange: '2010 – 2019',
      aboutCombined: { detail: 'Grew up here.' },
      roles: [{ title: 'Analyst III' }, { title: 'Analyst I' }],
    },
  ]

  it('orders degree first, then roles oldest to newest', () => {
    const entries = buildJourneyEntries(companies, [
      { kind: 'certification', title: 'Cert', date: 'January 2022' },
      { kind: 'degree', title: 'State U', detail: 'B.S. Things', date: 'May 2008', aboutDetail: 'Studied.' },
    ])
    expect(entries.map((entry) => [entry.years, entry.roles.join(' → '), entry.place, entry.detail])).toEqual([
      ['2008', 'B.S. Things', 'State U', 'Studied.'],
      ['2010 – 2019', 'Analyst I → Analyst III', 'Older Co · Plano, TX', 'Grew up here.'],
      ['2020 – 2022', 'Engineer', 'Newer Co', undefined],
      ['2022 – Present', 'Lead', 'Newer Co', 'Leading.'],
    ])
  })

  it('leaves certifications out of the timeline', () => {
    const entries = buildJourneyEntries([], [{ kind: 'certification', title: 'Cert', date: 'January 2022' }])
    expect(entries).toEqual([])
  })

  it('gives every real entry a unique key and an About blurb', () => {
    const entries = buildJourneyEntries(experience, credentials)
    expect(new Set(entries.map((entry) => entry.key)).size).toBe(entries.length)
    for (const entry of entries) expect(entry.detail, entry.key).toBeTruthy()
  })
})
