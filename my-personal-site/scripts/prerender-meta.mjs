// Build-time only, run after `vite build`. This site is a pure client-side
// SPA (see src/main.tsx) and vercel.json rewrites every non-API path to the
// same dist/index.html -- so the OpenGraph/Twitter tags TanStack Router
// injects via head()/<HeadContent/> never reach link-preview crawlers
// (LinkedIn, Twitter/X, Facebook, Slack), since none of them execute
// JavaScript before reading a page's <meta> tags.
//
// This script writes a real dist/<route>/index.html per page -- a copy of
// the built template with that page's title/meta already baked into the
// HTML -- so Vercel serves the correct static file directly (static files
// are matched before rewrites) while everything still boots the same SPA
// bundle and TanStack Router takes over for client-side navigation exactly
// as before.
//
// Loaded through Vite's own SSR module loader (not a plain Node `import`),
// same as scripts/generate-rss.mjs, because src/lib/blog.ts reads the
// markdown files via `import.meta.glob`, which only Vite understands.
import { createServer } from 'vite'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')

const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let seoMeta, SITE_URL, getAllPosts
try {
  const metaMod = await server.ssrLoadModule('/src/lib/meta.ts')
  seoMeta = metaMod.seoMeta
  SITE_URL = metaMod.SITE_URL
  const blogMod = await server.ssrLoadModule('/src/lib/blog.ts')
  getAllPosts = blogMod.getAllPosts
} finally {
  await server.close()
}

// Mirrors each static route file's own head()/seoMeta() call args (see
// src/routes/*.tsx) -- kept as a flat list here rather than re-executing the
// route modules, so this step doesn't have to load their full UI/component
// module graph under Node's SSR loader.
const staticPages = [
  { path: '/', description: 'Senior Developer specializing in React, .NET, and enterprise CRM systems.' },
  {
    path: '/about',
    title: 'About',
    description: 'Senior Developer specializing in React, .NET, and enterprise CRM systems.',
  },
  {
    path: '/resume',
    title: 'Resume',
    description: "View Aaron Tilley's professional experience and technical skills.",
  },
  {
    path: '/blog',
    title: 'Blog',
    description:
      'Notes on code, engineering leadership, and everything in between -- Aaron Tilley writes about software development, teams, and AI-assisted workflows.',
  },
  { path: '/games', title: 'Game Inventory', description: "Browse Aaron's board game collection." },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Get in touch with Aaron Tilley -- reach out by email or connect on LinkedIn.',
  },
  { path: '/stack', title: 'About This Site', description: 'The tools and technology stack behind this site.' },
  {
    path: '/minerals_fossils',
    title: 'Minerals & Fossils',
    description: "Browse Aaron's minerals and fossil collection.",
  },
]

const postPages = getAllPosts().map((post) => ({
  path: `/blog/${post.slug}`,
  title: post.title,
  description: post.blurb,
  image: `${SITE_URL}${post.image}`,
  type: 'article',
}))

const pages = [...staticPages, ...postPages]

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
  return { title, tags: tags.join('\n') }
}

const template = await readFile(path.join(distDir, 'index.html'), 'utf8')

for (const page of pages) {
  const { title, tags } = renderHead(page)
  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace('</head>', `${tags}\n  </head>`)

  const outDir = page.path === '/' ? distDir : path.join(distDir, page.path)
  await mkdir(outDir, { recursive: true })
  await writeFile(path.join(outDir, 'index.html'), html)
}

console.log(`Prerendered meta tags into ${pages.length} route(s) under dist/`)
