type Entry = {
  years: string
  role: string
  company: string
  detail: string
}

// Oldest first. UNT precedes Bank of America chronologically (1999-2005 vs.
// 2006-2009) even though the original ask listed it second -- see about.tsx
// for the intro line that leads into this list.
const entries: Entry[] = [
  {
    years: '1999 – 2005',
    role: 'B.S. Computer Information Systems',
    company: 'University of North Texas',
    detail: 'Turned that high-school BASIC habit into a real foundation in systems and software.',
  },
  {
    years: '2006 – 2009',
    role: 'Technical Support',
    company: 'Bank of America, Plano TX',
    detail: 'Cut my teeth supporting production systems in a high-stakes financial environment.',
  },
  {
    years: '2011 – 2016',
    role: 'Technical Support',
    company: 'MEDHOST, Plano TX',
    detail: 'Supported mission-critical emergency department software where reliability wasn’t optional.',
  },
  {
    years: '2016 – 2019',
    role: 'Quality Engineer',
    company: 'Armor Defense Inc., Richardson TX',
    detail: 'Moved into engineering, building the quality practices behind a security product.',
  },
  {
    years: '2019 – 2022',
    role: 'Software Engineer',
    company: 'Armor Defense Inc., Richardson TX',
    detail: 'Grew from quality into full-time development on the same product.',
  },
  {
    years: '2022 – 2023',
    role: 'Developer',
    company: 'Alight Solutions',
    detail: 'Joined to build out enterprise-scale full-stack systems.',
  },
  {
    years: '2023 – 2026',
    role: 'Team Lead',
    company: 'Alight Solutions',
    detail: 'Led a development team while staying hands-on with the code.',
  },
  {
    years: '2026 – Present',
    role: 'Senior Developer',
    company: 'Alight Solutions',
    detail: 'Leading a Salesforce → Dynamics 365 CRM migration.',
  },
]

export function JourneyTimeline() {
  return (
    <ol className="relative ml-3 space-y-8 border-l border-[var(--laser-cyan)]/40 pl-8">
      {entries.map((entry) => (
        <li key={`${entry.company}-${entry.years}`} className="relative">
          <span className="absolute top-1.5 -left-[calc(2rem+3px)] size-2.5 rounded-full bg-[var(--laser-cyan)]" />
          <p className="text-xs font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">{entry.years}</p>
          <p className="mt-1 font-semibold text-slate-100">
            {entry.role} &middot; {entry.company}
          </p>
          <p className="mt-1 text-[17px] leading-relaxed font-normal text-slate-300 sm:text-[18px]">
            {entry.detail}
          </p>
        </li>
      ))}
    </ol>
  )
}
