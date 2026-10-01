import { useEffect, useState, type RefObject } from 'react'

export type ScrollEdges = {
  // More content to the left (scrolled away from the start).
  canScrollBack: boolean
  // More content to the right.
  canScrollForward: boolean
}

// A couple of pixels of slack, so subpixel scroll positions still count as
// "at the edge".
const SLACK = 2

// Starts as "at the start, more to the right", which is what the strip
// shows on load at every width it's used at -- so the prerendered page
// already has the right fade and next button, with no flash.
const INITIAL: ScrollEdges = { canScrollBack: false, canScrollForward: true }

// Tracks whether a horizontal scroll container can scroll further in each
// direction. Measures on scroll (passive, at most once per animation frame)
// and whenever the container or its content changes size, e.g. on resize.
export function useScrollEdges(ref: RefObject<HTMLElement | null>): ScrollEdges {
  const [edges, setEdges] = useState<ScrollEdges>(INITIAL)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0
    const measure = () => {
      frame = 0
      const maxScroll = el.scrollWidth - el.clientWidth
      const next = {
        canScrollBack: el.scrollLeft > SLACK,
        canScrollForward: el.scrollLeft < maxScroll - SLACK,
      }
      setEdges((prev) =>
        prev.canScrollBack === next.canScrollBack && prev.canScrollForward === next.canScrollForward ? prev : next,
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    el.addEventListener('scroll', schedule, { passive: true })
    const observer = new ResizeObserver(schedule)
    observer.observe(el)
    for (const child of el.children) observer.observe(child)
    measure()

    return () => {
      el.removeEventListener('scroll', schedule)
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [ref])

  return edges
}
