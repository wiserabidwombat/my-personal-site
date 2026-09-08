import { useEffect, useState } from 'react'
import type { Specimen } from '../types/specimen'

export type SpecimensState =
  | { status: 'loading'; specimens: [] }
  | { status: 'error'; specimens: [] }
  | { status: 'ready'; specimens: Specimen[] }

export function useSpecimens(): SpecimensState {
  const [state, setState] = useState<SpecimensState>({ status: 'loading', specimens: [] })

  useEffect(() => {
    let cancelled = false

    fetch('/api/fossils')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json() as Promise<{ specimens: Specimen[] }>
      })
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', specimens: data.specimens })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', specimens: [] })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
