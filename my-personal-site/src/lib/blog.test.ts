import { describe, expect, it } from 'vitest'
import {
  buildPostsFromRaw,
  collectTags,
  findPostBySlug,
  getAllPosts,
  getAllTags,
  getPostBySlug,
} from './blog'

describe('buildPostsFromRaw', () => {
  it('sorts posts by date, newest first', () => {
    const posts = buildPostsFromRaw({
      '/content/blog/old.md': `---
title: Old Post
slug: old-post
image: /blog/old.svg
blurb: An older post.
date: "2026-01-01"
---
Old body.
`,
      '/content/blog/new.md': `---
title: New Post
slug: new-post
image: /blog/new.svg
blurb: A newer post.
date: "2026-06-01"
---
New body.
`,
    })

    expect(posts.map((post) => post.slug)).toEqual(['new-post', 'old-post'])
  })

  it('throws when a required frontmatter field is missing', () => {
    const rawModules = {
      '/content/blog/broken.md': `---
title: Broken Post
slug: broken-post
image: /blog/broken.svg
date: "2026-01-01"
---
Missing a blurb.
`,
    }

    expect(() => buildPostsFromRaw(rawModules)).toThrow(/blurb/)
  })

  it('throws when the date field is an unquoted YAML date (parsed as a Date, not a string)', () => {
    const rawModules = {
      '/content/blog/unquoted-date.md': `---
title: Unquoted Date Post
slug: unquoted-date-post
image: /blog/unquoted-date.svg
blurb: A post with an unquoted date.
date: 2026-08-14
---
Body.
`,
    }

    expect(() => buildPostsFromRaw(rawModules)).toThrow(/date/i)
  })

  it('throws when tags is a scalar instead of a list', () => {
    const rawModules = {
      '/content/blog/scalar-tags.md': `---
title: Scalar Tags Post
slug: scalar-tags-post
image: /blog/scalar-tags.svg
blurb: A post with a scalar tags value.
date: "2026-01-01"
tags: coding
---
Body.
`,
    }

    expect(() => buildPostsFromRaw(rawModules)).toThrow(/tags/i)
  })

  it('throws on duplicate slugs', () => {
    const makePost = (title: string) => `---
title: ${title}
slug: duplicate-slug
image: /blog/dup.svg
blurb: A post.
date: "2026-01-01"
---
Body.
`

    const rawModules = {
      '/content/blog/a.md': makePost('First'),
      '/content/blog/b.md': makePost('Second'),
    }

    expect(() => buildPostsFromRaw(rawModules)).toThrow(/duplicate-slug/i)
  })
})

describe('findPostBySlug', () => {
  const posts = buildPostsFromRaw({
    '/content/blog/only.md': `---
title: Only Post
slug: only-post
image: /blog/only.svg
blurb: The only post.
date: "2026-01-01"
---
Body.
`,
  })

  it('returns the matching post', () => {
    expect(findPostBySlug(posts, 'only-post')?.title).toBe('Only Post')
  })

  it('returns undefined for an unknown slug', () => {
    expect(findPostBySlug(posts, 'does-not-exist')).toBeUndefined()
  })
})

describe('collectTags', () => {
  it('dedupes and sorts tags across posts, ignoring posts without tags', () => {
    const posts = buildPostsFromRaw({
      '/content/blog/tagged-a.md': `---
title: Tagged A
slug: tagged-a
image: /blog/a.svg
blurb: Has tags.
date: "2026-01-01"
tags: ["coding", "ai"]
---
Body.
`,
      '/content/blog/tagged-b.md': `---
title: Tagged B
slug: tagged-b
image: /blog/b.svg
blurb: Also has tags.
date: "2026-01-02"
tags: ["ai", "boardgames"]
---
Body.
`,
      '/content/blog/untagged.md': `---
title: Untagged
slug: untagged
image: /blog/c.svg
blurb: No tags here.
date: "2026-01-03"
---
Body.
`,
    })

    expect(collectTags(posts)).toEqual(['ai', 'boardgames', 'coding'])
  })
})

describe('getAllPosts (real seed content)', () => {
  it('returns both seed posts, newest first', () => {
    const posts = getAllPosts()
    expect(posts.map((post) => post.slug)).toEqual([
      'introducing-ai-agents-into-my-design-system',
      'what-board-games-taught-me-about-leading-a-team',
    ])
  })
})

describe('getPostBySlug (real seed content)', () => {
  it('finds a seeded post by slug', () => {
    expect(getPostBySlug('what-board-games-taught-me-about-leading-a-team')?.title).toBe(
      'What Board Games Taught Me About Leading a Team',
    )
  })

  it('returns undefined for an unknown slug', () => {
    expect(getPostBySlug('does-not-exist')).toBeUndefined()
  })
})

describe('getAllTags (real seed content)', () => {
  it('includes the tags from both seed posts, deduped and sorted', () => {
    expect(getAllTags()).toEqual(['ai', 'boardgames', 'coding', 'leadership', 'teams'])
  })
})
