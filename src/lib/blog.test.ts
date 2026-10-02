import { existsSync } from 'node:fs'
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

  it('reads an optional update note, and rejects one that is not a string', () => {
    const post = (update: string) => ({
      '/content/blog/updated.md': `---
title: Updated Post
slug: updated-post
image: /blog/updated.svg
blurb: A post with an update note.
date: "2026-01-01"
${update}
---
Body.
`,
    })

    expect(buildPostsFromRaw(post('update: "Update, March 2026: fixed."'))[0].update).toBe('Update, March 2026: fixed.')
    expect(buildPostsFromRaw(post(''))[0].update).toBeUndefined()
    expect(() => buildPostsFromRaw(post('update: 2026'))).toThrow(/update/)
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

// The real posts in content/blog. These check how the loader treats
// whatever posts exist, so adding a post never means editing this file.
describe('real content', () => {
  const posts = getAllPosts()

  it('loads at least one post', () => {
    expect(posts.length).toBeGreaterThan(0)
  })

  it('sorts posts newest first', () => {
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].date >= posts[i].date, `${posts[i - 1].slug} before ${posts[i].slug}`).toBe(true)
    }
  })

  it('gives every post a unique slug', () => {
    const slugs = posts.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('finds every post by its slug, and nothing for an unknown slug', () => {
    for (const post of posts) expect(getPostBySlug(post.slug), post.slug).toBe(post)
    expect(getPostBySlug('does-not-exist')).toBeUndefined()
  })

  it('finds a known post by slug', () => {
    expect(getPostBySlug('what-board-games-taught-me-about-leading-a-team')?.title).toBe(
      'What Board Games Taught Me About Leading a Team',
    )
  })

  it("collects every post's tags, deduped and sorted", () => {
    const tags = getAllTags()
    expect(tags).toEqual([...new Set(posts.flatMap((post) => post.tags))].sort())
    expect(new Set(tags).size).toBe(tags.length)
    expect(tags).toEqual([...tags].sort())
  })

  it('points every post at images that exist in public/', () => {
    for (const post of posts) {
      for (const image of [post.image, post.ogImage]) {
        if (image) expect(existsSync(`public${image}`), `${post.slug}: ${image}`).toBe(true)
      }
    }
  })
})

describe('tagLabel', () => {
  it('uses the override for acronyms and joined words', () => {
    expect(tagLabel('ai')).toBe('AI')
    expect(tagLabel('boardgames')).toBe('Board Games')
    expect(tagLabel('ios')).toBe('iOS')
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

  it('every post has its own raster preview image', () => {
    for (const post of getAllPosts()) {
      expect(postOgImagePath(post), post.slug).toMatch(/\.(png|jpe?g)$/)
    }
  })
})
