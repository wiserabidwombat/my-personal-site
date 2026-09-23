import { credentials } from '../../lib/resume-data'

// Full container width in a 2-column grid, matching the skills grid above
// (stacked on mobile). Same card border as the skill groups, no glow.
// Content order is institution, degree, date · location (the PDF's order),
// which is how it stacks on mobile; from sm up a 2-column grid lifts the
// date onto the institution's line, right-aligned, like a role's dates.
export function ResumeEducation() {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      {credentials.map((credential) => (
        <div
          key={credential.title}
          className="grid gap-y-1 rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-x-4"
        >
          <h3 className="font-semibold text-slate-100 sm:col-start-1 sm:row-start-1">{credential.title}</h3>
          {credential.detail && (
            <p className="text-sm leading-relaxed text-slate-300 sm:col-span-2 sm:row-start-2">{credential.detail}</p>
          )}
          <span className="text-xs text-slate-400 sm:col-start-2 sm:row-start-1 sm:text-right">
            {credential.date}
            {credential.location && <> &middot; {credential.location}</>}
          </span>
        </div>
      ))}
    </div>
  )
}
