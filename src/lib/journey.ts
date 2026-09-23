import type { Company, Credential } from './resume-data'

// One entry in the About page's "My Journey" timeline. Every field except
// `detail` is derived from resume-data.ts, so the timeline can't drift from
// the resume. `roles` has more than one title only for a company marked
// `aboutCombined` (e.g. MEDHOST), listed oldest first as a progression.
export type JourneyEntry = {
  key: string
  years: string
  roles: string[]
  place: string
  detail?: string
}

// "June 2026 – Present" -> "2026 – Present", "April 2023 – June 2026" ->
// "2023 – 2026", "December 2004" -> "2004". Ranges that start and end in
// the same year collapse to that single year.
export function yearsOf(range: string): string {
  const parts = range.split('–').map((part) => {
    const trimmed = part.trim()
    return /present/i.test(trimmed) ? 'Present' : (trimmed.match(/\d{4}/)?.[0] ?? trimmed)
  })
  if (parts.length === 2 && parts[0] === parts[1]) return parts[0]
  return parts.join(' – ')
}

function placeOf(name: string, location?: string) {
  return location ? `${name} · ${location}` : name
}

// Oldest first: degrees, then each company's roles in chronological order.
// resume-data.ts lists companies and roles newest first (resume order), so
// both are reversed here.
export function buildJourneyEntries(experience: Company[], credentials: Credential[]): JourneyEntry[] {
  const education: JourneyEntry[] = credentials
    .filter((credential) => credential.kind === 'degree')
    .map((credential) => ({
      key: `degree-${credential.title}`,
      years: yearsOf(credential.date),
      roles: [credential.detail ?? credential.title],
      place: placeOf(credential.title, credential.location),
      detail: credential.aboutDetail,
    }))

  const work = [...experience].reverse().flatMap((company): JourneyEntry[] => {
    const place = placeOf(company.name, company.location)
    if (company.aboutCombined) {
      return [
        {
          key: company.name,
          years: yearsOf(company.dateRange),
          roles: [...company.roles].reverse().map((role) => role.title),
          place,
          detail: company.aboutCombined.detail,
        },
      ]
    }
    return [...company.roles].reverse().map((role) => ({
      key: `${company.name}-${role.title}`,
      years: yearsOf(role.dateRange ?? company.dateRange),
      roles: [role.title],
      place,
      detail: role.aboutDetail,
    }))
  })

  return [...education, ...work]
}
