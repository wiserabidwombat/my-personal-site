import { describe, expect, it } from 'vitest'
import {
  buildPostsFromRaw,
  collectTags,
  findPostBySlug,
  formatPostDate,
  getAllPosts,
  getAllTags,
  getPostBySlug,
  postOgImagePath,
  readingMinutes,
  tagLabel,
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

describe('tagLabel', () => {
  it('uses the override for acronyms and joined words', () => {
    expect(tagLabel('ai')).toBe('AI')
    expect(tagLabel('boardgames')).toBe('Board Games')
  })

  it('title-cases other tags word by word', () => {
    expect(tagLabel('leadership')).toBe('Leadership')
    expect(tagLabel('design-systems')).toBe('Design Systems')
  })
})

describe('readingMinutes', () => {
  it('rounds up at 225 words per minute', () => {
    expect(readingMinutes(Array(225).fill('word').join(' '))).toBe(1)
    expect(readingMinutes(Array(226).fill('word').join(' '))).toBe(2)
  })

  it('never reports less than one minute', () => {
    expect(readingMinutes('')).toBe(1)
  })
})

describe('formatPostDate', () => {
  it('formats in en-US with a short month, independent of time zone', () => {
    expect(formatPostDate('2026-08-14')).toBe('Aug 14, 2026')
  })

  it('returns unparseable input unchanged', () => {
    expect(formatPostDate('someday')).toBe('someday')
  })
})

describe('postOgImagePath', () => {
  it('prefers ogImage over the card image', () => {
    expect(postOgImagePath({ image: '/blog/art.svg', ogImage: '/blog/art.png' })).toBe('/blog/art.png')
  })

  it('uses a raster card image when there is no ogImage', () => {
    expect(postOgImagePath({ image: '/blog/photo.jpg' })).toBe('/blog/photo.jpg')
  })

  it('never returns an SVG, falling back to the site default instead', () => {
    expect(postOgImagePath({ image: '/blog/art.svg' })).toBeUndefined()
    expect(postOgImagePath({ image: '/blog/a.png', ogImage: '/blog/b.SVG' })).toBeUndefined()
  })
})

describe('ogImage frontmatter', () => {
  it('is parsed when present', () => {
    const [post] = buildPostsFromRaw({
      '/content/blog/og.md': `---
title: OG Post
slug: og-post
image: /blog/og.svg
ogImage: /blog/og.png
blurb: Has a preview image.
date: "2026-01-01"
---
Body.
`,
    })
    expect(post.ogImage).toBe('/blog/og.png')
  })

  it('every seed post has its own raster preview image', () => {
    for (const post of getAllPosts()) {
      expect(postOgImagePath(post), post.slug).toMatch(/\.(png|jpe?g)$/)
    }
  })
})
