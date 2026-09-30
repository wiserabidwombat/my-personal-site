// Pure helpers for scripts/prerender-meta.mjs: they turn the string
// renderToString() returns into markup that matches what the browser's
// first render produces, so hydrateRoot() can adopt it instead of throwing
// React error #418 and re-rendering the whole page.

// React 19's renderToString() puts "hoistable" tags it emits -- such as the
// <link rel="preload" as="image"> it adds for an <img fetchPriority="high">
// -- at the very start of its output, since there's no <head> to put them
// in. Spliced into <div id="root"> as-is, they become extra nodes the client
// tree doesn't have. This splits them off so they can go in <head>, where
// they belong (and where React ignores them during hydration).
export function splitHoistedTags(bodyHtml) {
  const match = bodyHtml.match(/^(?:<(?:link|meta)\b[^>]*>)+/)
  const hoisted = match ? match[0] : ''
  return { hoisted, body: bodyHtml.slice(hoisted.length) }
}

// The prerender renders through Vite's dev module loader, so imported assets
// come out as their source paths (/src/assets/x.webp) -- URLs that don't
// exist in the built site. The browser bundle uses the hashed files Vite
// wrote (/assets/x-Hash.webp), so this maps each source path to that file
// via the client build's manifest. Throws on a path the manifest doesn't
// list (e.g. an asset small enough to be inlined as a data: URL), rather
// than shipping a broken URL.
export function withBuiltAssetUrls(html, manifest) {
  return html.replace(/\/src\/[^"'\s)]+/g, (sourcePath) => {
    const entry = manifest[sourcePath.slice(1)]
    if (!entry) throw new Error(`Prerendered HTML references ${sourcePath}, which the build manifest doesn't list`)
    return `/${entry.file}`
  })
}
