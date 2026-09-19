import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  chart: string
  // Mermaid's own default (true) scales the SVG down to fit its container --
  // right for a narrow, single-flow diagram that should never need to
  // scroll. A wide diagram with side-by-side subgraphs should instead pass
  // false to keep its natural size and rely on a scrollable wrapper, since
  // shrinking it to fit would make its text illegibly small.
  useMaxWidth?: boolean
}

// Mermaid renders to SVG at runtime (it walks the DOM and needs a real
// browser), so this can't happen at build time -- it's loaded dynamically
// (code-split out of the main bundle) and rendered imperatively into a ref
// on mount, rather than through React state/JSX, since the output is a
// pre-built SVG string, not something React needs to reconcile.
export function MermaidDiagram({ chart, useMaxWidth = true }: Props) {
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
          flowchart: { useMaxWidth },
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
  }, [chart, diagramId, useMaxWidth])

  if (error) {
    return <p className="text-sm text-red-400">Unable to render diagram: {error}</p>
  }

  return <div ref={containerRef} role="img" aria-label="Site architecture diagram" />
}
