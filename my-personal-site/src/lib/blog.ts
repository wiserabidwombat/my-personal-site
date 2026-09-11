import matter from 'gray-matter'
import type { BlogPost } from '../types/blog-post'

const REQUIRED_FIELDS = ['title', 'slug', 'image', 'blurb', 'date'] as const

function parsePost(raw: string, filePath: string): BlogPost {
  const { data, content } = matter(raw)

  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      throw new Error(`Blog post "${filePath}" is missing required frontmatter field "${field}"`)
    }
  }

  return {
    title: data.title,
    slug: data.slug,
    image: data.image,
    blurb: data.blurb,
    date: data.date,
    author: data.author,
    tags: data.tags,
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
    post.tags?.forEach((tag) => tagSet.add(tag))
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
