// The Home page's Current Status cards that aren't pulled from live data.
// Edit the text here; nothing else needs to change.

export type ManualStatus = {
  value: string
  // Optional link for the card: a site path ('/blog') or a full URL.
  href?: string
}

export const manualStatus: { nowCasting: ManualStatus; nowLearning: ManualStatus } = {
  nowCasting: { value: 'Too hot for fishing in Texas' },
  nowLearning: { value: 'AI agent workflows' },
}

// What a live card shows if its data can't load (Hardcover or Spotify is
// down, or there's nothing current). Leave a value empty to hide that card
// instead. Now Playing needs no fallback: it comes from the Currently Loving
// game in src/data/currently-loving.ts, not from a request.
export const liveStatusFallbacks = {
  nowReading: '',
  nowListening: '',
}
