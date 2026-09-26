import { useSeason } from '../../hooks/useSeason'

// Footer link to turn the Halloween theme off, or back on after opting out.
// Shown only while the season is available (October, or a preview); the
// choice is saved in localStorage and applies immediately.
export function HalloweenToggle() {
  const { active, available, setEnabled } = useSeason()
  if (!available) return null
  return (
    <button
      type="button"
      onClick={() => setEnabled(!active)}
      className="cursor-pointer underline-offset-2 transition-colors duration-300 hover:text-[var(--laser-cyan)] hover:underline"
    >
      {active ? 'Turn off Halloween theme' : 'Turn on Halloween theme'}
    </button>
  )
}
