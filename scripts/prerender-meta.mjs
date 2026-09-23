// Build-time only, run after `vite build`. This site is a pure client-side
// SPA (see src/main.tsx) and vercel.json rewrites every non-API path to the
// same dist/index.html -- so the OpenGraph/Twitter tags TanStack Router
// injects via head()/<HeadContent/> never reach link-preview crawlers
// (LinkedIn, Twitter/X, Facebook, Slack), since none of them execute
// JavaScript before reading a page's <meta> tags.
//
// This script writes a real dist/<route>/index.html per page -- a copy of
// the built template with that page's title/meta AND its actual rendered
// page body (via createAppRouter()/router.load()/renderToString(), see
// renderBody() below) already baked into the HTML -- so Vercel serves the
// correct static file directly (static files are matched before rewrites)
// while everything still boots the same SPA bundle and TanStack Router
// hydrates that same markup and takes over for client-side navigation
// exactly as before (see src/main.tsx's hydrateRoot/createRoot split).
//
// Loaded through Vite's own SSR module loader (not a plain Node `import`),
// same as scripts/generate-rss.mjs, because src/lib/blog.ts reads the
// markdown files via `import.meta.glob`, which only Vite understands, and
// src/router.ts pulls in the full route tree (JSX components, Tailwind
// classes, path aliases) that only Vite's own transform pipeline resolves.
// react/react-dom/@tanstack/react-router themselves are plain npm packages
// -- Vite's SSR module loader externalizes those (same as any other
// node_modules dependency), so the plain top-level imports below resolve to
// the exact same module instances src/router.ts's own imports do underneath
// ssrLoadModule, with no duplicate-React/duplicate-router-package hazard.
import { createServer } from 'vite'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')

const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

// Read by src/routes/__root.tsx's RootComponent to skip rendering
// <HeadContent/> during the Node-side renderBody() pass below. renderHead()
// (this file) already independently builds the same title/meta/canonical
// tags from the same seoMeta()/canonicalLink() inputs, so <HeadContent/>'s
// output here would be pure duplication -- and React 19 auto-hoists its
// <title>/<meta>/<link> tags to the front of renderToString()'s returned
// string, which gets spliced straight into <body> below, so leaving it
// unguarded bakes a second, invalid copy of every head tag (including a
// second canonical <link>) into every static page. This flag only exists in
// this script's own Node process, so it never affects the real browser
// runtime -- <HeadContent/> keeps rendering normally there.
globalThis.__PRERENDERING__ = true

let seoMeta, SITE_URL, canonicalLink, getAllPosts, createAppRouter, staticPages

// staticPages itself is loaded below, inside the try block, from
// src/routes/routeMeta.ts -- the same module each static route file (see
// src/routes/*.tsx) imports its own entry from for its head()/seoMeta()
// call. That module is deliberately dependency-free (no JSX, no path
// aliases, no asset imports), so -- unlike the route .tsx files themselves,
// which pull in their full UI/component module graph -- it loads cleanly
// under Node's SSR loader without needing the route modules re-executed
// here. Because both this script and every route file now read from that
// one shared module instead of each keeping its own copy of the
// title/description strings, there is nothing left to hand-mirror out of
// sync; src/routes/routeMeta.test.ts guards that every route file actually
// stays wired to it.

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderHead(page) {
  const meta = seoMeta({
    title: page.title,
    description: page.description,
    path: page.path,
    image: page.image,
    type: page.type,
  })

  let title = ''
  const tags = []
  for (const entry of meta) {
    if ('title' in entry) {
      title = entry.title
      continue
    }
    const attr = 'property' in entry ? `property="${entry.property}"` : `name="${entry.name}"`
    tags.push(`    <meta ${attr} content="${escapeHtml(entry.content)}" />`)
  }
  // Mirrors each leaf route's own head() call (src/routes/*.tsx), which adds
  // `links: [canonicalLink(path)]` alongside its seoMeta() call.
  const canonical = canonicalLink(page.path)
  tags.push(`    <link rel="${escapeHtml(canonical.rel)}" href="${escapeHtml(canonical.href)}" />`)
  return { title, tags: tags.join('\n') }
}

// Renders a route's actual component tree server-side so the static HTML a
// crawler (or a real visitor's first paint) receives contains the real page
// body, not just an empty #root that only fills in once the SPA bundle
// boots. A fresh router + memory history PER PAGE (not one router navigated
// repeatedly) -- createMemoryHistory's initialEntries seeds it directly at
// the target path, and `{ sync: true }` on load() blocks until that route's
// loader (only blog_.$slug.tsx has one) has actually resolved, so
// renderToString never races an unresolved loader.
//
// /games, /minerals_fossils, and /books have no route loader -- their data
// hooks (useBoardGames, useSpecimens, useBooks) are useEffect-gated, which
// never runs during renderToString, so those three pages simply render
// their initial loading-skeleton state here (a "shell" prerender) rather
// than live data. The live Notion/Neon/Hardcover fetch still happens
// client-side after hydration exactly as before -- nothing about those
// hooks changes.
async function renderBody(page) {
  const history = createMemoryHistory({ initialEntries: [page.path] })
  const router = createAppRouter(history)
  await router.load({ sync: true })
  return renderToString(React.createElement(RouterProvider, { router }))
}

// Module loading AND the render loop below both have to run while `server`
// is still open -- @tanstack/router-plugin auto-code-splits every route's
// `component` into its own lazily-`import()`-ed chunk, so router.load()
// (inside renderBody()) resolves that dynamic import through this same Vite
// dev server's module runner. Closing the server any earlier (right after
// the initial ssrLoadModule calls, as an earlier version of this script
// did) makes every renderBody() call fail with "Vite module runner has
// been closed." -- so `server.close()` only happens in the `finally` below,
// once every page has actually been rendered.
let pageCount = 0
try {
  const metaMod = await server.ssrLoadModule('/src/lib/meta.ts')
  seoMeta = metaMod.seoMeta
  SITE_URL = metaMod.SITE_URL
  canonicalLink = metaMod.canonicalLink
  const blogMod = await server.ssrLoadModule('/src/lib/blog.ts')
  getAllPosts = blogMod.getAllPosts
  const routerMod = await server.ssrLoadModule('/src/router.ts')
  createAppRouter = routerMod.createAppRouter
  const routeMetaMod = await server.ssrLoadModule('/src/routes/routeMeta.ts')
  staticPages = routeMetaMod.routeMetaList

  const postPages = getAllPosts().map((post) => ({
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.blurb,
    image: `${SITE_URL}${post.image}`,
    type: 'article',
  }))

  const pages = [...staticPages, ...postPages]
  pageCount = pages.length

  const template = await readFile(path.join(distDir, 'index.html'), 'utf8')

  // The loop below overwrites dist/index.html itself for the '/' page (so
  // the apex URL keeps getting Home's prerendered head+body -- Vercel serves
  // '/' from dist/index.html directly, matched as a literal static file
  // before vercel.json's rewrites even run). That means dist/index.html can
  // no longer double as the SPA's fallback shell for genuinely unmatched
  // paths (a typo'd/removed blog slug, a real 404, any future route not in
  // `pages` below): main.tsx's hasChildNodes() check would see Home's baked
  // body, hydrateRoot() against it, and mismatch against whatever the client
  // router actually resolves there. So this pristine copy of the template --
  // still with its always-empty `<div id="root"></div>` -- gets saved under
  // its own filename BEFORE any page rendering touches `template`'s source
  // file on disk, and vercel.json's catch-all rewrite now points at this
  // file instead of "/index.html", so an unmatched path still falls through
  // to main.tsx's createRoot() branch exactly as it did before prerendering
  // existed, with no baked markup for the client router to fight against.
  //
  // This file is also the only one of the two templates that gets a
  // `noindex` tag: it's reachable directly at /app-shell.html once deployed
  // (it's the literal rewrite target in vercel.json), but it's just the
  // pristine default-title/empty-#root shell with none of a real page's
  // content or per-route metadata, so a crawler that indexed it as its own
  // URL would only ever find a thin, permanently-empty duplicate. The
  // `.replace()` here only touches this in-memory copy of `template`'s
  // string, written to its own file below -- `template` itself (used by
  // every per-route page in the loop that follows) is left untouched, so
  // none of the real prerendered pages pick up this tag.
  const appShellHtml = template.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>')
  await writeFile(path.join(distDir, 'app-shell.html'), appShellHtml)

  for (const page of pages) {
    const { title, tags } = renderHead(page)
    const bodyHtml = await renderBody(page)
    const html = template
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace('</head>', `${tags}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)

    const outDir = page.path === '/' ? distDir : path.join(distDir, page.path)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), html)
  }
} finally {
  await server.close()
}

console.log(`Prerendered ${pageCount} route(s) (head + body) under dist/`)
