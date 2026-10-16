import { useEffect, useRef, useState } from 'react'
import { money, rewardEligible } from './engine'
import type { Item, State } from './engine'
import { productLink, sharedProduct } from './products'

type Draft = { name: string; url: string; price: string; kind: Item['kind']; note: string }
const empty: Draft = { name: '', url: '', price: '', kind: 'want', note: '' }
export function CapturePanel({ state, item, onSave, onDone }: { state: State; item?: Item; onSave: (s: State) => boolean; onDone: () => void }) {
  const [draft, setDraft] = useState<Draft>(item ? { name: item.name, url: item.url, price: (item.cents / 100).toFixed(2), kind: item.kind, note: item.note } : empty)
  const [paste, setPaste] = useState('')
  const [notice, setNotice] = useState('Paste a product link, or fill in the details below.')
  const [busy, setBusy] = useState(false)
  const opened = useRef(false)
  const request = useRef(0)
  useEffect(() => {
    if (opened.current || item) return
    opened.current = true
    const params = new URLSearchParams(window.location.search)
    if (!['text', 'title', 'url'].some(key => params.has(key))) return
    try {
      const shared = sharedProduct(params.get('text') || '', params.get('title') || '', params.get('url') || '')
      setDraft(d => ({ ...d, name: shared.name, price: shared.price, url: shared.url }))
      setPaste(shared.url)
      setNotice('Shared details are ready to review. Confirm the title and price before saving.')
    } catch { setNotice('Could not read the shared link. You can still enter the item manually.') }
    for (const key of ['text', 'title', 'url']) params.delete(key)
    window.history.replaceState(window.history.state, '', window.location.pathname + (params.size ? `?${params}` : ''))
  }, [item])
  async function fill() {
    const token = ++request.current
    setBusy(true)
    try {
      let info = sharedProduct(paste)
      if (info.short) {
        const response = await fetch(`/api/garden-product?url=${encodeURIComponent(info.url)}`, { signal: AbortSignal.timeout(8000) })
        const result = await response.json() as { url?: string; error?: string }
        if (!response.ok || !result.url) throw Error(result.error || 'Could not expand that link. Paste the full product address instead.')
        info = { ...sharedProduct('', '', result.url), price: info.price }
      }
      if (request.current !== token) return
      setDraft(d => ({ ...d, url: info.url, name: d.name || info.name, price: d.price || info.price }))
      setNotice(info.name || info.price ? 'Suggested details filled from your link or shared text. Verify them before saving.' : 'Link cleaned. Enter the name and current price; Amazon does not provide a reliable automatic price here.')
    } catch (e) { if (request.current === token) setNotice(e instanceof Error ? e.message : 'Could not read that link. Enter details manually.') }
    finally { if (request.current === token) setBusy(false) }
  }
  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft(d => ({ ...d, [key]: value })) }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const link = productLink(draft.url), name = draft.name.trim(), cents = Math.round(Number(draft.price) * 100)
      if (!name || !Number.isSafeInteger(cents) || cents <= 0) throw Error('Enter a name and a positive price.')
      const duplicate = state.items.find(i => {
        if (i.id === item?.id) return false
        let key = ''; try { key = productLink(i.url).key } catch { /* Older manual links can still be edited. */ }
        return i.name.trim().toLowerCase() === name.toLowerCase() || !!(key && key === link.key)
      })
      if (duplicate) throw Error(`Already in your ${duplicate.status === 'waiting' ? 'waiting list' : 'history'}: ${duplicate.name} (${money(duplicate.cents)}). Edit that item instead to keep its original waiting time.`)
      const previousReward = item?.reflectionRewarded ?? !!(item && item.note.trim().length >= 10)
      const nextItem: Item = { ...(item || { id: crypto.randomUUID(), added: Date.now(), status: 'waiting', rewarded: [] }), name, cents, url: link.url, kind: draft.kind, note: draft.note.trim(), reflectionRewarded: previousReward }
      let next = { ...state, items: item ? state.items.map(i => i.id === item.id ? nextItem : i) : [...state.items, nextItem] }
      if (!previousReward && nextItem.note.length >= 10 && rewardEligible(next, nextItem)) {
        next = { ...next, xp: next.xp + 5, items: next.items.map(i => i.id === nextItem.id ? { ...i, reflectionRewarded: true } : i) }
      }
      if (onSave(next)) { setDraft(empty); setPaste(''); setNotice(item ? 'Item updated. Its waiting time and reward history were kept.' : 'Wish saved. Give it time.'); onDone() }
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Could not save the item.') }
  }
  return <section className="pg-card" id="garden-capture"><p className="pg-eyebrow">PAUSE THE PURCHASE</p><h2>{item ? 'Revisit your thought' : 'Plant a thought'}</h2>
    {!item && <div className="pg-quick-capture"><label>Paste a link or shared text<textarea value={paste} onChange={e => { request.current++; setBusy(false); setPaste(e.target.value) }} placeholder="An Amazon link, or a shared title, price, and link…" maxLength={4000}/></label><button type="button" disabled={busy || !paste.trim()} onClick={fill}>{busy ? 'Reading link…' : 'Fill from link'}</button></div>}
    <p role="status" className="pg-inline-notice">{notice}</p>
    <form onSubmit={submit}><label>What caught your eye?<input value={draft.name} onChange={e => update('name', e.target.value)} required maxLength={150}/></label><div className="pg-fields"><label>Price ($)<input value={draft.price} onChange={e => update('price', e.target.value)} type="number" min="0.01" max="1000000" step="0.01" required inputMode="decimal"/></label><label>Is it a…<select value={draft.kind} onChange={e => update('kind', e.target.value as Item['kind'])}><option value="want">Want</option><option value="need">Need</option><option value="unsure">Not sure yet</option></select></label></div><label>Product link (optional)<input value={draft.url} onChange={e => update('url', e.target.value)} type="url" maxLength={2048}/></label><label>Why do you want it?<textarea value={draft.note} onChange={e => update('note', e.target.value)} maxLength={1000} placeholder="What would it change? Could you use something you own?"/></label><button type="submit" className="pg-primary">{item ? 'Save reflection & details' : 'Let it grow on me ↗'}</button>{item && <button type="button" onClick={onDone}>Cancel editing</button>}<small>Prices are estimates you confirm. Saving a link never opens a checkout.</small></form>
  </section>
}
