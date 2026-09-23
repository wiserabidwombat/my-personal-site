import { pageTitle } from './title'

export const SITE_URL = 'https://aarontilley.me'
const SITE_NAME = 'Aaron Tilley'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

type SeoOptions = {
  // Page name passed through pageTitle() for the "X | Aaron Tilley" format;
  // omit for the home page, matching pageTitle()'s own convention.
  title?: string
  description: string
  // Path starting with "/" (e.g. "/about", "/blog/my-post") used to build
  // the absolute canonical og:url.
  path: string
  // Absolute URL; defaults to the site-wide social preview image.
  image?: string
  type?: 'website' | 'article'
}

// Builds the full set of standard/OpenGraph/Twitter Card meta tags for a
// route's head(). TanStack Router merges meta by `name`/`property` across
// the matched route chain, with the most specific (leaf) route's entry
// winning -- so the root route's call to this same helper (for path "/")
// acts as the site-wide fallback for any tag a page doesn't override.
export function seoMeta({ title, description, path, image = DEFAULT_OG_IMAGE, type = 'website' }: SeoOptions) {
  const resolvedTitle = pageTitle(title)
  const url = `${SITE_URL}${path}`

  return [
    { title: resolvedTitle },
    { name: 'description', content: description },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:title', content: resolvedTitle },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: resolvedTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ]
}

// Builds a route's canonical <link>, reusing SITE_URL so every absolute-URL
// builder in this file stays anchored to the one apex domain. Every leaf
// route calls this with the same path it already passes to seoMeta() (see
// each route's head() in src/routes/*.tsx); the root route deliberately does
// NOT call this, since TanStack Router's dedup behavior for `links` (unlike
// `meta`, which it explicitly merges/overrides by name) isn't confirmed --
// each leaf route supplying its own is the only way to guarantee exactly one
// canonical tag per page rather than risking two.
export function canonicalLink(path: string): { rel: 'canonical'; href: string } {
  return { rel: 'canonical', href: `${SITE_URL}${path}` }
}
