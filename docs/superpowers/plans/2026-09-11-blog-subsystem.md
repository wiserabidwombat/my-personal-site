# Blog Subsystem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a markdown-driven blog to the personal site — a `/blog` listing page (responsive card grid with tag filtering) and a `/blog/$slug` article page, styled per the `synthwave-ui` skill.

**Architecture:** Markdown files with YAML frontmatter live in `content/blog/`, loaded entirely at build time via Vite's `import.meta.glob` and parsed client-side with `gray-matter` — no server code, no build script, no API route. TanStack Router file-based routing adds two new sibling routes (`/blog`, `/blog/$slug`); shadcn `Card`/`Badge`/`Button` primitives plus the existing synthwave CSS tokens provide the visual layer.

**Tech Stack:** React 19, Vite 8, TanStack Router 1.170 (file-based, `autoCodeSplitting`), Tailwind CSS 4, shadcn/ui (base-ui primitives), `gray-matter`, `react-markdown`, Vitest (new).

**Spec:** `docs/superpowers/specs/2026-09-11-blog-subsystem-design.md`

## Global Constraints

- All app code lives under `my-personal-site/` (repo root is `C:\repositories\my-personal-site`; app root is `C:\repositories\my-personal-site\my-personal-site`). Every path below is relative to the app root unless stated otherwise.
- No pagination, no search, no MDX in v1 (spec Non-goals). Tag filtering IS in scope (display + click-to-filter).
- No new API route and no prebuild script — content loads via `import.meta.glob` only (spec Approach A).
- Malformed frontmatter (missing required field) or a duplicate slug must throw at build/test time, not fail silently.
- Reuse existing synthwave tokens only (`--neon-pink`, `--laser-cyan`, `--cyber-purple`, `--glow-*`, `bg-synth-grid`, `shadow-glow-*`) — no new colors or effects.
- Follow the existing relative-import convention for `@/components/ui/*` (e.g. `'../../../@/components/ui/card'`) — do NOT use the `@/` TS path alias for these; it resolves to `src/*`, not the project-root `@/` folder, and no existing file uses it that way.
- `verbatimModuleSyntax` is on in `tsconfig.app.json` — type-only imports (e.g. `BlogPost`) MUST use `import type`.
- Date strings (`YYYY-MM-DD`) must be formatted with `timeZone: 'UTC'` in `toLocaleDateString` — this repo already fixed an off-by-one date bug in `CatalogLedger.tsx` by adding this; the same bug applies to blog post dates.
- New route files: `blog.tsx` (listing) and `blog_.$slug.tsx` (article) — the trailing underscore on `blog_` is required so the article route does NOT nest under the listing route as a layout child. This was verified empirically against the installed `@tanstack/router-plugin` (see spec).
- New dependencies allowed: `gray-matter`, `react-markdown` (runtime), `vitest` (dev). Nothing else — no `@tailwindcss/typography`, no testing-library, no MDX.
- Images referenced from frontmatter live in `public/blog/` and are plain path strings (e.g. `/blog/foo.svg`), not JS module imports.

---

### Task 1: BlogPost type and seed content

**Files:**
- Create: `my-personal-site/src/types/blog-post.ts`
- Create: `my-personal-site/content/blog/teaching-an-ai-agent-to-respect-my-design-system.md`
- Create: `my-personal-site/content/blog/what-board-games-taught-me-about-leading-a-team.md`
- Create: `my-personal-site/public/blog/ai-design-system.svg`
- Create: `my-personal-site/public/blog/board-games-leadership.svg`

**Interfaces:**
- Consumes: nothing.
- Produces: `BlogPost` type (used by every later task). Two known seed posts later tasks will assert against:
  - slug `teaching-an-ai-agent-to-respect-my-design-system`, date `2026-08-14`, tags `["coding", "ai"]`, author `Aaron Tilley`.
  - slug `what-board-games-taught-me-about-leading-a-team`, date `2026-07-02`, no tags, no author.

This task is pure data/type creation — no test framework is wired up yet (that happens in Task 2), so verification is a manual read-back.

- [ ] **Step 1: Create the `BlogPost` type**

```ts
// my-personal-site/src/types/blog-post.ts
export type BlogPost = {
  title: string
  slug: string
  image: string
  blurb: string
  date: string
  author?: string
  tags?: string[]
  body: string
}
```

- [ ] **Step 2: Create the first seed post (tags + author)**

```markdown
---
title: "Teaching an AI Agent to Respect My Design System"
slug: teaching-an-ai-agent-to-respect-my-design-system
image: /blog/ai-design-system.svg
blurb: "Notes from wiring prompt-driven workflows into a real component library without losing the plot."
date: "2026-08-14"
author: "Aaron Tilley"
tags: ["coding", "ai"]
---

I've spent the last few months folding AI-assisted development into my
day-to-day workflow, and the hardest problem hasn't been getting an
agent to write working code. It's been getting it to write code that
looks like *mine* — that respects the tokens, the component
conventions, and the fifty small decisions that make a design system
feel coherent instead of assembled.

## The problem with "just describe it"

Early on, I tried prompting an agent with plain-English descriptions
of the aesthetic: "neon, retro-future, dark backgrounds." It produced
technically correct Tailwind, but every component reinvented its own
shade of pink and its own idea of what a glow effect should look like.
The output worked. It just didn't belong.

## What actually worked

The fix wasn't a better prompt — it was giving the agent the same
thing I'd give a new engineer joining the project: the actual design
tokens, the existing component patterns to imitate, and explicit
permission to go read the code before writing any. Once the agent had
`--neon-pink`, `--laser-cyan`, and the `bg-synth-grid` utility in front
of it, along with a couple of real examples to pattern-match against,
the components it produced were indistinguishable from ones I'd
written by hand.

## The takeaway

Agents are excellent at consistency once you hand them something
consistent to be consistent *with*. The design system was never the
constraint — it was the missing context.
```

Save this file at `my-personal-site/content/blog/teaching-an-ai-agent-to-respect-my-design-system.md`.

- [ ] **Step 3: Create the second seed post (no tags, no author)**

```markdown
---
title: "What Board Games Taught Me About Leading a Team"
slug: what-board-games-taught-me-about-leading-a-team
image: /blog/board-games-leadership.svg
blurb: "Turn order, hidden information, and why the best engineering teams play more like co-op games."
date: "2026-07-02"
---

Somewhere between my third and fourth session of a heavy Euro-style
strategy game, I noticed I was thinking about our sprint planning the
same way I was thinking about turn order.

## Hidden information isn't a bug

In most board games, nobody has the full picture — you make the best
move you can with what you know, and the game is designed around that
constraint rather than against it. Engineering teams work the same
way. The lead who insists on knowing everything before any decision
gets made isn't being thorough; they're playing a different game than
the one that's actually in front of them. The teams I've enjoyed
leading most are the ones comfortable making a good-enough call today
and correcting course tomorrow.

## Turn order matters more than talent

A team of strong individual players in the wrong order still loses to
a team that understands sequencing. Who unblocks whom, who needs quiet
focus time versus who thrives in the middle of a discussion — that's
turn order. I spend more time thinking about sequencing work across
people than I do assigning it.

## Co-op beats competitive, every time

The best engineering teams I've been part of play like a co-op board
game: shared win condition, individual roles, and a default assumption
that if one person is stuck, the table stops to help. That's not a
metaphor I reach for lightly — it's the actual operating model I try
to build.
```

Save this file at `my-personal-site/content/blog/what-board-games-taught-me-about-leading-a-team.md`.

- [ ] **Step 4: Create the two placeholder featured images**

```svg
<!-- my-personal-site/public/blog/ai-design-system.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#150a24"/>
      <stop offset="100%" stop-color="#0a0612"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff2bd6"/>
      <stop offset="100%" stop-color="#00f0ff"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#bg)"/>
  <g stroke="#00f0ff" stroke-opacity="0.35" stroke-width="1">
    <line x1="0" y1="60" x2="640" y2="60"/>
    <line x1="0" y1="120" x2="640" y2="120"/>
    <line x1="0" y1="180" x2="640" y2="180"/>
    <line x1="0" y1="240" x2="640" y2="240"/>
    <line x1="0" y1="300" x2="640" y2="300"/>
    <line x1="107" y1="0" x2="107" y2="360"/>
    <line x1="214" y1="0" x2="214" y2="360"/>
    <line x1="321" y1="0" x2="321" y2="360"/>
    <line x1="428" y1="0" x2="428" y2="360"/>
    <line x1="535" y1="0" x2="535" y2="360"/>
  </g>
  <circle cx="320" cy="180" r="70" fill="none" stroke="url(#glow)" stroke-width="4"/>
  <circle cx="320" cy="180" r="30" fill="url(#glow)"/>
  <path d="M320 110 L320 40 M320 250 L320 320 M250 180 L180 180 M390 180 L460 180" stroke="url(#glow)" stroke-width="3" stroke-linecap="round"/>
</svg>
```

```svg
<!-- my-personal-site/public/blog/board-games-leadership.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#150a24"/>
      <stop offset="100%" stop-color="#0a0612"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#bg2)"/>
  <g fill="none" stroke="#8b2fe0" stroke-opacity="0.6" stroke-width="2">
    <polygon points="120,80 170,110 170,170 120,200 70,170 70,110"/>
    <polygon points="240,80 290,110 290,170 240,200 190,170 190,110"/>
    <polygon points="360,80 410,110 410,170 360,200 310,170 310,110"/>
    <polygon points="180,180 230,210 230,270 180,300 130,270 130,210"/>
    <polygon points="300,180 350,210 350,270 300,300 250,270 250,210"/>
  </g>
  <rect x="420" y="120" width="90" height="90" rx="16" fill="none" stroke="#ff2bd6" stroke-width="4"/>
  <circle cx="445" cy="145" r="6" fill="#ff2bd6"/>
  <circle cx="485" cy="145" r="6" fill="#ff2bd6"/>
  <circle cx="445" cy="185" r="6" fill="#ff2bd6"/>
  <circle cx="485" cy="185" r="6" fill="#ff2bd6"/>
  <circle cx="465" cy="165" r="6" fill="#ff2bd6"/>
</svg>
```

- [ ] **Step 5: Verify the files exist and frontmatter is well-formed YAML**

Run: `cd my-personal-site && ls content/blog public/blog`
Expected: both seed `.md` files and both `.svg` files listed.

Read each `.md` file back and confirm the frontmatter block (between the `---` markers) is valid YAML — every string value quoted or plain-scalar, `tags` a proper YAML list, no tab characters.

- [ ] **Step 6: Commit**

```bash
git add my-personal-site/src/types/blog-post.ts my-personal-site/content/blog my-personal-site/public/blog
git commit -m "$(cat <<'EOF'
Add BlogPost type and seed blog content

Two seed posts prove the frontmatter contract: one with tags and an
author, one with neither, so later tasks can rely on both fields
being genuinely optional.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `blog.ts` parsing/validation logic (TDD, with Vitest)

**Files:**
- Modify: `my-personal-site/package.json` (add `gray-matter`, add devDependency `vitest`, add `test` script)
- Create: `my-personal-site/vitest.config.ts`
- Create: `my-personal-site/src/lib/blog.ts`
- Create: `my-personal-site/src/lib/blog.test.ts`

**Interfaces:**
- Consumes: `BlogPost` type from `src/types/blog-post.ts` (Task 1).
- Produces (used by Task 3 and by these same tests):
  - `buildPostsFromRaw(rawModules: Record<string, string>): BlogPost[]` — parses, validates, sorts newest-first. Throws on missing required field or duplicate slug.
  - `findPostBySlug(posts: BlogPost[], slug: string): BlogPost | undefined`
  - `collectTags(posts: BlogPost[]): string[]` — deduped, sorted.

This repo has no test runner today, so this task also wires up Vitest — folded in here because it's scaffolding for this task's deliverable, not an independent one (nothing to test until there's logic to test).

- [ ] **Step 1: Install dependencies**

Run: `cd my-personal-site && npm install gray-matter && npm install -D vitest`

- [ ] **Step 2: Add the Vitest config**

```ts
// my-personal-site/vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Add the `test` script**

In `my-personal-site/package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 4: Write the failing tests**

```ts
// my-personal-site/src/lib/blog.test.ts
import { describe, expect, it } from 'vitest'
import { buildPostsFromRaw, collectTags, findPostBySlug } from './blog'

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
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `cd my-personal-site && npx vitest run src/lib/blog.test.ts`
Expected: FAIL — `blog.ts` does not exist yet (`Cannot find module './blog'`).

- [ ] **Step 6: Implement `blog.ts`'s pure logic**

```ts
// my-personal-site/src/lib/blog.ts
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
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd my-personal-site && npx vitest run src/lib/blog.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 8: Commit**

```bash
git add my-personal-site/package.json my-personal-site/package-lock.json my-personal-site/vitest.config.ts my-personal-site/src/lib/blog.ts my-personal-site/src/lib/blog.test.ts
git commit -m "$(cat <<'EOF'
Add blog.ts parsing/validation logic with Vitest coverage

buildPostsFromRaw/findPostBySlug/collectTags are pure functions over
raw markdown strings, so they're testable without touching the
filesystem. Also wires up Vitest, which this repo didn't have before.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `blog.ts` public API (`import.meta.glob`) + integration tests

**Files:**
- Modify: `my-personal-site/src/lib/blog.ts`
- Modify: `my-personal-site/src/lib/blog.test.ts`

**Interfaces:**
- Consumes: `buildPostsFromRaw`, `findPostBySlug`, `collectTags` (Task 2); the two real seed posts (Task 1).
- Produces (used by Task 6 and Task 7):
  - `getAllPosts(): BlogPost[]`
  - `getPostBySlug(slug: string): BlogPost | undefined`
  - `getAllTags(): string[]`

- [ ] **Step 1: Write the failing integration tests**

Append to `my-personal-site/src/lib/blog.test.ts`:

```ts
import { getAllPosts, getAllTags, getPostBySlug } from './blog'

describe('getAllPosts (real seed content)', () => {
  it('returns both seed posts, newest first', () => {
    const posts = getAllPosts()
    expect(posts.map((post) => post.slug)).toEqual([
      'teaching-an-ai-agent-to-respect-my-design-system',
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
  it('includes the tags from the tagged seed post', () => {
    expect(getAllTags()).toEqual(['ai', 'coding'])
  })
})
```

(Add this to the top-level `import` line already in the file rather than a second `import` statement if your editor auto-merges — either way, both `buildPostsFromRaw`-family and `getAllPosts`-family names must be imported from `./blog`.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd my-personal-site && npx vitest run src/lib/blog.test.ts`
Expected: FAIL — `getAllPosts`, `getPostBySlug`, `getAllTags` are not exported yet.

- [ ] **Step 3: Implement the glob-backed public API**

Append to `my-personal-site/src/lib/blog.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd my-personal-site && npx vitest run src/lib/blog.test.ts`
Expected: PASS — 8 tests total.

- [ ] **Step 5: Typecheck**

Run: `cd my-personal-site && npx tsc -b`
Expected: no errors. (`import.meta.glob('/content/blog/*.md', { query: '?raw', import: 'default', eager: true })` infers as `Record<string, string>` directly from Vite's `KnownQueryTypeMap['?raw'] = string` — no manual type cast needed. If TS reports a mismatch here, do not add an `as` cast; instead re-check that `query` and `import` are spelled exactly as above.)

- [ ] **Step 6: Commit**

```bash
git add my-personal-site/src/lib/blog.ts my-personal-site/src/lib/blog.test.ts
git commit -m "$(cat <<'EOF'
Add getAllPosts/getPostBySlug/getAllTags via import.meta.glob

Build-time content loading, no server round-trip: Vite inlines every
markdown file's raw text at bundle time, and the pure functions from
the previous commit do the parsing. Integration tests run against the
real seed posts to prove the wiring, not just the parsing logic.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `BlogCard` component

**Files:**
- Create: `my-personal-site/src/components/blog/BlogCard.tsx`

**Interfaces:**
- Consumes: `BlogPost` type (Task 1); `Card`/`CardHeader`/`CardTitle`/`CardDescription` from `@/components/ui/card`; `Badge` from `@/components/ui/badge`; TanStack `Link`.
- Produces (used by Task 5): `BlogCard` component, `Glow` type (`'pink' | 'cyan' | 'purple'`), both exported from `src/components/blog/BlogCard.tsx`. Props: `{ post: BlogPost; glow?: Glow }` (`glow` defaults to `'cyan'`).

No dedicated test framework covers UI components in this repo (see Global Constraints) — verification is `tsc -b` plus the end-to-end visual pass in Task 8.

- [ ] **Step 1: Write the component**

```tsx
// my-personal-site/src/components/blog/BlogCard.tsx
import { Link } from '@tanstack/react-router'
import { Badge } from '../../../@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '../../../@/components/ui/card'
import type { BlogPost } from '../../types/blog-post'

export type Glow = 'pink' | 'cyan' | 'purple'

const glowStyles: Record<Glow, { ring: string; shadow: string }> = {
  pink: { ring: 'ring-[var(--neon-pink)]/50', shadow: 'shadow-glow-pink' },
  cyan: { ring: 'ring-[var(--laser-cyan)]/50', shadow: 'shadow-glow-cyan' },
  purple: { ring: 'ring-[var(--cyber-purple)]/50', shadow: 'shadow-glow-purple' },
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

type Props = {
  post: BlogPost
  glow?: Glow
}

export function BlogCard({ post, glow = 'cyan' }: Props) {
  const style = glowStyles[glow]

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)]"
    >
      <Card
        className={`${style.ring} ${style.shadow} h-full bg-[var(--deep-space-purple)]/50 backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-1`}
      >
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="aspect-video w-full object-cover transition-[filter] duration-300 group-hover:brightness-110"
        />
        <CardHeader>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <CardTitle className="mt-1 text-base font-bold text-slate-50">{post.title}</CardTitle>
          <CardDescription className="line-clamp-3 text-slate-300">{post.blurb}</CardDescription>
          <p className="mt-2 text-xs font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author && <> &middot; {post.author}</>}
          </p>
        </CardHeader>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `cd my-personal-site && npx tsc -b`
Expected: no errors. (This component isn't imported anywhere yet, so `tsc` only proves it's internally well-typed — full wiring is checked in Task 6.)

- [ ] **Step 3: Commit**

```bash
git add my-personal-site/src/components/blog/BlogCard.tsx
git commit -m "$(cat <<'EOF'
Add BlogCard component

Whole card is a TanStack Link (not a nested "read more" link), 16:9
lazy-loaded image, line-clamped blurb, and a glow color passed in by
the caller so the grid can cycle pink/cyan/purple per card.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `BlogGrid` and `TagFilter` components

**Files:**
- Create: `my-personal-site/src/components/blog/BlogGrid.tsx`
- Create: `my-personal-site/src/components/blog/TagFilter.tsx`

**Interfaces:**
- Consumes: `BlogCard`, `Glow` (Task 4); `BlogPost` type (Task 1); `Badge` from `@/components/ui/badge`.
- Produces (used by Task 6):
  - `BlogGrid` — props `{ posts: BlogPost[] }`.
  - `TagFilter` — props `{ tags: string[]; active: string | null; onChange: (tag: string | null) => void }`.

- [ ] **Step 1: Write `BlogGrid`**

```tsx
// my-personal-site/src/components/blog/BlogGrid.tsx
import { BlogCard, type Glow } from './BlogCard'
import type { BlogPost } from '../../types/blog-post'

const GLOW_CYCLE: Glow[] = ['pink', 'cyan', 'purple']

type Props = {
  posts: BlogPost[]
}

export function BlogGrid({ posts }: Props) {
  if (posts.length === 0) {
    return <p className="mt-8 text-center text-slate-400">No posts match this tag yet.</p>
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <BlogCard key={post.slug} post={post} glow={GLOW_CYCLE[index % GLOW_CYCLE.length]} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Write `TagFilter`**

```tsx
// my-personal-site/src/components/blog/TagFilter.tsx
import { Badge } from '../../../@/components/ui/badge'

type Props = {
  tags: string[]
  active: string | null
  onChange: (tag: string | null) => void
}

export function TagFilter({ tags, active, onChange }: Props) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Badge
        variant={active === null ? 'default' : 'outline'}
        render={<button type="button" onClick={() => onChange(null)} />}
        className="cursor-pointer"
      >
        All
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={active === tag ? 'default' : 'outline'}
          render={<button type="button" onClick={() => onChange(tag)} />}
          className="cursor-pointer capitalize"
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
```

`Badge`'s `render` prop (base-ui polymorphism, same mechanism `@/components/ui/badge.tsx` exposes via `useRender`) swaps its underlying tag to a real `<button>`, keeping the badge styling while making it a proper interactive, keyboard-accessible element instead of a `span` with a click handler bolted on.

- [ ] **Step 3: Typecheck**

Run: `cd my-personal-site && npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add my-personal-site/src/components/blog/BlogGrid.tsx my-personal-site/src/components/blog/TagFilter.tsx
git commit -m "$(cat <<'EOF'
Add BlogGrid and TagFilter components

BlogGrid cycles pink/cyan/purple glow across cards and shows an empty
state when a filter matches nothing. TagFilter is presentational only
— the /blog route owns the active-tag state.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `/blog` listing route + Navbar entry

**Files:**
- Create: `my-personal-site/src/routes/blog.tsx`
- Modify: `my-personal-site/src/components/navbar.tsx`
- Modify (generated, do not hand-edit): `my-personal-site/src/routeTree.gen.ts`

**Interfaces:**
- Consumes: `getAllPosts`, `getAllTags` (Task 3); `BlogGrid`, `TagFilter` (Task 5).
- Produces: the `/blog` route, reachable from the primary nav.

- [ ] **Step 1: Write the route**

```tsx
// my-personal-site/src/routes/blog.tsx
import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getAllPosts, getAllTags } from '../lib/blog'
import { BlogGrid } from '../components/blog/BlogGrid'
import { TagFilter } from '../components/blog/TagFilter'

export const Route = createFileRoute('/blog')({
  component: BlogRouteComponent,
})

function BlogRouteComponent() {
  const posts = useMemo(() => getAllPosts(), [])
  const tags = useMemo(() => getAllTags(), [])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts
    return posts.filter((post) => post.tags?.includes(activeTag))
  }, [posts, activeTag])

  return (
    <div className="min-h-screen bg-[var(--deep-space-black)] text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Transmission Log
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            Blog
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Notes on code, teams, and everything in between.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <TagFilter tags={tags} active={activeTag} onChange={setActiveTag} />
        <BlogGrid posts={filteredPosts} />
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Add the Navbar entry**

In `my-personal-site/src/components/navbar.tsx`, change `primaryNavItems`:

```tsx
const primaryNavItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/resume', label: 'Resume' },
]
```

- [ ] **Step 3: Regenerate the route tree and verify it's a sibling route**

Run: `cd my-personal-site && npx vite build`
Expected: build succeeds, and `dist/assets/` includes a new `blog-*.js` chunk.

Open `src/routeTree.gen.ts` and confirm the generated `BlogRoute` has `getParentRoute: () => rootRouteImport` (not nested under anything else). Do not hand-edit this file — if it looks wrong, fix `blog.tsx`'s location/name and rebuild.

- [ ] **Step 4: Typecheck**

Run: `cd my-personal-site && npx tsc -b`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add my-personal-site/src/routes/blog.tsx my-personal-site/src/components/navbar.tsx my-personal-site/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
Add /blog listing route and nav entry

Tag filter state lives in the route component (plain useState, no
search param) — deep-linking to a filtered view isn't a v1
requirement.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `BlogPostView` component + `/blog/$slug` route

**Files:**
- Create: `my-personal-site/src/components/blog/BlogPostView.tsx`
- Create: `my-personal-site/src/routes/blog_.$slug.tsx`
- Modify: `my-personal-site/package.json` (add `react-markdown`)
- Modify (generated, do not hand-edit): `my-personal-site/src/routeTree.gen.ts`

**Interfaces:**
- Consumes: `BlogPost` type (Task 1); `getPostBySlug` (Task 3); `Badge`, `Button` from `@/components/ui/*`.
- Produces: the `/blog/$slug` route, and `BlogPostView` (props `{ post: BlogPost }`).

- [ ] **Step 1: Install `react-markdown`**

Run: `cd my-personal-site && npm install react-markdown`

- [ ] **Step 2: Write `BlogPostView`**

```tsx
// my-personal-site/src/components/blog/BlogPostView.tsx
import { Link } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { Badge } from '../../../@/components/ui/badge'
import { Button } from '../../../@/components/ui/button'
import type { BlogPost } from '../../types/blog-post'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

type Props = {
  post: BlogPost
}

export function BlogPostView({ post }: Props) {
  return (
    <div className="min-h-screen bg-[var(--deep-space-black)] text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10 mx-auto max-w-3xl">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="mt-4 text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author && <> &middot; {post.author}</>}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-12">
        <img
          src={post.image}
          alt={post.title}
          className="aspect-video w-full rounded-2xl border-2 border-[var(--laser-cyan)]/40 object-cover shadow-glow-cyan"
        />

        <div className="mt-8">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="mt-10 text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 text-xl font-bold text-[var(--laser-cyan)]">{children}</h3>
              ),
              p: ({ children }) => <p className="mt-4 leading-relaxed text-slate-300">{children}</p>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-[var(--laser-cyan)] underline decoration-[var(--laser-cyan)]/40 underline-offset-4 hover:[text-shadow:var(--glow-cyan)]"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">{children}</ul>
              ),
              blockquote: ({ children }) => (
                <blockquote className="mt-6 rounded-2xl border border-[var(--neon-pink)]/40 bg-[var(--deep-space-purple)]/70 px-6 py-4 text-slate-100 italic">
                  {children}
                </blockquote>
              ),
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt ?? ''}
                  loading="lazy"
                  className="mt-6 w-full rounded-2xl border border-[var(--laser-cyan)]/30"
                />
              ),
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        <Button variant="outline" className="mt-12" render={<Link to="/blog" />}>
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
          Back to blog
        </Button>
      </article>
    </div>
  )
}
```

- [ ] **Step 3: Write the route (note the filename)**

The file must be named `blog_.$slug.tsx` — a trailing underscore on `blog_` — so the router-plugin treats `/blog/$slug` as a sibling of `/blog`, not a child nested inside its layout. This was verified against the installed router-plugin (see Global Constraints).

```tsx
// my-personal-site/src/routes/blog_.$slug.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { Button } from '../../@/components/ui/button'
import { getPostBySlug } from '../lib/blog'
import { BlogPostView } from '../components/blog/BlogPostView'

export const Route = createFileRoute('/blog/$slug')({
  component: BlogSlugRouteComponent,
})

function BlogSlugRouteComponent() {
  const { slug } = Route.useParams()
  const post = getPostBySlug(slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--deep-space-black)] px-6 py-24 text-center text-slate-200">
        <h1 className="text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]">
          Post not found
        </h1>
        <p className="mt-4 text-slate-300">That transmission never made it through.</p>
        <Button variant="outline" className="mt-8" render={<Link to="/blog" />}>
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
          Back to blog
        </Button>
      </div>
    )
  }

  return <BlogPostView post={post} />
}
```

- [ ] **Step 4: Regenerate the route tree and verify it's NOT nested under `/blog`**

Run: `cd my-personal-site && npx vite build`
Expected: build succeeds, `dist/assets/` includes a `blog_.$slug-*.js` (or similarly named) chunk separate from `blog-*.js`.

Open `src/routeTree.gen.ts` and confirm the generated route for `/blog/$slug` has `getParentRoute: () => rootRouteImport`, not `() => BlogRoute`. If it shows `BlogRoute`, the filename is wrong — it must be `blog_.$slug.tsx`, not `blog.$slug.tsx`.

- [ ] **Step 5: Typecheck**

Run: `cd my-personal-site && npx tsc -b`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add my-personal-site/src/components/blog/BlogPostView.tsx "my-personal-site/src/routes/blog_.\$slug.tsx" my-personal-site/src/routeTree.gen.ts my-personal-site/package.json my-personal-site/package-lock.json
git commit -m "$(cat <<'EOF'
Add BlogPostView component and /blog/\$slug article route

Markdown body renders via react-markdown with synthwave-styled
component overrides (no @tailwindcss/typography dependency). Unknown
slugs render an in-page "Post not found" state rather than a 404
route, matching how the rest of the site has no catch-all route.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: End-to-end visual verification

**Files:** none (verification only).

**Interfaces:** Consumes the fully wired app from Tasks 1–7.

- [ ] **Step 1: Run the full test suite and build**

Run: `cd my-personal-site && npm test && npx tsc -b && npx vite build`
Expected: all Vitest tests pass, typecheck clean, build succeeds.

- [ ] **Step 2: Start the dev server**

Run (background): `cd my-personal-site && npm run dev`
Wait for `Local: http://localhost:5173/` in the output before proceeding.

- [ ] **Step 3: Drive it with Playwright and capture screenshots**

Using a local Playwright/Node script (see this repo's prior `/stack` page verification for the pattern — `chromium.launch()`, `page.goto`, `page.screenshot`), visit and screenshot each of:

- `http://localhost:5173/blog` — grid renders 2 cards, tag filter row shows "All", "ai", "coding".
- Click the "ai" (or "coding") tag — grid narrows to the one tagged post; click "All" — both posts return.
- Click a card — navigates to `/blog/$slug` for that post; verify the URL and that the article renders (title, image, tags/meta, markdown body with a styled `##` heading).
- Click "Back to blog" — returns to `/blog`.
- Navigate directly to `http://localhost:5173/blog/does-not-exist` — verify the "Post not found" state and its "Back to blog" button.

Check `page.on('console', ...)` for errors at each step — zero expected.

- [ ] **Step 4: Stop the dev server**

Find and kill the process listening on port 5173 (see prior `/stack` verification in this repo for the Windows `netstat`/`taskkill` pattern).

- [ ] **Step 5: Report**

Summarize what was verified (or any issue found and fixed) — no commit needed for this task unless a bug fix was required, in which case commit that fix separately with its own message.
