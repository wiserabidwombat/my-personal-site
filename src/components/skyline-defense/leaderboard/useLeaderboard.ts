import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchBoard, type BoardEntry } from './api'

export type BoardStatus = 'loading' | 'ready' | 'unavailable'

// A board fetched this recently is reused instead of refetched.
const FRESH_MS = 15_000

// The global Top 10: fetched once on mount, refreshed on demand (reusing a
// recent fetch), and replaced directly after a submit returns a new board.
// State only changes once a fetch settles: the board starts out 'loading',
// and a later refresh keeps showing what it had until then.
export function useLeaderboard() {
  const [status, setStatus] = useState<BoardStatus>('loading')
  const [board, setBoard] = useState<BoardEntry[]>([])
  const fetchedAt = useRef(0)
  const mounted = useRef(true)

  // Applies a fetched board, or null when the global board isn't available.
  const apply = useCallback((next: BoardEntry[] | null) => {
    if (!mounted.current) return
    if (next) {
      fetchedAt.current = Date.now()
      setBoard(next)
      setStatus('ready')
    } else {
      setStatus('unavailable')
    }
  }, [])

  const refresh = useCallback(() => {
    if (fetchedAt.current && Date.now() - fetchedAt.current < FRESH_MS) return
    fetchBoard().then(apply)
  }, [apply])

  useEffect(() => {
    mounted.current = true
    fetchBoard().then(apply)
    return () => {
      mounted.current = false
    }
  }, [apply])

  const replace = useCallback((next: BoardEntry[]) => apply(next), [apply])
  return { status, board, refresh, replace }
}
