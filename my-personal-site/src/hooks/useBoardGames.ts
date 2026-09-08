import { useEffect, useState } from 'react'
import boardGamesFallback from '../data/board-games.json'
import type { BoardGame } from '../types/board-game'

export type BoardGamesSource = 'loading' | 'live' | 'cached'

export type BoardGamesState = {
  games: BoardGame[]
  source: BoardGamesSource
}

const fallback = boardGamesFallback as BoardGame[]

export function useBoardGames(): BoardGamesState {
  const [state, setState] = useState<BoardGamesState>({ games: fallback, source: 'loading' })

  useEffect(() => {
    let cancelled = false

    fetch('/api/games')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json() as Promise<{ games: BoardGame[] }>
      })
      .then((data) => {
        if (!cancelled) setState({ games: data.games, source: 'live' })
      })
      .catch(() => {
        if (!cancelled) setState({ games: fallback, source: 'cached' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
