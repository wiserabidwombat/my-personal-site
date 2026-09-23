import { describe, expect, it } from 'vitest'
import { buildResumePdf } from './generate-resume-pdf'
import { contact } from './resume-data'

describe('buildResumePdf', () => {
  const { doc, layout } = buildResumePdf()
  const raw = doc.output()

  it('never leaves a section, company, role, or project heading alone at the bottom of a page', () => {
    expect(layout.headings.length).toBeGreaterThan(0)
    for (const heading of layout.headings) {
      expect(heading.contentPage, heading.label).toBe(heading.headingPage)
    }
  })

  it('links the email, LinkedIn, and website in the contact line', () => {
    expect(raw).toContain(`/URI (mailto:${contact.email})`)
    expect(raw).toContain(`/URI (${contact.linkedInUrl})`)
    expect(raw).toContain(`/URI (${contact.websiteUrl})`)
    expect(raw).toContain(`(${contact.location})`)
  })

  it('omits phone unless it is set', () => {
    expect(contact.phone).toBeUndefined()
    expect(raw).not.toContain('tel:')
  })

  // jsPDF declares all 14 standard fonts in every file, so check the fonts
  // the page content actually selects (`/F1 10 Tf`), resolved to BaseFont.
  it('sets all text in Helvetica', () => {
    const used = new Set([...raw.matchAll(/\/(F\d+) [\d.]+ Tf/g)].map((m) => m[1]))
    const baseFonts = [...used].map((name) => {
      const objectNumber = raw.match(new RegExp(`/${name} (\\d+) 0 R`))?.[1]
      const object = raw.split(`\n${objectNumber} 0 obj`)[1]?.split('endobj')[0] ?? ''
      return object.match(/\/BaseFont \/([\w-]+)/)?.[1]
    })
    expect(baseFonts.length).toBeGreaterThan(0)
    for (const baseFont of baseFonts) expect(baseFont).toMatch(/^Helvetica/)
  })
})
