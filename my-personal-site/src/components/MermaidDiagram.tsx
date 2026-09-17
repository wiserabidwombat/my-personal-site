import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  chart: string
}

// Mermaid renders to SVG at runtime (it walks the DOM and needs a real
// browser), so this can't happen at build time -- it's loaded dynamically
// (code-split out of the main bundle) and rendered imperatively into a ref
// on mount, rather than through React state/JSX, since the output is a
// pre-built SVG string, not something React needs to reconcile.
export function MermaidDiagram({ chart }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const diagramId = `mermaid-${useId().replace(/:/g, '')}`
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    import('mermaid')
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          fontFamily: 'inherit',
          // Render at natural size rather than mermaid's default
          // shrink-to-fit-container behavior, so a wide flowchart with
          // subgraphs stays legible on narrow viewports and scrolls
          // horizontally (via the wrapping overflow-x-auto container)
          // instead of shrinking its text down to fit.
          flowchart: { useMaxWidth: false },
        })
        return mermaid.render(diagramId, chart)
      })
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
        }
      })

    return () => {
      cancelled = true
    }
  }, [chart, diagramId])

  if (error) {
    return <p className="text-sm text-red-400">Unable to render diagram: {error}</p>
  }

  return <div ref={containerRef} role="img" aria-label="Site architecture diagram" />
}
