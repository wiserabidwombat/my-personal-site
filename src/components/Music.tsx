import { cn } from 'cn'
import { Mic01Icon, PlaylistIcon } from '@hugeicons/core-free-icons'
import { useMusic } from '../hooks/useMusic'
import type { MusicResponse } from '../types/music'
import { pageContainer } from '../lib/styles'
import { CoverGrid } from './music/CoverGrid'
import { MusicHero } from './music/MusicHero'
import { MusicSkeleton } from './music/MusicSkeleton'
import { NowPlaying } from './music/NowPlaying'
import { RecentlyPlayed } from './music/RecentlyPlayed'
import { TopMusic } from './music/TopMusic'
import { availableRanges, isEmptyMusic } from './music/musicFormat'

function Notice({ children }: { children: string }) {
  return <p className={cn(pageContainer, 'py-10 text-slate-300')}>{children}</p>
}

// Each section renders only when its data is present: the API leaves out
// any section whose Spotify call failed.
export function Music() {
  const state = useMusic()

  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <MusicHero />
      {state.status === 'loading' && <MusicSkeleton />}
      {state.status === 'error' && (
        <Notice>Spotify isn't answering right now, so the music is taking a short break. Check back soon.</Notice>
      )}
      {state.status === 'ready' && <MusicSections music={state.music} />}
    </div>
  )
}

function MusicSections({ music }: { music: MusicResponse }) {
  if (isEmptyMusic(music)) return <Notice>Nothing to show here yet. Check back soon.</Notice>

  const ranges = availableRanges(music.topTracks, music.topArtists)

  return (
    <>
      {music.nowPlaying && <NowPlaying track={music.nowPlaying} />}
      {!!music.recentlyPlayed?.length && <RecentlyPlayed tracks={music.recentlyPlayed} />}
      {ranges.length > 0 && <TopMusic ranges={ranges} tracks={music.topTracks} artists={music.topArtists} />}
      {!!music.playlists?.length && (
        <CoverGrid icon={PlaylistIcon} title="Playlists" description="Playlists I've made." items={music.playlists} />
      )}
      {!!music.podcasts?.length && (
        <CoverGrid icon={Mic01Icon} title="Podcasts" description="Shows I follow." items={music.podcasts} />
      )}
    </>
  )
}
