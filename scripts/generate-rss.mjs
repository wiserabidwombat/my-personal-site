// Build-time only. Generates public/rss.xml from the same blog post data
// used on the site (src/lib/blog.ts's getAllPosts()), so the feed can never
// drift out of sync with the markdown parsing logic. Loaded through Vite's
// own SSR module loader (not a plain Node `import`) because blog.ts reads
// the markdown files via `import.meta.glob`, which only Vite understands.
import { createServer } from 'vite'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const SITE_URL = 'https://aarontilley.me'
const SITE_TITLE = "Aaron Tilley's Blog"
const SITE_DESCRIPTION = 'Notes on code, teams, and everything in between.'

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRfc822(dateString) {
  // Posts store a bare "YYYY-MM-DD" date. Anchoring to UTC midnight avoids
  // the local-timezone off-by-one day shift that plain `new Date(dateString)`
  // parsing + local formatting would otherwise introduce.
  return new Date(`${dateString}T00:00:00Z`).toUTCString()
}

const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let posts
try {
  const mod = await server.ssrLoadModule('/src/lib/blog.ts')
  posts = mod.getAllPosts()
} finally {
  await server.close()
}

const items = posts
  .map((post) => {
    const link = `${SITE_URL}/blog/${post.slug}`
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <description>${escapeXml(post.blurb)}</description>
    </item>`
  })
  .join('\n')

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

const outPath = path.join(root, 'public', 'rss.xml')
await writeFile(outPath, rss)
console.log(`Wrote ${posts.length} posts to ${path.relative(root, outPath)}`)
