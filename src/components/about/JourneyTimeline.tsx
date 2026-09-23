import { cn } from 'cn'
import { bodyText, mutedText, proseWidth } from './typography'
import { buildJourneyEntries } from '../../lib/journey'
import { credentials, experience } from '../../lib/resume-data'

// Derived from the resume (src/lib/resume-data.ts) so dates, titles, and
// companies can't drift from it -- only the one-line blurbs are About-only,
// stored as optional aboutDetail fields alongside the resume entries.
const entries = buildJourneyEntries(experience, credentials)

// Tighter indent on mobile so entries get more width. The dot's offset is
// the list padding + 5.5px (half the 10px dot + half the 1px line), so it
// has to change in step with pl-* at each breakpoint to stay centered.
// timelineContentIndent in ./typography mirrors ml-* + border + pl-*.
export function JourneyTimeline() {
  return (
    <ol className="relative ml-1.5 space-y-8 border-l border-[var(--laser-cyan)]/40 pl-5 sm:ml-3 sm:pl-8">
      {entries.map((entry) => (
        <li key={entry.key} className="relative">
          <span className="absolute top-1.5 -left-[calc(1.25rem+5.5px)] size-2.5 rounded-full bg-[var(--laser-cyan)] sm:-left-[calc(2rem+5.5px)]" />
          <p className="text-xs font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">{entry.years}</p>
          <p className={cn('mt-1', bodyText, 'leading-snug font-semibold text-slate-100')}>
            {/* A combined entry (e.g. MEDHOST) stacks its role progression one
                title per line, oldest first, each later title led by a small
                cyan arrow -- so it wraps within the content width at any size. */}
            {entry.roles.map((role, index) => (
              <span key={role} className="block">
                {index > 0 && (
                  <>
                    <span className="mr-1.5 font-normal text-[var(--laser-cyan)]" aria-hidden="true">
                      ↳
                    </span>
                    <span className="sr-only">then </span>
                  </>
                )}
                {role}
              </span>
            ))}
          </p>
          <p className={cn('mt-0.5', mutedText)}>{entry.place}</p>
          {entry.detail && <p className={cn('mt-2', bodyText, proseWidth)}>{entry.detail}</p>}
        </li>
      ))}
    </ol>
  )
}
