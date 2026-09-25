// Mirrors the response of api/spotify.ts.

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

// Every section is optional: the API leaves out any section whose Spotify
// call failed, and the page hides whatever is missing.
export type MusicResponse = {
  nowPlaying?: NowPlaying
  recentlyPlayed?: RecentTrack[]
  topTracks?: TimeRanges<MusicTrack>
  topArtists?: TimeRanges<MusicItem>
  playlists?: MusicItem[]
  podcasts?: MusicItem[]
}
