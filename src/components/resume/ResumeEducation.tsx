import { credentials } from '../../lib/resume-data'

// Full container width in a 2-column grid, matching the skills grid above
// (stacked on mobile). Same card border as the skill groups, no glow.
export function ResumeEducation() {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      {credentials.map((credential) => (
        <div
          key={credential.title}
          className="rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-5"
        >
          <h3 className="font-semibold text-slate-100">{credential.title}</h3>
          {credential.detail && <p className="mt-1 text-sm text-slate-300">{credential.detail}</p>}
          <p className="mt-3 text-xs font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
            {credential.date}
            {credential.location && <> &middot; {credential.location}</>}
          </p>
        </div>
      ))}
    </div>
  )
}
