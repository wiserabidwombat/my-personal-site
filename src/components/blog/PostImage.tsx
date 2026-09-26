import { useId } from 'react'
import { cn } from 'cn'

// Blog art SVGs in public/blog, as raw markup. Their colors are the site's
// theme tokens (CSS variables with the default palette as fallback), and CSS
// variables only reach an SVG that's in the page -- not one loaded through
// <img> -- so these are rendered inline to follow light/dark mode and the
// Halloween theme. Any other image (PNG, JPG, an unknown SVG) still uses
// <img>.
const inlineArt = import.meta.glob<string>('../../../public/blog/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function inlineSvgFor(src: string): string | undefined {
  const match = /^\/blog\/([^/]+\.svg)$/i.exec(src)
  return match ? inlineArt[`../../../public/blog/${match[1]}`] : undefined
}

// Gradient ids are document-wide, so give each inline copy its own suffix --
// two copies of the same art on one page would otherwise share (and could
// break) each other's url(#id) references.
function withUniqueIds(svg: string, suffix: string): string {
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
  return ids.reduce(
    (markup, id) => markup.replaceAll(`id="${id}"`, `id="${id}-${suffix}"`).replaceAll(`url(#${id})`, `url(#${id}-${suffix})`),
    svg,
  )
}

type Props = {
  src: string
  // Empty for decorative art (the title is right beside it).
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
}

export function PostImage({ src, alt, className, loading = 'lazy' }: Props) {
  const suffix = useId().replace(/[^a-zA-Z0-9]/g, '')
  const svg = inlineSvgFor(src)

  if (!svg) return <img src={src} alt={alt} loading={loading} className={className} />

  return (
    <div
      className={cn('overflow-hidden [&>svg]:block [&>svg]:h-full [&>svg]:w-full', className)}
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      dangerouslySetInnerHTML={{ __html: withUniqueIds(svg, suffix) }}
    />
  )
}
