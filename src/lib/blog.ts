import matter from 'gray-matter'
import type { BlogPost } from '../types/blog-post'

const REQUIRED_FIELDS = ['title', 'slug', 'image', 'blurb', 'date'] as const

function parsePost(raw: string, filePath: string): BlogPost {
  const { data, content } = matter(raw)

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new Error(`Blog post "${filePath}" is missing required frontmatter field "${field}"`)
    }
    if (typeof data[field] !== 'string') {
      if (field === 'date') {
        throw new Error(
          `Blog post "${filePath}" has a "date" field that isn't a string — did you forget to quote it in the frontmatter (e.g. date: "2026-01-01")?`,
        )
      }
      throw new Error(
        `Blog post "${filePath}" has a "${field}" field that isn't a string (got ${typeof data[field]})`,
      )
    }
  }

  if (data.ogImage !== undefined && typeof data.ogImage !== 'string') {
    throw new Error(`Blog post "${filePath}" has an "ogImage" field that isn't a string`)
  }

  if (
    data.tags !== undefined &&
    (!Array.isArray(data.tags) || data.tags.some((tag: unknown) => typeof tag !== 'string'))
  ) {
    throw new Error(`Blog post "${filePath}" has a "tags" field that isn't an array of strings`)
  }

  return {
    title: data.title,
    slug: data.slug,
    image: data.image,
    ogImage: data.ogImage,
    blurb: data.blurb,
    date: data.date,
    author: data.author,
    tags: data.tags ?? [],
    body: content.trim(),
  }
}

export function buildPostsFromRaw(rawModules: Record<string, string>): BlogPost[] {
  const posts = Object.entries(rawModules).map(([filePath, raw]) => parsePost(raw, filePath))

  const seenSlugs = new Set<string>()
  for (const post of posts) {
    if (seenSlugs.has(post.slug)) {
      throw new Error(`Duplicate blog post slug "${post.slug}"`)
    }
    seenSlugs.add(post.slug)
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function findPostBySlug(posts: BlogPost[], slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug)
}

export function collectTags(posts: BlogPost[]): string[] {
  const tagSet = new Set<string>()
  for (const post of posts) {
    post.tags.forEach((tag) => tagSet.add(tag))
  }
  return [...tagSet].sort()
}

const rawModules = import.meta.glob('/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

let cachedPosts: BlogPost[] | null = null

function loadPosts(): BlogPost[] {
  if (!cachedPosts) {
    cachedPosts = buildPostsFromRaw(rawModules)
  }
  return cachedPosts
}

export function getAllPosts(): BlogPost[] {
  return loadPosts()
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return findPostBySlug(loadPosts(), slug)
}

export function getAllTags(): string[] {
  return collectTags(loadPosts())
}

// Display labels for tag slugs. Slugs (frontmatter values, ?tag= URLs) stay
// as-is; only what's rendered changes. Tags not listed here are title-cased
// word by word ("design-systems" -> "Design Systems").
const TAG_LABELS: Record<string, string> = {
  ai: 'AI',
  boardgames: 'Board Games',
}

export function tagLabel(tag: string): string {
  return (
    TAG_LABELS[tag] ??
    tag
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ')
  )
}

// Link-preview (og:image / twitter:image) path for a post, or undefined to
// fall back to the site-wide default image. LinkedIn, Facebook, and X don't
// render SVG previews, so an SVG is never returned: the card image is used
// only when it's already raster, and an SVG-illustrated post needs a raster
// `ogImage` in its frontmatter (1200x630) to get its own preview.
export function postOgImagePath(post: Pick<BlogPost, 'image' | 'ogImage'>): string | undefined {
  const candidate = post.ogImage ?? post.image
  return /\.svg$/i.test(candidate) ? undefined : candidate
}

const WORDS_PER_MINUTE = 225

export function readingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

// Fixed en-US locale (not the visitor's) so the prerendered HTML and the
// client render always agree -- "Aug 14, 2026".
export function formatPostDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}
