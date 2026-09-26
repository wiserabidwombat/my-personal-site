import { useEffect, useState } from 'react'
import type { CurrentlyReadingBook } from '../types/book'

export type CurrentlyReadingState = {
  books: CurrentlyReadingBook[]
  status: 'loading' | 'live' | 'error'
}

// Books currently being read, from /api/currently-reading. Used by the Books
// page's Currently Reading section and the Home page's Now Reading card.
export function useCurrentlyReading(): CurrentlyReadingState {
  const [state, setState] = useState<CurrentlyReadingState>({ books: [], status: 'loading' })

  useEffect(() => {
    let cancelled = false

    fetch('/api/currently-reading')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json() as Promise<{ books: CurrentlyReadingBook[] }>
      })
      .then((data) => {
        if (!cancelled) setState({ books: data.books, status: 'live' })
      })
      .catch(() => {
        if (!cancelled) setState({ books: [], status: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
