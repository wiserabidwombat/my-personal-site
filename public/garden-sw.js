const CACHE = 'patient-garden-v3'
self.addEventListener('activate', event => event.waitUntil((async () => {
  await self.clients.claim()
  const keys = await caches.keys()
  await Promise.all(keys.filter(key => key.startsWith('patient-garden-') && key !== CACHE).map(key => caches.delete(key)))
})()))
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') { self.skipWaiting(); return }
  if (event.data?.type !== 'PRECACHE' || !Array.isArray(event.data.urls)) return
  const urls = event.data.urls.filter(value => { try { const u = new URL(value); return u.origin === self.location.origin && u.pathname.startsWith('/assets/') } catch { return false } })
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE)
      const shell = await fetch('/garden/', { cache: 'reload' })
      if (!shell.ok) throw Error('No shell')
      await cache.put('/garden', shell)
      await Promise.all([...new Set([...urls, '/garden/manifest.webmanifest', '/garden/icon-192.png', '/garden/icon-512.png'])].map(async url => {
        try { await cache.add(url) } catch { if (!await cache.match(url, { ignoreVary: true })) throw Error('Missing asset') }
      }))
      event.source?.postMessage({ type: 'OFFLINE_READY' })
    } catch {
      const cache = await caches.open(CACHE)
      const available = await cache.match('/garden') && await Promise.all(urls.map(url => cache.match(url, { ignoreVary: true }))).then(rows => rows.every(Boolean))
      event.source?.postMessage({ type: available ? 'OFFLINE_READY' : 'CACHE_FAILED' })
    }
  })())
})
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (request.mode === 'navigate' && ['/garden', '/garden/'].includes(url.pathname)) {
    // Shared query data is read locally; cache only the generic client shell.
    event.respondWith(fetch('/garden/', { cache: 'no-cache' }).then(async response => {
      if (!response.ok) throw Error('Navigation failed')
      const cache = await caches.open(CACHE); await cache.put('/garden', response.clone())
      return response
    }).catch(async () => (await (await caches.open(CACHE)).match('/garden')) || Response.error()))
  } else if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/garden/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE)
      const saved = await cache.match(request, { ignoreVary: true })
      if (saved) return saved
      const response = await fetch(request)
      if (response.ok) await cache.put(request, response.clone())
      return response
    })())
  }
})
