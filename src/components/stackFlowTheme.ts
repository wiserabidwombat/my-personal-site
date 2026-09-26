import type { IconSvgElement } from '@hugeicons/react'

export type Accent = 'pink' | 'cyan' | 'purple'

// Diagram accents: icon and arrow colors only. Boxes and containers use the
// site's restrained border (no glow), like every other card on the site.
export const accentStyles: Record<Accent, { icon: string; stroke: string }> = {
  pink: { icon: 'text-[var(--neon-pink)]', stroke: 'var(--neon-pink)' },
  cyan: { icon: 'text-[var(--laser-cyan)]', stroke: 'var(--laser-cyan)' },
  purple: { icon: 'text-[var(--cyber-purple)]', stroke: 'var(--cyber-purple)' },
}

export type StackNodeData = {
  label: string
  icon: IconSvgElement
  accent: Accent
  // Optional ordered sub-steps listed inside the box (the build pipeline).
  steps?: string[]
  // Smaller text and icon, for narrow mobile boxes and sub-rows.
  compact?: boolean
}
