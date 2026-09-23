import { jsPDF } from 'jspdf'
import {
  fullName,
  heroTitle,
  contact,
  summary,
  skillGroups,
  experience,
  credentials,
  type Company,
} from './resume-data'

// Built with jsPDF's native text API (not html2canvas/html2pdf.js) so the
// generated PDF has real, selectable, ATS-parsable text instead of a
// rasterized image. It's also the only option that works at all here:
// html2canvas can't parse the oklch() colors Tailwind v4 emits and throws
// before it ever renders the page.

const PAGE_WIDTH = 612 // 8.5in @ 72pt/in (US Letter)
const PAGE_HEIGHT = 792 // 11in @ 72pt/in
const MARGIN = 36 // 0.5in
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const BOTTOM = PAGE_HEIGHT - MARGIN
const FONT = 'helvetica' // built into jsPDF, no embedding needed

// Tuned to fit one page: every line advances ~1.15x its font size, the
// tightest that stays comfortably readable, and body text (bullets
// included) is never below 10pt. Font sizes and the heading hierarchy
// (name 20 / title 12 / section 12 / company 11 / role 10) are unchanged.
const BULLET_SIZE = 10
const LINE = { body: 11.5, company: 13, role: 11.5, bullet: 11.5 }
const BULLET_INDENT = 14
const BULLET_GAP = 12
const BULLET_TEXT_WIDTH = CONTENT_WIDTH - BULLET_INDENT - BULLET_GAP
const SECTION_GAP_ABOVE = 4
const SECTION_GAP_BELOW = 9 // after the rule, which sits 3pt below the heading baseline
const SECTION_HEADING_HEIGHT = SECTION_GAP_ABOVE + 3 + SECTION_GAP_BELOW
const COMPANY_GAP = 4
const ROW_GAP = 12 // minimum space between a row's left text and its right-aligned dates

// Where each heading landed vs. the first line of content under it, so
// tests can assert no heading is ever stranded at the bottom of a page.
export type HeadingPlacement = { label: string; headingPage: number; contentPage: number }
export type ResumePdfLayout = {
  pages: number
  // How much of the last page's content area (inside the margins) is used, 0-1.
  lastPageFill: number
  headings: HeadingPlacement[]
}

// One italic heading line + bullets in the PDF's Experience section. The
// PDF condenses what the page shows in full, to fit on one page:
// - a project's name joins its role's line ("Senior Developer · Smart
//   Select MD") instead of taking a separate "Project:" line; a role's
//   later projects get their own line in the same style, without dates
// - a company marked `aboutCombined` (MEDHOST) shows as one entry: its
//   titles newest first and every role's bullets, under the company's dates
type PdfEntry = { heading: string; dates?: string; bullets: string[] }

export function pdfEntries(company: Company): PdfEntry[] {
  if (company.aboutCombined) {
    return [
      {
        heading: company.roles.map((role) => role.title).join(' · '),
        bullets: company.roles.flatMap((role) => role.bullets ?? []),
      },
    ]
  }
  return company.roles.flatMap((role): PdfEntry[] =>
    role.projects?.length
      ? role.projects.map((project, index) => ({
          heading: `${role.title} · ${project.name}`,
          dates: index === 0 ? role.dateRange : undefined,
          bullets: project.bullets,
        }))
      : [{ heading: role.title, dates: role.dateRange, bullets: role.bullets ?? [] }],
  )
}

export function buildResumePdf(): { doc: jsPDF; layout: ResumePdfLayout } {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const headings: HeadingPlacement[] = []
  let y = MARGIN

  const page = () => doc.getNumberOfPages()
  const font = (style: 'normal' | 'bold' | 'italic', size: number) => {
    doc.setFont(FONT, style)
    doc.setFontSize(size)
  }
  const ensureSpace = (height: number) => {
    if (y + height > BOTTOM) {
      doc.addPage()
      y = MARGIN
    }
  }
  const lineCount = (text: string, style: 'normal' | 'bold', size: number, width: number) => {
    font(style, size)
    return (doc.splitTextToSize(text, width) as string[]).length
  }

  // --- Measuring (keep-with-next): a heading plus its first line(s) of
  // content must fit together, or the whole block moves to the next page.
  const firstBulletHeight = (bullets: string[] = []) =>
    bullets.length ? lineCount(bullets[0], 'normal', BULLET_SIZE, BULLET_TEXT_WIDTH) * LINE.bullet : 0
  const rowHeight = (left: string, right: string | undefined, style: 'bold' | 'italic', size: number, lineHeight: number) => {
    font(style, size)
    return rowLines(left, right).length * lineHeight
  }
  const entryBlock = (entry: PdfEntry) =>
    rowHeight(entry.heading, entry.dates, 'italic', 10, LINE.role) + firstBulletHeight(entry.bullets)

  // Starts a new page if `height` won't fit, then records the heading's page;
  // the caller marks where its first content line landed via `content()`.
  const keepTogether = (label: string, height: number) => {
    ensureSpace(height)
    const placement = { label, headingPage: page(), contentPage: 0 }
    headings.push(placement)
    // Only the FIRST content line counts; later calls are no-ops.
    return {
      content: () => {
        if (!placement.contentPage) placement.contentPage = page()
      },
    }
  }

  const writeLines = (text: string, x: number, maxWidth: number, lineHeight: number) => {
    for (const line of doc.splitTextToSize(text, maxWidth) as string[]) {
      ensureSpace(lineHeight)
      doc.text(line, x, y)
      y += lineHeight
    }
  }
  // Left text wraps within the space the right-aligned text leaves, so a
  // long title can never run into its dates (uses the current font).
  const rowLines = (left: string, right: string | undefined) => {
    const rightWidth = right ? doc.getTextWidth(right) + ROW_GAP : 0
    return doc.splitTextToSize(left, CONTENT_WIDTH - rightWidth) as string[]
  }
  const writeRow = (left: string, right: string | undefined, lineHeight: number) => {
    rowLines(left, right).forEach((line, i) => {
      ensureSpace(lineHeight)
      doc.text(line, MARGIN, y)
      if (right && i === 0) doc.text(right, PAGE_WIDTH - MARGIN, y, { align: 'right' })
      y += lineHeight
    })
  }
  const writeBullets = (bullets: string[]) => {
    font('normal', BULLET_SIZE)
    for (const bullet of bullets) {
      const lines = doc.splitTextToSize(bullet, BULLET_TEXT_WIDTH) as string[]
      lines.forEach((line, i) => {
        ensureSpace(LINE.bullet)
        if (i === 0) doc.text('•', MARGIN + BULLET_INDENT, y)
        doc.text(line, MARGIN + BULLET_INDENT + BULLET_GAP, y)
        y += LINE.bullet
      })
    }
  }
  const writeSectionHeading = (title: string, firstItemHeight: number) => {
    const block = keepTogether(title, SECTION_HEADING_HEIGHT + firstItemHeight)
    y += SECTION_GAP_ABOVE
    font('bold', 12)
    doc.text(title.toUpperCase(), MARGIN, y)
    y += 3
    doc.setLineWidth(0.75)
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
    y += SECTION_GAP_BELOW
    return block
  }

  // Centered "Allen, TX · email · LinkedIn · site" with clickable links.
  const writeContactLine = () => {
    const separator = '  ·  '
    const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
    const parts: { text: string; url?: string }[] = [
      { text: contact.location },
      ...(contact.phone ? [{ text: contact.phone, url: `tel:${contact.phone.replace(/[^\d+]/g, '')}` }] : []),
      { text: contact.email, url: `mailto:${contact.email}` },
      { text: stripProtocol(contact.linkedInUrl), url: contact.linkedInUrl },
      { text: stripProtocol(contact.websiteUrl), url: contact.websiteUrl },
    ]
    font('normal', 9.5)
    const total = parts.reduce((sum, p, i) => sum + doc.getTextWidth(p.text) + (i ? doc.getTextWidth(separator) : 0), 0)
    let x = (PAGE_WIDTH - total) / 2
    parts.forEach((part, i) => {
      if (i) {
        doc.text(separator, x, y)
        x += doc.getTextWidth(separator)
      }
      if (part.url) doc.textWithLink(part.text, x, y, { url: part.url })
      else doc.text(part.text, x, y)
      x += doc.getTextWidth(part.text)
    })
  }

  // Header
  font('bold', 20)
  doc.text(fullName, PAGE_WIDTH / 2, y, { align: 'center' })
  y += 17
  font('normal', 12)
  doc.text(heroTitle, PAGE_WIDTH / 2, y, { align: 'center' })
  y += 13
  writeContactLine()
  y += 14
  font('normal', 10)
  writeLines(summary, MARGIN, CONTENT_WIDTH, LINE.body)

  // Technology Skills
  const skillLabel = (group: (typeof skillGroups)[number]) => {
    font('bold', 10)
    const label = `${group.label}: `
    return { label, width: doc.getTextWidth(label) }
  }
  const firstSkills = skillGroups[0]
  const skills = writeSectionHeading(
    'Technology Skills',
    lineCount(firstSkills.skills.join(', '), 'normal', 10, CONTENT_WIDTH - skillLabel(firstSkills).width) * LINE.body,
  )
  for (const group of skillGroups) {
    const { label, width } = skillLabel(group)
    ensureSpace(LINE.body)
    doc.text(label, MARGIN, y)
    skills.content()
    font('normal', 10)
    writeLines(group.skills.join(', '), MARGIN + width, CONTENT_WIDTH - width, LINE.body)
  }

  // Professional Experience
  const companyLabel = (company: Company) => (company.location ? `${company.name} — ${company.location}` : company.name)
  const companyBlock = (company: Company) =>
    rowHeight(companyLabel(company), company.dateRange, 'bold', 11, LINE.company) + entryBlock(pdfEntries(company)[0])
  const experienceSection = writeSectionHeading('Professional Experience', companyBlock(experience[0]))
  experience.forEach((company, companyIndex) => {
    if (companyIndex > 0) y += COMPANY_GAP
    const companyHeading = keepTogether(company.name, companyBlock(company))
    font('bold', 11)
    writeRow(companyLabel(company), company.dateRange, LINE.company)
    experienceSection.content()

    for (const entry of pdfEntries(company)) {
      const entryHeading = keepTogether(`${company.name}: ${entry.heading}`, entryBlock(entry))
      font('italic', 10)
      writeRow(entry.heading, entry.dates, LINE.role)
      companyHeading.content()
      if (entry.bullets.length) {
        ensureSpace(LINE.bullet)
        entryHeading.content()
        writeBullets(entry.bullets)
      }
    }
  })

  // Education and Professional Development
  // Laid out like a role: institution (bold) with date · location
  // right-aligned, then the degree on its own line in the role-title style
  // (italic) -- so a long degree name never has to share a line with dates.
  type CredentialItem = (typeof credentials)[number]
  const credentialDate = (credential: CredentialItem) =>
    credential.location ? `${credential.date} · ${credential.location}` : credential.date
  const credentialBlock = (credential: CredentialItem) =>
    rowHeight(credential.title, credentialDate(credential), 'bold', 10, LINE.body) +
    (credential.detail ? lineCount(credential.detail, 'normal', 10, CONTENT_WIDTH) * LINE.role : 0)
  const education = writeSectionHeading('Education and Professional Development', credentialBlock(credentials[0]))
  for (const credential of credentials) {
    const entry = keepTogether(credential.title, credentialBlock(credential))
    font('bold', 10)
    writeRow(credential.title, credentialDate(credential), LINE.body)
    education.content()
    if (credential.detail) {
      font('italic', 10)
      writeLines(credential.detail, MARGIN, CONTENT_WIDTH, LINE.role)
    }
    entry.content()
  }

  return {
    doc,
    layout: { pages: page(), lastPageFill: (y - MARGIN) / (BOTTOM - MARGIN), headings },
  }
}

export function generateResumePdf(): void {
  buildResumePdf().doc.save('Aaron_Tilley_Resume.pdf')
}
