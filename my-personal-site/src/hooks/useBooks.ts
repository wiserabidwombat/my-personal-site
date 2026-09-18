import { useEffect, useState } from 'react'
import type { Book } from '../types/book'

export type BooksStatus = 'loading' | 'live' | 'error'

export type BooksState = {
  books: Book[]
  status: BooksStatus
}

export function useBooks(): BooksState {
  const [state, setState] = useState<BooksState>({ books: [], status: 'loading' })

  useEffect(() => {
    let cancelled = false

    fetch('/api/books')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json() as Promise<{ books: Book[] }>
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
