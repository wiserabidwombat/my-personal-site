import { describe, expect, it } from 'vitest'
import type { BlogPost } from '../../types/blog-post'
import { emptyBlogFilters, filterBlogPosts } from './blogFilters'

function makePost(overrides: Partial<BlogPost>): BlogPost {
  return {
    title: 'Untitled Post',
    slug: overrides.slug ?? 'untitled-post',
    image: '/blog/placeholder.svg',
    blurb: 'A blurb.',
    date: '2026-01-01',
    tags: [],
    body: 'Body.',
    ...overrides,
  }
}

const aiPost = makePost({
  slug: 'ai-post',
  title: 'Teaching an AI Agent',
  blurb: 'Notes on prompt-driven workflows.',
  tags: ['coding', 'ai'],
})
const boardGamePost = makePost({
  slug: 'boardgame-post',
  title: 'What Board Games Taught Me',
  blurb: 'Turn order and hidden information.',
  tags: ['leadership', 'teams', 'boardgames'],
})
const untaggedPost = makePost({
  slug: 'untagged-post',
  title: 'A Plain Post',
  blurb: 'Nothing special here.',
  tags: [],
})

const library = [aiPost, boardGamePost, untaggedPost]

describe('filterBlogPosts', () => {
  it('returns every post when no filters are active', () => {
    expect(filterBlogPosts(library, emptyBlogFilters)).toEqual(library)
  })

  it('combines multiple selected tags with OR logic, not AND', () => {
    // 'ai' only matches aiPost, 'boardgames' only matches boardGamePost --
    // an OR match returns both, an AND match would return neither.
    const result = filterBlogPosts(library, { ...emptyBlogFilters, tags: ['ai', 'boardgames'] })
    expect(result).toEqual([aiPost, boardGamePost])
  })

  it('matches a post that has at least one of the selected tags', () => {
    const result = filterBlogPosts(library, { ...emptyBlogFilters, tags: ['leadership'] })
    expect(result).toEqual([boardGamePost])
  })

  it('never matches a post with no tags when a tag filter is active', () => {
    const result = filterBlogPosts(library, { ...emptyBlogFilters, tags: ['ai'] })
    expect(result.some((post) => post.slug === 'untagged-post')).toBe(false)
  })

  it('matches search text against title and blurb, case-insensitively', () => {
    const byTitle = filterBlogPosts(library, { ...emptyBlogFilters, search: 'board games' })
    expect(byTitle).toEqual([boardGamePost])

    const byBlurb = filterBlogPosts(library, { ...emptyBlogFilters, search: 'HIDDEN INFORMATION' })
    expect(byBlurb).toEqual([boardGamePost])
  })

  it('combines search and tags with AND logic', () => {
    // Matches the 'ai' tag but the search text only appears in boardGamePost.
    const result = filterBlogPosts(library, {
      tags: ['ai', 'leadership'],
      search: 'turn order',
    })
    expect(result).toEqual([boardGamePost])
  })

  it('returns an empty array when nothing matches', () => {
    const result = filterBlogPosts(library, { ...emptyBlogFilters, tags: ['does-not-exist'] })
    expect(result).toEqual([])
  })
})
