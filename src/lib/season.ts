// The October-only Halloween theme. index.html carries a hand-copied version
// of resolveSeason() as an inline <head> script (it must run before any
// bundle loads, so there's no flash of the normal theme); season.test.ts
// runs that script against the same cases to keep the two in step.

export type Season = 'halloween' | 'none'

export const SEASON_PARAM = 'season'
export const PREVIEW_KEY = 'season-preview' // sessionStorage
export const OPT_OUT_KEY = 'halloween-opt-out' // localStorage
export const SEASON_ATTRIBUTE = 'data-season'

export type SeasonInputs = {
  now: Date
  // window.location.search, e.g. '?season=halloween'
  search: string
  // sessionStorage preview value, if any
  preview: string | null
  // localStorage opt-out value, if any
  optOut: string | null
}

const asSeason = (value: string | null): Season | null =>
  value === 'halloween' || value === 'none' ? value : null

// October, in the visitor's local time zone.
export function isHalloweenDate(now: Date): boolean {
  return now.getMonth() === 9
}

// Checked in order: a ?season= URL parameter (saved as the session's
// preview), a preview saved earlier this session, the visitor's opt-out,
// then the date.
export function resolveSeason({ now, search, preview, optOut }: SeasonInputs): {
  season: Season
  // A preview to save to sessionStorage, when the URL set one.
  savePreview: Season | null
} {
  const fromUrl = asSeason(new URLSearchParams(search).get(SEASON_PARAM))
  if (fromUrl) return { season: fromUrl, savePreview: fromUrl }
  const saved = asSeason(preview)
  if (saved) return { season: saved, savePreview: null }
  if (optOut === 'true') return { season: 'none', savePreview: null }
  return { season: isHalloweenDate(now) ? 'halloween' : 'none', savePreview: null }
}

// Whether the Halloween theme can be turned on or off right now: it's
// October, or this session is previewing (?season=halloween or =none).
// Otherwise the date rule has nothing to turn on, so the footer toggle
// stays hidden.
export function isSeasonAvailable({ now, preview }: Pick<SeasonInputs, 'now' | 'preview'>): boolean {
  return isHalloweenDate(now) || asSeason(preview) !== null
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

// The visitor's footer toggle. Turning the theme off records the opt-out;
// turning it on clears it. In October that's all it takes. Outside October
// the only way the theme is on is a preview, so the choice is kept as the
// session's preview instead ('halloween' or 'none'), which also keeps the
// toggle available to switch back.
export function applySeasonChoice(enabled: boolean, now: Date, local: StorageLike, session: StorageLike) {
  if (enabled) local.removeItem(OPT_OUT_KEY)
  else local.setItem(OPT_OUT_KEY, 'true')
  if (isHalloweenDate(now)) session.removeItem(PREVIEW_KEY)
  else session.setItem(PREVIEW_KEY, enabled ? 'halloween' : 'none')
}

// The browser UI color (<meta name="theme-color">): the page background for
// the active theme and season. Mirrored in index.html's season script.
export function themeColorFor(season: Season, theme: 'dark' | 'light'): string {
  if (season === 'halloween') return theme === 'light' ? '#fbf5ec' : '#0c0710'
  return theme === 'light' ? '#f7f5fb' : '#0a0612'
}

// ---------------------------------------------------------------------------
// Browser helpers (never called during prerendering).
// ---------------------------------------------------------------------------

function safeGet(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key)
  } catch {
    return null
  }
}

export function readSeasonInputs(): SeasonInputs {
  return {
    now: new Date(),
    search: window.location.search,
    preview: safeGet(() => window.sessionStorage, PREVIEW_KEY),
    optOut: safeGet(() => window.localStorage, OPT_OUT_KEY),
  }
}

// Re-resolves the season and updates <html data-season>, e.g. after the
// visitor toggles it. The URL parameter is ignored here: it already did its
// job (saving the preview) when the page loaded.
export function syncSeasonAttribute() {
  const inputs = { ...readSeasonInputs(), search: '' }
  const { season } = resolveSeason(inputs)
  if (season === 'halloween') document.documentElement.setAttribute(SEASON_ATTRIBUTE, 'halloween')
  else document.documentElement.removeAttribute(SEASON_ATTRIBUTE)
  updateThemeColor()
}

// Re-reads data-season and data-theme and updates <meta name="theme-color">.
// Called after a season change and after the light/dark toggle.
export function updateThemeColor() {
  const root = document.documentElement
  const season: Season = root.getAttribute(SEASON_ATTRIBUTE) === 'halloween' ? 'halloween' : 'none'
  const theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColorFor(season, theme))
}
