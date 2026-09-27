import { cn } from 'cn'
import { buttonVariants } from '@/components/ui/button'

// Shared page container below a hero -- one max width and gutter so every
// page's headings, prose, and grids start on the same left edge.
export const pageContainer = 'mx-auto max-w-4xl px-6'

// Page title (h1) size, tracking, and spacing: 36px, 56px from lg up. These
// were once global h1 rules in index.css; as classes they no longer fight
// Tailwind. Line height is per title (see pageTitleLeading below).
export const pageTitle = 'my-[20px] text-[36px] tracking-[-1.68px] lg:my-[32px] lg:text-[56px]'
// Line heights for the two title scales used on the site.
export const pageTitleLeading = 'leading-[1.2] sm:leading-[1.111]'
export const homeTitleLeading = 'leading-[1.111] sm:leading-none'

// Heading (h2) size, line height, tracking, and bottom spacing: 20px, 24px
// from lg up -- formerly a global h2 rule in index.css.
export const headingText = 'mb-[8px] text-[20px] leading-[1.18] tracking-[-0.24px] lg:text-[24px]'

// Section heading below a hero: neon pink, no glow (the hero H1 keeps the
// page's one glow), with an accent icon -- see SectionHeading.
export const sectionHeading = cn(headingText, 'flex items-center gap-2 font-bold text-[var(--neon-pink)]')

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

// Compact hero (Blog, Contact): shorter than the site default
// (bg-synth-grid's 26rem min-height and 11rem horizon) so the first cards
// land above the fold on a ~800px laptop viewport. Horizon and glow move up with it to stay behind the text.
// The grid's visible horizon tracks the hero's BOTTOM edge (the floor is
// perspective-projected up from there), so the subtitle's clearance above
// it comes from trimming the top padding, not the bottom -- the text sits
// higher while the hero's height and the grid stay where they were.
// lg's min-height restores the pre-trim 302px desktop height (root font is
// 18px from 1024px up), since the trimmed text alone would let it shrink.
export const compactHero = cn(
  'bg-synth-grid px-6 pt-6 pb-10 text-center sm:pt-8 sm:pb-12',
  '[--synth-grid-min-height:16rem] lg:[--synth-grid-min-height:16.75rem] [--synth-grid-horizon:7.5rem] [--synth-grid-glow-y:6rem] [--synth-grid-glow-height:9rem]',
)
