import type { VercelRequest, VercelResponse } from '@vercel/node'

// ---------------------------------------------------------------------------
// Response shape (mirrored in src/types/music.ts). Only what the Music page
// renders: names, artists, artwork, Spotify links, and play times -- never
// tokens, user ids, or email.
// ---------------------------------------------------------------------------

export type MusicTrack = {
  name: string
  artists: string
  imageUrl: string | null
  spotifyUrl: string | null
}

export type RecentTrack = MusicTrack & { playedAt: string }

export type NowPlaying = MusicTrack & { type: 'track' | 'episode' }

export type MusicItem = {
  name: string
  imageUrl: string | null
  spotifyUrl: string | null
}

export type TimeRanges<T> = { shortTerm?: T[]; mediumTerm?: T[] }

// Every section is optional: a section whose Spotify call failed is left
// out, and the page hides whatever is missing.
export type MusicResponse = {
  nowPlaying?: NowPlaying
  recentlyPlayed?: RecentTrack[]
  topTracks?: TimeRanges<MusicTrack>
  topArtists?: TimeRanges<MusicItem>
  playlists?: MusicItem[]
  podcasts?: MusicItem[]
}

// ---------------------------------------------------------------------------
// Raw Spotify Web API shapes (only the fields read here).
// ---------------------------------------------------------------------------

type SpotifyImage = { url: string; width: number | null; height: number | null }
type ExternalUrls = { spotify?: string } | undefined

type RawTrack = {
  type?: 'track'
  // null for local files.
  id?: string | null
  name: string
  artists: { name: string }[]
  album: { images: SpotifyImage[] | null }
  external_urls: ExternalUrls
}

type RawEpisode = {
  type: 'episode'
  name: string
  images: SpotifyImage[] | null
  show: { name: string; images: SpotifyImage[] | null }
  external_urls: ExternalUrls
}

type RawItem = { name: string; images: SpotifyImage[] | null; external_urls: ExternalUrls }

export type RawPlaylist = RawItem & {
  id: string
  public: boolean | null
  collaborative: boolean
  owner: { id: string }
  // Track count. `items` replaced `tracks` in February 2026; either may be
  // present depending on the account's API version.
  items?: { total: number } | null
  tracks?: { total: number } | null
}

type Paged<T> = { items: T[]; next: string | null }

type TokenResponse = { access_token: string; expires_in: number }

export type SpotifyEnv = {
  SPOTIFY_CLIENT_ID?: string
  SPOTIFY_CLIENT_SECRET?: string
  SPOTIFY_REFRESH_TOKEN?: string
  SPOTIFY_SHOW_NOW_PLAYING?: string
  // Comma-separated playlist IDs to hide (bare IDs, spotify:playlist: URIs,
  // or open.spotify.com links all work).
  SPOTIFY_EXCLUDED_PLAYLISTS?: string
}

const API = 'https://api.spotify.com/v1'
const REQUEST_TIMEOUT_MS = 8000
// Refresh a little before Spotify's expiry so a token never lapses mid-request.
const EXPIRY_MARGIN_MS = 60_000
const TOP_LIMIT = 10
const MAX_PLAYLIST_PAGES = 4
// Recently played asks for Spotify's maximum so that, after repeats are
// collapsed, there are still enough unique tracks to fill the list.
const RECENT_FETCH_LIMIT = 50
export const RECENT_UNIQUE_LIMIT = 12

// Minimum rendered widths (CSS px, doubled for high-density screens).
export const LIST_ART_WIDTH = 96
export const GRID_ART_WIDTH = 240

export class SpotifyError extends Error {
  readonly status: number
  readonly reason: string | null

  constructor(status: number, reason: string | null) {
    super(`Spotify request failed: ${status}${reason ? ` ${reason}` : ''}`)
    this.status = status
    this.reason = reason
  }
}

// ---------------------------------------------------------------------------
// Access token, cached in memory per function instance until shortly before
// it expires. The user id (needed only to recognize owned playlists) is
// cached alongside it and never leaves the server.
// ---------------------------------------------------------------------------

let cachedToken: { value: string; expiresAt: number } | null = null
let cachedUserId: string | null = null

export function resetSpotifyCache() {
  cachedToken = null
  cachedUserId = null
}

export async function getAccessToken(env: SpotifyEnv, now = Date.now()): Promise<string> {
  if (cachedToken && now < cachedToken.expiresAt - EXPIRY_MARGIN_MS) return cachedToken.value

  const credentials = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN ?? '' }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new SpotifyError(response.status, await errorReason(response))

  const body = (await response.json()) as TokenResponse
  cachedToken = { value: body.access_token, expiresAt: now + body.expires_in * 1000 }
  return body.access_token
}

async function errorReason(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { error?: string | { reason?: string; message?: string } }
    if (typeof body.error === 'string') return body.error
    return body.error?.reason ?? body.error?.message ?? null
  } catch {
    return null
  }
}

// GET a Web API path (or a full `next` URL). Returns null for 204 No Content.
async function spotifyGet<T>(pathOrUrl: string, token: string): Promise<T | null> {
  const response = await fetch(pathOrUrl.startsWith('http') ? pathOrUrl : `${API}${pathOrUrl}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (response.status === 204) return null
  if (!response.ok) {
    // A rejected token won't recover by itself; drop it so the next request
    // refreshes instead of reusing it until expiry.
    if (response.status === 401) cachedToken = null
    throw new SpotifyError(response.status, await errorReason(response))
  }
  return (await response.json()) as T
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

// Spotify lists images largest first. Pick the smallest one at least
// minWidth wide (falling back to the largest), so small thumbnails don't
// download 640px art. Images with unknown width count as large enough.
export function pickImage(images: SpotifyImage[] | null | undefined, minWidth: number): string | null {
  if (!images?.length) return null
  const sorted = [...images].sort((a, b) => (b.width ?? Infinity) - (a.width ?? Infinity))
  const fitting = sorted.filter((image) => (image.width ?? Infinity) >= minWidth)
  return (fitting.at(-1) ?? sorted[0]).url
}

export function normalizeTrack(track: RawTrack, minWidth = LIST_ART_WIDTH): MusicTrack {
  return {
    name: track.name,
    artists: track.artists.map((artist) => artist.name).join(', '),
    imageUrl: pickImage(track.album.images, minWidth),
    spotifyUrl: track.external_urls?.spotify ?? null,
  }
}

export function normalizeItem(item: RawItem, minWidth = GRID_ART_WIDTH): MusicItem {
  return {
    name: item.name,
    imageUrl: pickImage(item.images, minWidth),
    spotifyUrl: item.external_urls?.spotify ?? null,
  }
}

// Only public playlists this account owns -- private ones and playlists it
// merely follows are left out.
export function ownPublicPlaylists(playlists: (RawPlaylist | null)[], userId: string): RawPlaylist[] {
  return playlists.filter(
    (playlist): playlist is RawPlaylist =>
      playlist != null && playlist.owner?.id === userId && playlist.public === true && !playlist.collaborative,
  )
}

export function excludedPlaylistIds(env: SpotifyEnv): Set<string> {
  return new Set(
    (env.SPOTIFY_EXCLUDED_PLAYLISTS ?? '')
      .split(',')
      .map((entry) => entry.trim().split(/[/:]/).at(-1)?.split('?')[0] ?? '')
      .filter(Boolean),
  )
}

// Drops playlists listed in SPOTIFY_EXCLUDED_PLAYLISTS and playlists with no
// tracks. A playlist whose track count is missing is kept.
export function showablePlaylists(playlists: RawPlaylist[], excluded: Set<string>): RawPlaylist[] {
  return playlists.filter((playlist) => {
    if (excluded.has(playlist.id)) return false
    const total = playlist.items?.total ?? playlist.tracks?.total
    return total !== 0
  })
}

type RawRecentPlay = { track: RawTrack; played_at: string }

// Keeps only the most recent play of each track (matched by track ID, or by
// link and then name for local files, which have no ID), newest first.
export function uniqueRecentPlays(plays: RawRecentPlay[], limit = RECENT_UNIQUE_LIMIT): RawRecentPlay[] {
  const newestFirst = [...plays].sort((a, b) => b.played_at.localeCompare(a.played_at))
  const seen = new Set<string>()
  const unique: RawRecentPlay[] = []
  for (const play of newestFirst) {
    const { track } = play
    const key =
      track.id ?? track.external_urls?.spotify ?? `${track.name}|${track.artists.map((artist) => artist.name).join(',')}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(play)
    if (unique.length === limit) break
  }
  return unique
}

type RawCurrentlyPlaying = {
  is_playing: boolean
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
  item: RawTrack | RawEpisode | null
}

export function normalizeNowPlaying(raw: RawCurrentlyPlaying | null): NowPlaying | undefined {
  if (!raw?.is_playing || !raw.item) return undefined
  if (raw.currently_playing_type === 'episode' && raw.item.type === 'episode') {
    const episode = raw.item
    return {
      type: 'episode',
      name: episode.name,
      artists: episode.show.name,
      imageUrl: pickImage(episode.images?.length ? episode.images : episode.show.images, GRID_ART_WIDTH),
      spotifyUrl: episode.external_urls?.spotify ?? null,
    }
  }
  if (raw.currently_playing_type === 'track' && raw.item.type !== 'episode') {
    return { type: 'track', ...normalizeTrack(raw.item, GRID_ART_WIDTH) }
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

async function loadRecentlyPlayed(token: string): Promise<RecentTrack[]> {
  const page = await spotifyGet<Paged<RawRecentPlay>>(`/me/player/recently-played?limit=${RECENT_FETCH_LIMIT}`, token)
  return uniqueRecentPlays(page?.items ?? []).map((play) => ({ ...normalizeTrack(play.track), playedAt: play.played_at }))
}

async function loadTop<T extends 'tracks' | 'artists'>(token: string, type: T, range: 'short_term' | 'medium_term') {
  const page = await spotifyGet<Paged<T extends 'tracks' ? RawTrack : RawItem>>(
    `/me/top/${type}?time_range=${range}&limit=${TOP_LIMIT}`,
    token,
  )
  return page?.items ?? []
}

async function loadUserId(token: string): Promise<string> {
  if (cachedUserId) return cachedUserId
  const me = await spotifyGet<{ id: string }>('/me', token)
  if (!me?.id) throw new SpotifyError(500, 'missing user id')
  cachedUserId = me.id
  return me.id
}

async function loadPlaylists(token: string, excluded: Set<string>): Promise<MusicItem[]> {
  const [userId, playlists] = await Promise.all([
    loadUserId(token),
    (async () => {
      const all: (RawPlaylist | null)[] = []
      let next: string | null = '/me/playlists?limit=50'
      for (let page = 0; next && page < MAX_PLAYLIST_PAGES; page++) {
        const result: Paged<RawPlaylist | null> | null = await spotifyGet<Paged<RawPlaylist | null>>(next, token)
        all.push(...(result?.items ?? []))
        next = result?.next ?? null
      }
      return all
    })(),
  ])
  return showablePlaylists(ownPublicPlaylists(playlists, userId), excluded).map((playlist) => normalizeItem(playlist))
}

async function loadPodcasts(token: string): Promise<MusicItem[]> {
  const page = await spotifyGet<Paged<{ show: RawItem }>>('/me/shows?limit=50', token)
  return (page?.items ?? []).map((item) => normalizeItem(item.show))
}

async function loadNowPlaying(token: string): Promise<NowPlaying | undefined> {
  const raw = await spotifyGet<RawCurrentlyPlaying>('/me/player/currently-playing?additional_types=track,episode', token)
  return normalizeNowPlaying(raw)
}

export function showNowPlaying(env: SpotifyEnv): boolean {
  return env.SPOTIFY_SHOW_NOW_PLAYING === 'true'
}

// Fetches every section in parallel. A failed section (403, 429 with
// QUOTA_EXCEEDED, a network error, ...) is logged and left out; the rest is
// still returned. `failed` counts the Spotify calls that failed.
export async function loadMusic(env: SpotifyEnv): Promise<{ music: MusicResponse; failed: number; attempted: number }> {
  const token = await getAccessToken(env)
  const music: MusicResponse = {}

  // Each loader stores its own result, so one failure never touches another
  // section. Each time range is its own call, so it can fail on its own.
  const sections: Record<string, () => Promise<void>> = {
    recentlyPlayed: async () => {
      music.recentlyPlayed = await loadRecentlyPlayed(token)
    },
    playlists: async () => {
      music.playlists = await loadPlaylists(token, excludedPlaylistIds(env))
    },
    podcasts: async () => {
      music.podcasts = await loadPodcasts(token)
    },
  }
  for (const [range, key] of [['short_term', 'shortTerm'], ['medium_term', 'mediumTerm']] as const) {
    sections[`topTracks.${key}`] = async () => {
      const tracks = (await loadTop(token, 'tracks', range)).map((track) => normalizeTrack(track))
      music.topTracks = { ...music.topTracks, [key]: tracks }
    }
    sections[`topArtists.${key}`] = async () => {
      const artists = (await loadTop(token, 'artists', range)).map((artist) => normalizeItem(artist))
      music.topArtists = { ...music.topArtists, [key]: artists }
    }
  }
  if (showNowPlaying(env)) {
    sections.nowPlaying = async () => {
      const nowPlaying = await loadNowPlaying(token)
      if (nowPlaying) music.nowPlaying = nowPlaying
    }
  }

  const names = Object.keys(sections)
  const results = await Promise.allSettled(names.map((name) => sections[name]()))
  let failed = 0
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      failed++
      console.error(`Spotify section "${names[index]}" failed`, result.reason)
    }
  })
  return { music, failed, attempted: names.length }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const env = process.env as SpotifyEnv
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
    res.status(500).json({ error: 'Spotify is not configured on the server.' })
    return
  }

  try {
    const { music, failed, attempted } = await loadMusic(env)
    if (failed === attempted) throw new Error('Every Spotify section failed')

    const maxAge = showNowPlaying(env) ? 30 : 60
    res.setHeader('Cache-Control', `s-maxage=${maxAge}, stale-while-revalidate=300`)
    res.status(200).json(music)
  } catch (error) {
    console.error('Spotify request failed', error)
    res.status(502).json({ error: 'Failed to load music data.' })
  }
}
