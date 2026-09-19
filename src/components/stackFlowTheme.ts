import type { IconSvgElement } from '@hugeicons/react'

export type Glow = 'pink' | 'cyan' | 'purple'

export const glowStyles: Record<Glow, { ring: string; shadow: string; icon: string; stroke: string }> = {
  pink: { ring: 'ring-[var(--neon-pink)]/60', shadow: 'shadow-glow-pink', icon: 'text-[var(--neon-pink)]', stroke: 'var(--neon-pink)' },
  cyan: { ring: 'ring-[var(--laser-cyan)]/60', shadow: 'shadow-glow-cyan', icon: 'text-[var(--laser-cyan)]', stroke: 'var(--laser-cyan)' },
  purple: { ring: 'ring-[var(--cyber-purple)]/60', shadow: 'shadow-glow-purple', icon: 'text-[var(--cyber-purple)]', stroke: 'var(--cyber-purple)' },
}

export type StackNodeData = {
  label: string
  icon: IconSvgElement
  glow: Glow
}
