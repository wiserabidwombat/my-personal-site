// The About page's two body text sizes, shared so every section reads at
// the same scale. Fixed px (not rem) on purpose: the root font-size jumps
// from 16px to 18px at 1024px (index.css), which would otherwise make
// rem-based sizes shift between breakpoints independently of these.
export const bodyText = 'text-[17px] leading-relaxed font-normal text-slate-200 sm:text-[18px]'
export const mutedText = 'text-[14px] leading-snug font-normal text-slate-400 sm:text-[15px]'

// ~65ch line length for running prose; grids keep the full container width.
export const proseWidth = 'max-w-prose'

// Left offset of JourneyTimeline's text column (its ol's ml-* + 1px border
// + pl-* at each breakpoint), so content after the timeline can line up
// with the entries rather than with the line itself.
export const timelineContentIndent = 'pl-[calc(0.375rem+1px+1.25rem)] sm:pl-[calc(0.75rem+1px+2rem)]'
