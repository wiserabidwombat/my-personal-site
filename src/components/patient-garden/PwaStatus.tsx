import { useEffect, useRef, useState } from 'react'

interface InstallPrompt extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
export function PwaStatus({ showHelp = false }: { showHelp?: boolean }) {
  const [online, setOnline] = useState(true)
  const [offlineReady, setOfflineReady] = useState(false)
  const [install, setInstall] = useState<InstallPrompt | null>(null)
  const [standalone, setStandalone] = useState(false)
  const [update, setUpdate] = useState<ServiceWorker | null>(null)
  const [notice, setNotice] = useState('')
  const reloading = useRef(false)
  useEffect(() => {
    let canceled = false
    const cleanups: (() => void)[] = []
    const connection = () => setOnline(navigator.onLine)
    const isInstalled = () => { setStandalone(window.matchMedia('(display-mode: standalone)').matches || !!(navigator as Navigator & { standalone?: boolean }).standalone); setInstall(null) }
    const prompt = (event: Event) => { event.preventDefault(); setInstall(event as InstallPrompt) }
    connection(); isInstalled()
    window.addEventListener('online', connection); window.addEventListener('offline', connection); window.addEventListener('beforeinstallprompt', prompt); window.addEventListener('appinstalled', isInstalled)
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      const message = (event: MessageEvent) => { if (event.data?.type === 'OFFLINE_READY') setOfflineReady(true); if (event.data?.type === 'CACHE_FAILED') setNotice('Offline files are not ready yet. Keep the app open online, then reload to retry.') }
      const controlled = () => { if (reloading.current) window.location.reload() }
      navigator.serviceWorker.addEventListener('message', message); navigator.serviceWorker.addEventListener('controllerchange', controlled)
      cleanups.push(() => { navigator.serviceWorker.removeEventListener('message', message); navigator.serviceWorker.removeEventListener('controllerchange', controlled) })
      void navigator.serviceWorker.register('/garden-sw.js', { scope: '/garden', updateViaCache: 'none' }).then(async reg => {
        if (canceled) return
        if (reg.waiting) setUpdate(reg.waiting)
        const found = () => {
          const worker = reg.installing
          const changed = () => { if (!canceled && worker?.state === 'installed' && navigator.serviceWorker.controller && reg.waiting) setUpdate(reg.waiting) }
          worker?.addEventListener('statechange', changed); cleanups.push(() => worker?.removeEventListener('statechange', changed))
        }
        reg.addEventListener('updatefound', found); cleanups.push(() => reg.removeEventListener('updatefound', found))
        const ready = await navigator.serviceWorker.ready
        if (canceled) return
        const urls = [...new Set(performance.getEntriesByType('resource').map(r => r.name).filter(value => { const u = new URL(value); return u.origin === location.origin && u.pathname.startsWith('/assets/') }))]
        ready.active?.postMessage({ type: 'PRECACHE', urls })
        void reg.update().catch(() => { /* Offline use keeps the installed version. */ })
      }).catch(() => { if (!canceled) setNotice('Offline installation is unavailable in this browser. Your garden can still save locally.') })
    }
    return () => { canceled = true; cleanups.forEach(fn => fn()); window.removeEventListener('online', connection); window.removeEventListener('offline', connection); window.removeEventListener('beforeinstallprompt', prompt); window.removeEventListener('appinstalled', isInstalled) }
  }, [])
  return <aside className="pg-pwa"><div className="pg-pwa-row"><span role="status">{!online ? 'Offline · changes still save on this device' : offlineReady ? 'Offline ready · saved on this device' : import.meta.env.PROD ? 'Preparing offline files…' : 'Preview · device storage'}</span>{install && !standalone && <button onClick={async () => { try { await install.prompt(); await install.userChoice; setInstall(null) } catch { setNotice('Use your browser’s Install or Add to Home Screen menu.') } }}>Install app</button>}{update && <button onClick={() => { reloading.current = true; update.postMessage({ type: 'SKIP_WAITING' }) }}>Update app</button>}</div>{notice && <p role="status">{notice}</p>}
    {showHelp && <details><summary>{standalone ? 'Installed · backup & update help' : 'How to put this on your phone'}</summary><p>On iPhone or iPad, open this link in Safari, use Share, then Add to Home Screen. On Android, use Install app when offered, or the browser menu. Sharing products directly into the app is available only in supported browsers after installation; pasting a link always works.</p><p>First open the app online and wait for “Offline ready.” Export a backup in Settings before changing devices or site addresses. A Vercel preview and the live website have separate local gardens; move yours with export/import. App updates preserve your saved data.</p></details>}
  </aside>
}
