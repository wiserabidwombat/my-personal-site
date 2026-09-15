import { jsPDF } from 'jspdf'
import {
  fullName,
  heroTitle,
  summary,
  skillGroups,
  experience,
  credentials,
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

export function generateResumePdf(): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  let y = MARGIN

  const ensureSpace = (height: number) => {
    if (y + height > PAGE_HEIGHT - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  const writeLines = (
    text: string,
    x: number,
    maxWidth: number,
    lineHeight: number,
  ) => {
    const lines = doc.splitTextToSize(text, maxWidth) as string[]
    for (const line of lines) {
      ensureSpace(lineHeight)
      doc.text(line, x, y)
      y += lineHeight
    }
  }

  const writeRow = (left: string, right: string | undefined, lineHeight: number) => {
    ensureSpace(lineHeight)
    doc.text(left, MARGIN, y)
    if (right) {
      doc.text(right, PAGE_WIDTH - MARGIN, y, { align: 'right' })
    }
    y += lineHeight
  }

  const writeSectionHeading = (title: string) => {
    y += 6
    ensureSpace(16)
    doc.setFont('times', 'bold')
    doc.setFontSize(12)
    doc.text(title.toUpperCase(), MARGIN, y)
    y += 3
    doc.setLineWidth(0.75)
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
    y += 12
  }

  const writeBullets = (bullets: string[], indent: number) => {
    doc.setFont('times', 'normal')
    doc.setFontSize(9.5)
    const bulletWidth = 12
    const textX = MARGIN + indent + bulletWidth
    const textWidth = CONTENT_WIDTH - indent - bulletWidth
    for (const bullet of bullets) {
      const lines = doc.splitTextToSize(bullet, textWidth) as string[]
      lines.forEach((line, i) => {
        ensureSpace(12.5)
        if (i === 0) doc.text('•', MARGIN + indent, y)
        doc.text(line, textX, y)
        y += 12.5
      })
    }
  }

  // Header
  doc.setFont('times', 'bold')
  doc.setFontSize(20)
  doc.text(fullName, PAGE_WIDTH / 2, y, { align: 'center' })
  y += 20

  doc.setFont('times', 'normal')
  doc.setFontSize(12)
  doc.text(heroTitle, PAGE_WIDTH / 2, y, { align: 'center' })
  y += 20

  doc.setFontSize(10)
  writeLines(summary, MARGIN, CONTENT_WIDTH, 13)

  // Technology Skills
  writeSectionHeading('Technology Skills')
  doc.setFontSize(10)
  for (const group of skillGroups) {
    ensureSpace(13)
    doc.setFont('times', 'bold')
    const label = `${group.label}: `
    doc.text(label, MARGIN, y)
    const labelWidth = doc.getTextWidth(label)
    doc.setFont('times', 'normal')
    writeLines(group.skills.join(', '), MARGIN + labelWidth, CONTENT_WIDTH - labelWidth, 13)
  }

  // Professional Experience
  writeSectionHeading('Professional Experience')
  experience.forEach((company, companyIndex) => {
    if (companyIndex > 0) y += 8

    doc.setFont('times', 'bold')
    doc.setFontSize(11)
    const companyLabel = company.location ? `${company.name} — ${company.location}` : company.name
    writeRow(companyLabel, company.dateRange, 15)

    company.roles.forEach((role) => {
      doc.setFont('times', 'italic')
      doc.setFontSize(10)
      writeRow(role.title, role.dateRange, 13)

      if (role.projects) {
        for (const project of role.projects) {
          ensureSpace(12)
          doc.setFont('times', 'bold')
          doc.setFontSize(9.5)
          doc.text(`Project: ${project.name}`, MARGIN + 14, y)
          y += 12
          writeBullets(project.bullets, 14)
        }
      } else if (role.bullets) {
        writeBullets(role.bullets, 14)
      }
    })
  })

  // Education and Professional Development
  writeSectionHeading('Education and Professional Development')
  doc.setFontSize(10)
  for (const credential of credentials) {
    doc.setFont('times', 'bold')
    const title = credential.detail ? `${credential.title} — ${credential.detail}` : credential.title
    const dateLabel = credential.location ? `${credential.date} · ${credential.location}` : credential.date
    writeRow(title, dateLabel, 13)
    doc.setFont('times', 'normal')
  }

  doc.save('Aaron_Tilley_Resume.pdf')
}
