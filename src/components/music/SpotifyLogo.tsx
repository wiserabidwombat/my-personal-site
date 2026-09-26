import { cn } from 'cn'

// Spotify's full logo (icon + wordmark), required by its branding guidelines
// wherever Spotify content appears: at least 70px wide (h-5 renders
// 73-82px), white on dark backgrounds and black on light ones, never inline
// with text, with clear space of half the icon's height around it. Both
// colors are mounted and swapped by the same data-theme classes as the
// navbar's theme icons.
export function SpotifyLogo({ className }: { className?: string }) {
  return (
    <>
      <img src="/music/spotify-logo-white.svg" alt="Spotify" className={cn('theme-dark-only w-auto', className)} />
      <img src="/music/spotify-logo-black.svg" alt="Spotify" className={cn('theme-light-only w-auto', className)} />
    </>
  )
}
