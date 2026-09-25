import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler, {
  getAccessToken,
  loadMusic,
  normalizeNowPlaying,
  normalizeTrack,
  ownPublicPlaylists,
  pickImage,
  resetSpotifyCache,
  SpotifyError,
  type RawPlaylist,
  type SpotifyEnv,
} from './spotify'

const ENV: SpotifyEnv = {
  SPOTIFY_CLIENT_ID: 'client-id',
  SPOTIFY_CLIENT_SECRET: 'client-secret',
  SPOTIFY_REFRESH_TOKEN: 'refresh-token',
}

const USER_ID = 'owner-user-id'
const ACCESS_TOKEN = 'access-token-123'

const art = [
  { url: 'https://i.scdn.co/640', width: 640, height: 640 },
  { url: 'https://i.scdn.co/300', width: 300, height: 300 },
  { url: 'https://i.scdn.co/64', width: 64, height: 64 },
]

const track = (name: string) => ({
  name,
  artists: [{ name: 'Artist A' }, { name: 'Artist B' }],
  album: { images: art },
  external_urls: { spotify: `https://open.spotify.com/track/${name}` },
})
const item = (name: string, kind: string) => ({
  name,
  images: art,
  external_urls: { spotify: `https://open.spotify.com/${kind}/${name}` },
})
const playlist = (name: string, overrides: Partial<RawPlaylist> = {}): RawPlaylist => ({
  ...item(name, 'playlist'),
  public: true,
  collaborative: false,
  owner: { id: USER_ID },
  ...overrides,
})

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

type Route = (url: URL, init?: RequestInit) => Response | Promise<Response>

// Routes fetch calls by URL path; any unmatched call fails the test.
function mockFetch(overrides: Record<string, Route> = {}) {
  const routes: Record<string, Route> = {
    '/api/token': () => json({ access_token: ACCESS_TOKEN, expires_in: 3600, token_type: 'Bearer' }),
    '/v1/me': () => json({ id: USER_ID, display_name: 'Me', email: 'me@example.com' }),
    '/v1/me/player/recently-played': () =>
      json({ items: [{ track: track('recent'), played_at: '2026-09-25T10:00:00.000Z' }], next: null }),
    '/v1/me/top/tracks': (url) => json({ items: [track(`top-${url.searchParams.get('time_range')}`)], next: null }),
    '/v1/me/top/artists': (url) =>
      json({ items: [item(`artist-${url.searchParams.get('time_range')}`, 'artist')], next: null }),
    '/v1/me/playlists': () =>
      json({
        items: [
          playlist('mine'),
          playlist('private', { public: false }),
          playlist('followed', { owner: { id: 'someone-else' } }),
        ],
        next: null,
      }),
    '/v1/me/shows': () => json({ items: [{ show: item('show', 'show') }], next: null }),
    '/v1/me/player/currently-playing': () => new Response(null, { status: 204 }),
    ...overrides,
  }
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
    const route = routes[url.pathname]
    if (!route) throw new Error(`Unexpected fetch: ${url.href}`)
    return route(url, init)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function fakeRes() {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    setHeader(name: string, value: string) {
      res.headers[name] = value
      return res
    },
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.body = body
      return res
    },
  }
  return res
}

async function callHandler(env: SpotifyEnv = ENV) {
  vi.stubEnv('SPOTIFY_CLIENT_ID', env.SPOTIFY_CLIENT_ID ?? '')
  vi.stubEnv('SPOTIFY_CLIENT_SECRET', env.SPOTIFY_CLIENT_SECRET ?? '')
  vi.stubEnv('SPOTIFY_REFRESH_TOKEN', env.SPOTIFY_REFRESH_TOKEN ?? '')
  vi.stubEnv('SPOTIFY_SHOW_NOW_PLAYING', env.SPOTIFY_SHOW_NOW_PLAYING ?? '')
  const res = fakeRes()
  await handler({ method: 'GET' } as never, res as never)
  return res
}

beforeEach(() => {
  resetSpotifyCache()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('getAccessToken', () => {
  it('exchanges the refresh token with Basic client credentials', async () => {
    const fetchMock = mockFetch()
    expect(await getAccessToken(ENV, 0)).toBe(ACCESS_TOKEN)

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('https://accounts.spotify.com/api/token')
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      `Basic ${Buffer.from('client-id:client-secret').toString('base64')}`,
    )
    const body = new URLSearchParams(String(init?.body))
    expect(body.get('grant_type')).toBe('refresh_token')
    expect(body.get('refresh_token')).toBe('refresh-token')
  })

  it('caches the token until shortly before it expires', async () => {
    const fetchMock = mockFetch()
    await getAccessToken(ENV, 0)
    await getAccessToken(ENV, 3_000_000) // 50 min in: still cached
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await getAccessToken(ENV, 3_560_000) // inside the 60s margin: refreshed
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws a SpotifyError with the reason when the refresh fails', async () => {
    mockFetch({ '/api/token': () => json({ error: 'invalid_grant' }, 400) })
    await expect(getAccessToken(ENV, 0)).rejects.toEqual(new SpotifyError(400, 'invalid_grant'))
  })
})

describe('normalization', () => {
  it('picks the smallest image at least the requested width', () => {
    expect(pickImage(art, 96)).toBe('https://i.scdn.co/300')
    expect(pickImage(art, 400)).toBe('https://i.scdn.co/640')
    expect(pickImage(art, 1000)).toBe('https://i.scdn.co/640')
    expect(pickImage([{ url: 'https://mosaic', width: null, height: null }], 240)).toBe('https://mosaic')
    expect(pickImage([], 96)).toBeNull()
    expect(pickImage(null, 96)).toBeNull()
  })

  it('keeps only name, joined artists, art, and link for a track', () => {
    expect(normalizeTrack({ ...track('song'), id: 'x', popularity: 9 } as never)).toEqual({
      name: 'song',
      artists: 'Artist A, Artist B',
      imageUrl: 'https://i.scdn.co/300',
      spotifyUrl: 'https://open.spotify.com/track/song',
    })
  })

  it('normalizes a playing track or episode, and skips paused, ads, and empty', () => {
    expect(
      normalizeNowPlaying({ is_playing: true, currently_playing_type: 'track', item: track('now') }),
    ).toMatchObject({ type: 'track', name: 'now', imageUrl: 'https://i.scdn.co/300' })
    expect(
      normalizeNowPlaying({
        is_playing: true,
        currently_playing_type: 'episode',
        item: {
          type: 'episode',
          name: 'Episode 1',
          images: [],
          show: { name: 'The Show', images: art },
          external_urls: { spotify: 'https://open.spotify.com/episode/1' },
        },
      }),
    ).toEqual({
      type: 'episode',
      name: 'Episode 1',
      artists: 'The Show',
      imageUrl: 'https://i.scdn.co/300',
      spotifyUrl: 'https://open.spotify.com/episode/1',
    })
    expect(normalizeNowPlaying({ is_playing: false, currently_playing_type: 'track', item: track('x') })).toBeUndefined()
    expect(normalizeNowPlaying({ is_playing: true, currently_playing_type: 'ad', item: null })).toBeUndefined()
    expect(normalizeNowPlaying(null)).toBeUndefined()
  })

  it('keeps only public playlists the account owns', () => {
    const kept = ownPublicPlaylists(
      [
        playlist('mine'),
        playlist('private', { public: false }),
        playlist('unknown visibility', { public: null }),
        playlist('followed', { owner: { id: 'someone-else' } }),
        playlist('collaborative', { collaborative: true }),
        null,
      ],
      USER_ID,
    )
    expect(kept.map((entry) => entry.name)).toEqual(['mine'])
  })
})

describe('loadMusic', () => {
  it('returns every section, normalized, with no tokens, ids, or email', async () => {
    mockFetch()
    const { music, failed } = await loadMusic(ENV)

    expect(failed).toBe(0)
    expect(music).toEqual({
      recentlyPlayed: [
        {
          name: 'recent',
          artists: 'Artist A, Artist B',
          imageUrl: 'https://i.scdn.co/300',
          spotifyUrl: 'https://open.spotify.com/track/recent',
          playedAt: '2026-09-25T10:00:00.000Z',
        },
      ],
      topTracks: {
        shortTerm: [expect.objectContaining({ name: 'top-short_term' })],
        mediumTerm: [expect.objectContaining({ name: 'top-medium_term' })],
      },
      topArtists: {
        shortTerm: [{ name: 'artist-short_term', imageUrl: 'https://i.scdn.co/300', spotifyUrl: 'https://open.spotify.com/artist/artist-short_term' }],
        mediumTerm: [expect.objectContaining({ name: 'artist-medium_term' })],
      },
      playlists: [{ name: 'mine', imageUrl: 'https://i.scdn.co/300', spotifyUrl: 'https://open.spotify.com/playlist/mine' }],
      podcasts: [{ name: 'show', imageUrl: 'https://i.scdn.co/300', spotifyUrl: 'https://open.spotify.com/show/show' }],
    })

    const serialized = JSON.stringify(music)
    for (const secret of [ACCESS_TOKEN, 'refresh-token', 'client-secret', USER_ID, 'me@example.com']) {
      expect(serialized).not.toContain(secret)
    }
  })

  it('sends the access token as a Bearer header', async () => {
    const fetchMock = mockFetch()
    await loadMusic(ENV)
    const apiCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/v1/me/shows'))
    expect((apiCall?.[1]?.headers as Record<string, string>).Authorization).toBe(`Bearer ${ACCESS_TOKEN}`)
  })

  it('follows playlist pagination', async () => {
    mockFetch({
      '/v1/me/playlists': (url) =>
        url.searchParams.get('offset') === '50'
          ? json({ items: [playlist('page two')], next: null })
          : json({ items: [playlist('page one')], next: 'https://api.spotify.com/v1/me/playlists?limit=50&offset=50' }),
    })
    const { music } = await loadMusic(ENV)
    expect(music.playlists?.map((entry) => entry.name)).toEqual(['page one', 'page two'])
  })

  it('omits only the failed sections and logs them', async () => {
    mockFetch({
      '/v1/me/top/tracks': (url) =>
        url.searchParams.get('time_range') === 'short_term'
          ? json({ error: { status: 429, message: 'Too many requests', reason: 'QUOTA_EXCEEDED' } }, 429)
          : json({ items: [track('top-medium_term')], next: null }),
      '/v1/me/shows': () => json({ error: { status: 403, message: 'Forbidden' } }, 403),
      '/v1/me/player/recently-played': () => {
        throw new TypeError('fetch failed')
      },
    })
    const { music, failed } = await loadMusic(ENV)

    expect(failed).toBe(3)
    expect(music.recentlyPlayed).toBeUndefined()
    expect(music.podcasts).toBeUndefined()
    expect(music.topTracks).toEqual({ mediumTerm: [expect.objectContaining({ name: 'top-medium_term' })] })
    expect(music.topArtists?.shortTerm).toHaveLength(1)
    expect(music.playlists).toHaveLength(1)
    expect(console.error).toHaveBeenCalledWith(
      'Spotify section "topTracks.shortTerm" failed',
      new SpotifyError(429, 'QUOTA_EXCEEDED'),
    )
  })

  it('drops playlists when the user id lookup fails', async () => {
    mockFetch({ '/v1/me': () => json({ error: { status: 500, message: 'oops' } }, 500) })
    const { music, failed } = await loadMusic(ENV)
    expect(failed).toBe(1)
    expect(music.playlists).toBeUndefined()
    expect(music.podcasts).toHaveLength(1)
  })

  it('skips now playing unless SPOTIFY_SHOW_NOW_PLAYING is "true"', async () => {
    const fetchMock = mockFetch({
      '/v1/me/player/currently-playing': () =>
        json({ is_playing: true, currently_playing_type: 'track', item: track('now') }),
    })
    expect((await loadMusic(ENV)).music.nowPlaying).toBeUndefined()
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('currently-playing'))).toBe(false)

    const { music } = await loadMusic({ ...ENV, SPOTIFY_SHOW_NOW_PLAYING: 'true' })
    expect(music.nowPlaying).toMatchObject({ type: 'track', name: 'now' })
  })

  it('omits now playing when nothing is playing (204)', async () => {
    mockFetch()
    const { music, failed } = await loadMusic({ ...ENV, SPOTIFY_SHOW_NOW_PLAYING: 'true' })
    expect(failed).toBe(0)
    expect('nowPlaying' in music).toBe(false)
  })
})

describe('handler', () => {
  it('returns 200 with a 60s shared cache by default', async () => {
    mockFetch()
    const res = await callHandler()
    expect(res.statusCode).toBe(200)
    expect(res.headers['Cache-Control']).toBe('s-maxage=60, stale-while-revalidate=300')
    expect(res.body).toHaveProperty('playlists')
  })

  it('shortens the cache to 30s when now playing is enabled', async () => {
    mockFetch()
    const res = await callHandler({ ...ENV, SPOTIFY_SHOW_NOW_PLAYING: 'true' })
    expect(res.headers['Cache-Control']).toBe('s-maxage=30, stale-while-revalidate=300')
  })

  it('still returns 200 with the remaining sections on partial failure', async () => {
    mockFetch({ '/v1/me/shows': () => json({}, 500) })
    const res = await callHandler()
    expect(res.statusCode).toBe(200)
    expect(res.body).not.toHaveProperty('podcasts')
    expect(res.body).toHaveProperty('recentlyPlayed')
  })

  it('returns 502 without caching when the token refresh fails', async () => {
    mockFetch({ '/api/token': () => json({ error: 'invalid_grant' }, 400) })
    const res = await callHandler()
    expect(res.statusCode).toBe(502)
    expect(res.headers['Cache-Control']).toBeUndefined()
    expect(res.body).toEqual({ error: 'Failed to load music data.' })
  })

  it('returns 502 when every section fails', async () => {
    mockFetch(
      Object.fromEntries(
        ['/v1/me', '/v1/me/player/recently-played', '/v1/me/top/tracks', '/v1/me/top/artists', '/v1/me/playlists', '/v1/me/shows'].map(
          (path) => [path, () => json({}, 503)],
        ),
      ),
    )
    const res = await callHandler()
    expect(res.statusCode).toBe(502)
  })

  it('returns 500 when Spotify is not configured', async () => {
    const fetchMock = mockFetch()
    const res = await callHandler({ ...ENV, SPOTIFY_REFRESH_TOKEN: '' })
    expect(res.statusCode).toBe(500)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
