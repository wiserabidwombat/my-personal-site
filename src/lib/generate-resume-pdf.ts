import { jsPDF } from 'jspdf'
import {
  fullName,
  heroTitle,
  contact,
  summary,
  skillGroups,
  experience,
  credentials,
  type Project,
  type Role,
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

// Line advances (pt) per text style. Body text, bullets included, is never
// below 10pt; the 9.5pt project labels and contact line are labels/meta.
const BULLET_SIZE = 10
const LINE = { body: 13, company: 15, role: 13, project: 12, bullet: 12.5 }
const BULLET_INDENT = 14
const BULLET_GAP = 12
const BULLET_TEXT_WIDTH = CONTENT_WIDTH - BULLET_INDENT - BULLET_GAP
const SECTION_HEADING_HEIGHT = 21 // 6 above + rule 3 below the baseline + 12 after
const COMPANY_GAP = 8
const ROLE_GAP = 4 // above each role after a company's first
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
  const projectBlock = (project: Project) => LINE.project + firstBulletHeight(project.bullets)
  const rowHeight = (left: string, right: string | undefined, style: 'bold' | 'italic', size: number, lineHeight: number) => {
    font(style, size)
    return rowLines(left, right).length * lineHeight
  }
  const roleBlock = (role: Role) =>
    rowHeight(role.title, role.dateRange, 'italic', 10, LINE.role) +
    (role.projects?.length ? projectBlock(role.projects[0]) : firstBulletHeight(role.bullets))

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
    y += 6
    font('bold', 12)
    doc.text(title.toUpperCase(), MARGIN, y)
    y += 3
    doc.setLineWidth(0.75)
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
    y += 12
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
  y += 20
  font('normal', 12)
  doc.text(heroTitle, PAGE_WIDTH / 2, y, { align: 'center' })
  y += 15
  writeContactLine()
  y += 18
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
  const companyLabel = (company: (typeof experience)[number]) =>
    company.location ? `${company.name} — ${company.location}` : company.name
  const companyBlock = (index: number) =>
    rowHeight(companyLabel(experience[index]), experience[index].dateRange, 'bold', 11, LINE.company) +
    roleBlock(experience[index].roles[0])
  const experienceSection = writeSectionHeading('Professional Experience', companyBlock(0))
  experience.forEach((company, companyIndex) => {
    if (companyIndex > 0) y += COMPANY_GAP
    const companyHeading = keepTogether(company.name, companyBlock(companyIndex))
    font('bold', 11)
    writeRow(companyLabel(company), company.dateRange, LINE.company)
    experienceSection.content()

    company.roles.forEach((role, roleIndex) => {
      if (roleIndex > 0) y += ROLE_GAP
      const roleHeading = keepTogether(`${company.name}: ${role.title}`, roleBlock(role))
      font('italic', 10)
      writeRow(role.title, role.dateRange, LINE.role)
      companyHeading.content()

      if (role.projects) {
        role.projects.forEach((project) => {
          const projectHeading = keepTogether(`${role.title}: ${project.name}`, projectBlock(project))
          font('bold', 9.5)
          doc.text(`Project: ${project.name}`, MARGIN + BULLET_INDENT, y)
          y += LINE.project
          roleHeading.content()
          projectHeading.content()
          writeBullets(project.bullets)
        })
      } else if (role.bullets) {
        ensureSpace(LINE.bullet)
        roleHeading.content()
        writeBullets(role.bullets)
      }
    })
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
