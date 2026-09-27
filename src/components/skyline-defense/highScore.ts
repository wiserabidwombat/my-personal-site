const KEY = 'skyline-defense-high-score'

// Storage can be unavailable (private windows, blocked site data); the
// game then simply starts each visit with a high score of 0.
export function loadHighScore(): number {
  try {
    const value = Number(localStorage.getItem(KEY))
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  } catch {
    return 0
  }
}

export function saveHighScore(score: number) {
  try {
    localStorage.setItem(KEY, String(score))
  } catch {
    // Not saved; the in-memory high score still shows for this visit.
  }
}
