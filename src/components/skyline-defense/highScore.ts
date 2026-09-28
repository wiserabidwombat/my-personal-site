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

const INITIALS_KEY = 'skyline-defense-initials'

// The initials this player last put on the leaderboard, so the entry
// screen can start there; null if none (or storage is unavailable).
export function loadInitials(): string | null {
  try {
    const value = localStorage.getItem(INITIALS_KEY)
    return value && /^[A-Z]{3}$/.test(value) ? value : null
  } catch {
    return null
  }
}

export function saveInitials(initials: string) {
  try {
    localStorage.setItem(INITIALS_KEY, initials)
  } catch {
    // Not remembered; the entry screen starts at AAA next time.
  }
}
