export type PcGame = {
  id: string
  name: string
  rating: number | null
  status: string | null
  playtimeMinutes: number | null
}

// Hand-maintained -- there's no PC-game source hooked up yet (the Notion
// database only tracks board games). Edit this list directly for now.
export const pcGames: PcGame[] = [
  { id: 'pc-1', name: 'Heroes of Might and Magic: Olden Era', rating: 8, status: 'In Rotation', playtimeMinutes: null },
  { id: 'pc-2', name: 'Cyberpunk 2077', rating: 9, status: 'Played', playtimeMinutes: null },
  { id: 'pc-3', name: "Baldur's Gate 3", rating: 10, status: 'Unplayed', playtimeMinutes: null },
]
