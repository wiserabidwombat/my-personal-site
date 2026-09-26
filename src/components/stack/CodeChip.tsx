import { Fragment } from 'react'

// A dark inline code chip. The `!` modifiers are needed because index.css
// styles bare `code` elements outside Tailwind's layers (a light background
// and inline-flex, which also stops wrapping), and unlayered rules beat
// utility classes. `inline` plus box-decoration-clone lets a long path wrap
// across lines with each fragment keeping its border and padding; a <wbr>
// after every slash makes the slashes the preferred break points.
export function CodeChip({ children }: { children: string }) {
  const parts = children.split('/')
  return (
    <code className="!inline rounded !border !border-[var(--cyber-purple)]/50 !bg-[var(--deep-space-purple)] !px-1.5 !py-0.5 !text-[0.85em] !leading-normal !text-[var(--laser-cyan)] [box-decoration-break:clone]">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <>
              /<wbr />
            </>
          )}
        </Fragment>
      ))}
    </code>
  )
}
