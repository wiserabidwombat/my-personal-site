import { credentials } from '../../lib/resume-data'

// Full container width in a 2-column grid, matching the skills grid above
// (stacked on mobile). Same card border as the skill groups, no glow.
// Each card reads like a role in Experience: institution with date ·
// location on the right (role-date style), then the degree in the
// role-title style.
export function ResumeEducation() {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      {credentials.map((credential) => (
        <div
          key={credential.title}
          className="rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-semibold text-slate-100">{credential.title}</h3>
            <span className="text-xs text-slate-400">
              {credential.date}
              {credential.location && <> &middot; {credential.location}</>}
            </span>
          </div>
          {credential.detail && (
            <p className="mt-2 font-semibold text-[var(--neon-pink)]">{credential.detail}</p>
          )}
        </div>
      ))}
    </div>
  )
}
