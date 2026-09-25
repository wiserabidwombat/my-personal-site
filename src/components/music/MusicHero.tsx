import { compactHero } from '../../lib/styles'

// Page heading with the Spotify credit and logo. Spotify's branding
// guidelines require content from Spotify to be attributed with the full
// logo (icon + wordmark): at least 70px wide, white on dark backgrounds and
// black on light ones, never inside a sentence, with clear space of half
// the icon's height around it. Both colors are mounted and swapped by the
// same data-theme classes as the navbar's theme icons.
export function MusicHero() {
  return (
    <section className={compactHero}>
      <div className="relative z-10">
        <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">Music</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
          What I'm Listening To
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-300">
          What's on repeat lately, the playlists I've made, and the podcasts I follow.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Data from{' '}
          <a
            href="https://www.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 underline underline-offset-2 hover:text-[var(--laser-cyan)]"
          >
            Spotify
          </a>
        </p>
        <div className="mt-5 flex justify-center">
          <img src="/music/spotify-logo-white.svg" alt="Spotify" className="theme-dark-only h-7 w-auto" />
          <img src="/music/spotify-logo-black.svg" alt="Spotify" className="theme-light-only h-7 w-auto" />
        </div>
      </div>
    </section>
  )
}
