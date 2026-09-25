import { useEffect, useState } from 'react'
import type { MusicResponse } from '../types/music'

export type MusicState =
  | { status: 'loading'; music: null }
  | { status: 'error'; music: null }
  | { status: 'ready'; music: MusicResponse }

export function useMusic(): MusicState {
  const [state, setState] = useState<MusicState>({ status: 'loading', music: null })

  useEffect(() => {
    let cancelled = false

    fetch('/api/spotify')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json() as Promise<MusicResponse>
      })
      .then((music) => {
        if (!cancelled) setState({ status: 'ready', music })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', music: null })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
