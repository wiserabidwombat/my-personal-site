// Guards against exactly the metadata drift described in the review: a
// prerendered static <head> (built from src/routes/routeMeta.ts, see
// scripts/prerender-meta.mjs) silently diverging from what a route's own
// head() actually renders in the browser.
//
// Route .tsx files themselves can't be imported here -- vitest.config.ts
// runs the `node` environment with no react/jsx plugin
// configured, and every route file pulls in its full UI/component graph
// (Tailwind-classed JSX, shadcn/ui primitives, .jpg
// asset imports) that only Vite's real dev-server transform pipeline (which
// scripts/prerender-meta.mjs itself gets, via `server.ssrLoadModule`)
// resolves -- so a plain import of e.g. about.tsx would fail for reasons
// unrelated to the thing this guard actually needs to check.
//
// Instead of re-implementing each route's expected title/description (which
// would just be a second hand-typed mirror -- the exact bug this guard
// exists to catch), this file:
//
//   1. Reads each route file's raw source text and asserts it actually
//      calls `seoMeta(<name>Meta)` / `canonicalLink(<name>Meta.path)` with
//      the matching named export imported from './routeMeta' -- i.e. that
//      route's head() is, verifiably, a passthrough of that exact object,
//      not a re-typed literal that could drift from it.
//   2. Feeds every routeMeta.ts entry through the SAME seoMeta()/
//      canonicalLink() helpers every route calls, and checks the resulting
//      tags carry that entry's own path/title/description -- catching any
//      future change to seoMeta()/canonicalLink()'s shape that would break
//      a route's real rendered <head> without this file's own assertions
//      changing to match.
//
// Together, (1) proves a route's real head() output IS `seoMeta(entry)` /
// `canonicalLink(entry.path)` (by construction, not by chance), and (2)
// proves that call actually produces correct, non-empty tags for `entry` --
// so there is no gap left for a title/description string to drift through
// unnoticed.
/// <reference types="node" />
// tsconfig.app.json (which governs this file, under src/) deliberately
// scopes `types` down to just `vite/client` so browser code can't
// accidentally pick up ambient Node globals -- this reference pulls in
// @types/node's `node:*` module declarations for THIS file only (a build-
// time-only Vitest test, never bundled for the browser) without loosening
// that restriction for the rest of the app.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seoMeta, canonicalLink, SITE_URL } from '../lib/meta'
import {
  homeMeta,
  aboutMeta,
  resumeMeta,
  blogMeta,
  gamesMeta,
  contactMeta,
  stackMeta,
  mineralsFossilsMeta,
  booksMeta,
  routeMetaList,
  type RouteMetaEntry,
} from './routeMeta'

const routesDir = path.dirname(fileURLToPath(import.meta.url))

// One entry per static route file that owns a routeMeta.ts export. (The
// dynamic /blog/$slug route is intentionally excluded -- its title/
// description/image come from each post's own frontmatter via
// getAllPosts()/getPostBySlug(), computed fresh every build, so there is no
// hand-typed copy of that data for this guard to protect.)
const routeFiles: { file: string; metaName: string; meta: RouteMetaEntry }[] = [
  { file: 'index.tsx', metaName: 'homeMeta', meta: homeMeta },
  { file: 'about.tsx', metaName: 'aboutMeta', meta: aboutMeta },
  { file: 'resume.tsx', metaName: 'resumeMeta', meta: resumeMeta },
  { file: 'blog.tsx', metaName: 'blogMeta', meta: blogMeta },
  { file: 'games.tsx', metaName: 'gamesMeta', meta: gamesMeta },
  { file: 'contact.tsx', metaName: 'contactMeta', meta: contactMeta },
  { file: 'stack.tsx', metaName: 'stackMeta', meta: stackMeta },
  { file: 'minerals_fossils.tsx', metaName: 'mineralsFossilsMeta', meta: mineralsFossilsMeta },
  { file: 'books.tsx', metaName: 'booksMeta', meta: booksMeta },
]

describe('routeMeta wiring (guards against static-page metadata drift)', () => {
  it.each(routeFiles)(
    '$file imports its own routeMeta.ts entry and passes it straight into seoMeta()/canonicalLink()',
    ({ file, metaName }) => {
      const source = readFileSync(path.join(routesDir, file), 'utf8')

      const importPattern = new RegExp(`import\\s*\\{[^}]*\\b${metaName}\\b[^}]*\\}\\s*from\\s*['"]\\./routeMeta['"]`)
      expect(
        importPattern.test(source),
        `src/routes/${file} must import { ${metaName} } from './routeMeta' -- it either lost that import or drifted ` +
          `back to a hand-typed literal, which is exactly the duplication this guard exists to prevent.`,
      ).toBe(true)

      const seoMetaPattern = new RegExp(`seoMeta\\(\\s*${metaName}\\s*\\)`)
      expect(
        seoMetaPattern.test(source),
        `src/routes/${file}'s head() must call seoMeta(${metaName}) directly -- found a call that doesn't pass the ` +
          `imported routeMeta.ts entry through unchanged, so its real rendered <head> could now differ from what ` +
          `scripts/prerender-meta.mjs bakes into the static page for this route.`,
      ).toBe(true)

      const canonicalPattern = new RegExp(`canonicalLink\\(\\s*${metaName}\\.path\\s*\\)`)
      expect(
        canonicalPattern.test(source),
        `src/routes/${file}'s head() must call canonicalLink(${metaName}.path) -- found a call that doesn't source ` +
          `the path from the imported routeMeta.ts entry, so its canonical <link> could now differ from the one ` +
          `scripts/prerender-meta.mjs bakes into the static page for this route.`,
      ).toBe(true)
    },
  )

  it('routeMetaList contains exactly the named exports every route file above imports from, in a stable set', () => {
    const expected = routeFiles.map(({ meta }) => meta)
    expect(
      routeMetaList.length,
      `routeMetaList has ${routeMetaList.length} entries but ${expected.length} route files import a routeMeta.ts ` +
        `entry -- a route was added/removed from one list without the other.`,
    ).toBe(expected.length)
    for (const meta of expected) {
      expect(
        routeMetaList.includes(meta),
        `routeMetaList is missing an entry (path "${meta.path}") that a route file imports -- ` +
          `scripts/prerender-meta.mjs's static prerender pass would silently skip that route.`,
      ).toBe(true)
    }
  })

  it.each(routeFiles)(
    'seoMeta($meta.path) actually renders that entry\'s own title/description/url, not a stale copy',
    ({ meta }) => {
      const tags = seoMeta(meta)

      const titleTag = tags.find((entry): entry is { title: string } => 'title' in entry)
      expect(
        titleTag?.title.startsWith(meta.title ?? 'Aaron Tilley'),
        `seoMeta() for path "${meta.path}" produced title "${titleTag?.title}", which doesn't start with this ` +
          `entry's own title ("${meta.title ?? '(home page, no title)'}") -- the title field has drifted.`,
      ).toBe(true)

      const descriptionTag = tags.find((entry) => 'name' in entry && entry.name === 'description')
      expect(
        descriptionTag && 'content' in descriptionTag ? descriptionTag.content : undefined,
        `seoMeta() for path "${meta.path}" did not render this entry's own description -- the description field has drifted.`,
      ).toBe(meta.description)

      const ogUrlTag = tags.find((entry) => 'property' in entry && entry.property === 'og:url')
      const expectedUrl = `${SITE_URL}${meta.path}`
      expect(
        ogUrlTag && 'content' in ogUrlTag ? ogUrlTag.content : undefined,
        `seoMeta() for path "${meta.path}" rendered og:url "${
          ogUrlTag && 'content' in ogUrlTag ? ogUrlTag.content : undefined
        }", expected "${expectedUrl}" -- the path field has drifted.`,
      ).toBe(expectedUrl)

      const canonical = canonicalLink(meta.path)
      expect(
        canonical.href,
        `canonicalLink() for path "${meta.path}" produced the wrong href -- the path field has drifted.`,
      ).toBe(expectedUrl)
    },
  )
})
