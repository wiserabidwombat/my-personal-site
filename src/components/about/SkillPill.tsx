type Props = {
  children: string
}

// Outlined skill pill for the About page's Technical Toolkit -- kept
// separate from the shared shadcn Badge (used in 18+ other files with a
// filled style) rather than restyling it, so this look stays scoped to
// About.
export function SkillPill({ children }: Props) {
  return (
    <span className="rounded-full border border-[var(--laser-cyan)] px-3 py-1 text-xs font-medium text-[var(--laser-cyan)] transition-colors hover:bg-[var(--laser-cyan)]/10">
      {children}
    </span>
  )
}
