import { cn } from 'cn'
import { buttonVariants } from '../../@/components/ui/button'

// Shared page container below a hero -- one max width and gutter so every
// page's headings, prose, and grids start on the same left edge.
export const pageContainer = 'mx-auto max-w-4xl px-6'

// Section heading below a hero: neon pink, no glow (the hero H1 keeps the
// page's one glow), with an accent icon -- see SectionHeading.
export const sectionHeading = 'flex items-center gap-2 text-2xl font-bold text-[var(--neon-pink)]'

// Outlined pill (transparent, 1px cyan border/text). Used for skill pills on
// About, tag pills on blog cards, and -- with outlinePillActive layered on
// top -- the blog's tag filter chips.
export const outlinePill =
  'inline-flex items-center rounded-full border border-[var(--laser-cyan)] px-3 py-1 text-xs font-medium text-[var(--laser-cyan)] transition-colors'
export const outlinePillActive =
  'bg-[var(--laser-cyan)] text-[var(--deep-space-black)] hover:bg-[var(--laser-cyan)]'

// Outline button: transparent with a 1px neon border so it reads on the dark
// background, unlike the shared outline variant's near-black fill (which
// ~10 other components rely on, so it stays untouched).
export const neonOutlineButton = cn(
  buttonVariants({ variant: 'outline' }),
  'border-[var(--laser-cyan)] bg-transparent text-[var(--laser-cyan)] hover:bg-[var(--laser-cyan)]/10 hover:text-[var(--laser-cyan)] hover:shadow-glow-cyan',
)
