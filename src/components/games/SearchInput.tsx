import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'

const DEBOUNCE_MS = 250

type Props = {
  // The committed search from the URL.
  value: string
  onCommit: (value: string) => void
}

// Search box that edits a local draft and commits it to the URL only after
// typing pauses, so each keystroke isn't a navigation (and a re-filter).
export function SearchInput({ value, onCommit }: Props) {
  const [draft, setDraft] = useState(value)

  // The URL changed from elsewhere (Clear filters, back/forward): show it.
  // Adjusted during render rather than in an effect, React's documented
  // pattern for syncing state to a changed prop.
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }

  useEffect(() => {
    if (draft === value) return
    const timer = window.setTimeout(() => onCommit(draft), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
    // onCommit is recreated each render; the draft is what matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, value])

  return (
    <div className="relative w-full sm:w-64">
      <HugeiconsIcon
        icon={Search01Icon}
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search games..."
        aria-label="Search games"
        className="pl-9"
      />
    </div>
  )
}
