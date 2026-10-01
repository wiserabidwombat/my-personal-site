import { HugeiconsIcon } from '@hugeicons/react'
import { Image01Icon } from '@hugeicons/core-free-icons'
import type { Screenshot } from './projects-data'

type Props = {
  screenshots: readonly Screenshot[]
}

// A row of phone screenshots, each in a simple rounded frame. Scrolls
// sideways when the row is wider than the page (phones); fits on desktop.
// A screenshot whose file hasn't been added yet shows a labeled placeholder.
export function PhoneScreenshots({ screenshots }: Props) {
  return (
    <ul
      className="-mx-6 mt-6 flex scroll-px-6 snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4"
      aria-label="App screenshots"
    >
      {screenshots.map(({ file, image, caption }) => (
        <li key={file} className="w-52 shrink-0 snap-start sm:w-56">
          <div className="rounded-[2.25rem] border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-2">
            {image.src ? (
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="aspect-[9/19.5] w-full rounded-[1.75rem] object-cover"
              />
            ) : (
              <div className="flex aspect-[9/19.5] w-full flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-[var(--deep-space-black)] px-4 text-center text-slate-500">
                <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="size-8" aria-hidden="true" />
                <span className="text-xs">Screenshot coming soon</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-sm text-slate-400">{caption}</p>
        </li>
      ))}
    </ul>
  )
}
