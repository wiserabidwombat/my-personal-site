// What the page's overlays need to know about the game. React state only
// changes when one of these does, never per frame.
export type GameUi = {
  screen: 'start' | 'playing' | 'gameOver'
  paused: boolean
  score: number
  // The wave reached (sent with a leaderboard entry).
  wave: number
  highScore: number
  newHighScore: boolean
}

export const initialUi = (highScore: number): GameUi => ({
  screen: 'start',
  paused: false,
  score: 0,
  wave: 0,
  highScore,
  newHighScore: false,
})
