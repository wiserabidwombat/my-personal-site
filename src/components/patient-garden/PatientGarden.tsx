import { useCallback, useEffect, useRef, useState } from 'react'
import { budgetCheck, dayKey, harvest, initial, money, monthKey, recordPurchase, rewardEligible, spending, validateBackup, visit, waitDays } from './engine'
import type { Item, State } from './engine'
import { GardenScene } from './GardenScene'
import type { CatchEvent } from './GardenScene'
import { CapturePanel } from './CapturePanel'
import { SpendingPanel } from './SpendingPanel'
import { GardenShop } from './GardenShop'
import { PwaStatus } from './PwaStatus'
import './garden.css'
import './features.css'

const KEY = 'patient-garden-v1'
const tabs = ['Today', 'Waiting list', 'Garden', 'Spending', 'Settings'] as const
const tabIcons = ['M3 11 12 3l9 8M5 10v11h14V10M9 21v-7h6v7', 'M7 4h14v17H7zM3 8h4M3 13h4M3 18h4M11 9h6M11 14h6', 'M12 22V10M12 15C3 15 3 5 3 5s9 0 9 10Zm0-4C21 11 21 2 21 2s-9 0-9 9Z', 'M3 6h18v15H3zM3 6V3h15M16 12h5v5h-5z', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2']
function read(): State {
  const raw = localStorage.getItem(KEY)
  if (!raw) return initial()
  const parsed: unknown = JSON.parse(raw)
  if (!validateBackup(parsed)) throw Error('The saved garden could not be read. Export the existing data or restore a valid backup below.')
  return parsed
}
export function PatientGarden() {
  const [s, setS] = useState<State>(initial)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<typeof tabs[number]>('Today')
  const [message, setMessage] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [gardenView, setGardenView] = useState<'garden' | 'shop'>('garden')
  const [showCapture, setShowCapture] = useState(false)
  const [editing, setEditing] = useState<Item | undefined>()
  const opened = useRef(false), lastSaved = useRef<string | null>(null)
  const [catches, setCatches] = useState<CatchEvent[]>([])
  const catchShown = useCallback((id: string) => setCatches(events => events.filter(event => event.id !== id)), [])
  useEffect(() => {
    if (opened.current) return
    opened.current = true
    if (['text', 'title', 'url'].some(key => new URLSearchParams(window.location.search).has(key))) { setTab('Waiting list'); setShowCapture(true) }
    try {
      const previous = read(), saved = visit(previous), serialized = JSON.stringify(saved)
      localStorage.setItem(KEY, serialized); lastSaved.current = serialized; setS(saved)
      setCatches(saved.plants.flatMap(plant => {
        const growth = plant.growth - (previous.plants.find(p => p.id === plant.id)?.growth ?? plant.growth)
        return growth > 0 ? [{ id: `${plant.id}:${saved.tracking?.fed}`, plantId: plant.id, growth }] : []
      }))
      setReady(true)
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not read device storage.'); setBlocked(true) }
  }, [])
  function save(next: State) {
    try {
      if (localStorage.getItem(KEY) !== lastSaved.current) { setMessage('Your garden changed in another tab. Reload this page before saving so those changes are kept.'); return false }
      const serialized = JSON.stringify(next)
      localStorage.setItem(KEY, serialized); lastSaved.current = serialized; setS(next); setMessage('Saved on this device.'); return true
    } catch { setMessage('Could not save. Changes were not applied. Export a backup and check device storage.'); return false }
  }
  function exportSave() {
    try {
      const raw = localStorage.getItem(KEY) || (blocked ? '{}' : JSON.stringify(s)), url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }))
      const a = document.createElement('a'); a.href = url; a.download = `patient-garden-${dayKey()}.json`; a.click(); URL.revokeObjectURL(url)
    } catch { setMessage('Could not export this device’s data. Check browser storage access.') }
  }
  const now = new Date(), daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const spent = spending(s), remaining = s.budget - spent, waiting = s.items.filter(i => i.status === 'waiting')
  const level = 1 + Math.floor(s.xp / 100)
  function resolve(item: Item, status: 'skipped' | 'purchased') {
    let cents = item.cents
    if (status === 'purchased') {
      const input = window.prompt('Actual checkout total, including tax and shipping ($)', String(item.cents / 100))
      if (input === null) return
      cents = Math.round(Number(input) * 100)
      if (!Number.isSafeInteger(cents) || cents <= 0) { setMessage('Enter a valid purchase total.'); return }
    }
    const base = harvest(s)
    const bonus = status === 'skipped' && rewardEligible(s, item) && waitDays(item) >= 3 && !s.claims.includes(`skip:${item.id}`)
    const reverse = status === 'purchased' && item.status === 'skipped' && s.claims.includes(`skip:${item.id}`)
    let next: State = { ...base, items: base.items.map(i => i.id === item.id ? { ...i, status } : i), xp: base.xp + (bonus ? 15 : 0), dew: base.dew + (bonus ? 8 : 0) - (reverse ? 8 : 0), claims: bonus ? [...s.claims, `skip:${item.id}`] : s.claims }
    if (status === 'purchased') next = recordPurchase(next, { id: crypto.randomUUID(), itemId: item.id, name: item.name, cents, date: Date.now(), refund: false })
    save(next)
  }
  function checkIn() {
    const key = `check:${dayKey()}`
    if (s.claims.includes(key)) return
    const checked = budgetCheck(s)
    save({ ...checked, claims: [...checked.claims, key], xp: checked.xp + 2 })
  }
  function navigate(next: typeof tabs[number]) { setTab(next); window.scrollTo({ top: 0, behavior: 'instant' }) }
  function addWish() { setEditing(undefined); setShowCapture(true); navigate('Waiting list') }
  function editItem(item: Item) { setEditing(item); setShowCapture(true); navigate('Waiting list') }
  function water() { save({ ...s, watered: dayKey(), plants: s.plants.map(p => ({ ...p, growth: p.growth + 2 + Number(!!s.habitats?.includes('bog')) + Number(!!s.habitats?.includes('pond')) })) }) }
  function collect() { const next = harvest(s); if (save(next)) setMessage(next.xp > s.xp ? `Patience paid off: +${next.xp - s.xp} XP and +${next.dew - s.dew} dewdrops.` : 'No new patience milestones yet. Give your wishes a little more time.') }
  return <div className="pg">
    <header className="pg-header"><a href="/" className="pg-home">AT / EXPERIMENTS</a><span>YOUR PRIVATE PATCH</span></header>
    <section className="pg-title"><div><p className="pg-eyebrow">A LITTLE LESS BUYING. A LITTLE MORE GROWING.</p><h1>The Patient Garden<span>Give it time.<br/>Grow something instead.</span></h1></div><div className="pg-wallet"><strong>Level {level}</strong><span>{s.xp} gardener XP</span><b>✧ {s.dew} dewdrops</b></div></section>
    <nav className="pg-tabs" aria-label="Garden sections">{tabs.map((t, n) => <button key={t} aria-label={t} aria-current={tab === t ? 'page' : undefined} onClick={() => navigate(t)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={tabIcons[n]}/></svg><span>{t === 'Waiting list' ? 'Wishes' : t}</span></button>)}</nav>
    <p role="status" className="pg-message">{message}</p>
    <PwaStatus showHelp={tab === 'Settings'}/>
    {blocked ? <section className="pg-card"><h2>Protect your existing save</h2><p>{message}</p><button onClick={exportSave}>Export existing data</button><p>Restore a valid JSON backup below.</p>{importControl()}</section> : !ready ? <p>Opening your garden…</p> : <>
      {tab === 'Today' && <section className="pg-stats"><article><small>LEFT THIS MONTH</small><strong>{money(remaining)}</strong><span>of {money(s.budget)} · {money(spent)} spent</span><progress max={s.budget} value={Math.max(0, Math.min(spent, s.budget))}/></article><article><small>WEEKLY GUIDE</small><strong>{money(Math.round(s.budget * 7 / daysInMonth))}</strong><span>{spent <= s.budget * now.getDate() / daysInMonth ? 'You’re on pace. Keep tending.' : 'Ahead of pace. Give the next purchase time.'}</span></article><article><small>ROOM TO RECONSIDER</small><strong>{waiting.length} {waiting.length === 1 ? 'wish' : 'wishes'}</strong><span>{money(waiting.reduce((n, i) => n + i.cents, 0))} waiting · not cash saved</span></article></section>}
      {tab === 'Garden' && <section className="pg-garden"><div className="pg-section-title"><div><p className="pg-eyebrow">YOUR SMALL, WILD WORLD</p><h2>The patience patch</h2></div><button disabled={s.watered === dayKey()} onClick={water}>{s.watered === dayKey() ? '✓ Watered today' : '♧ Water the garden'}</button></div><div className="pg-garden-switch" role="group" aria-label="Garden view"><button aria-pressed={gardenView === 'garden'} onClick={() => setGardenView('garden')}>My garden</button><button aria-pressed={gardenView === 'shop'} onClick={() => setGardenView('shop')}>Shop & upgrades</button></div>{gardenView === 'garden' ? <GardenScene plants={s.plants} habitats={s.habitats} catches={catches} onCatchShown={catchShown}/> : <GardenShop state={s} onSave={save}/>}</section>}
      {tab === 'Today' && <section className="pg-today-actions" aria-label="Today’s actions"><div className="pg-today-primary"><h2>A little room to decide.</h2><p>Save the temptation. Give yourself time.</p><button className="pg-primary" onClick={addWish}>+ Add a wish</button><button onClick={() => { setShowCapture(false); navigate('Waiting list') }}>Review {waiting.length} {waiting.length === 1 ? 'wish' : 'wishes'} →</button></div><div className="pg-daily-care"><button disabled={s.watered === dayKey()} onClick={water}>{s.watered === dayKey() ? '✓ Watered today' : 'Water your plants'}</button><button onClick={collect}>Collect patience ✧</button></div><button className="pg-garden-shortcut" onClick={() => navigate('Garden')}>Visit your garden <span>{s.plants.length} {s.plants.length === 1 ? 'plant' : 'plants'} · {s.watered === dayKey() ? 'tended for today' : 'ready for a little care'} →</span></button></section>}
      {showCapture && <div className="pg-capture-screen" hidden={tab !== 'Waiting list'}><button className="pg-back" onClick={() => { setShowCapture(false); setEditing(undefined); window.scrollTo({ top: 0, behavior: 'instant' }) }}>← Back to wishes</button><CapturePanel key={editing?.id || 'new'} state={s} item={editing} onSave={save} onDone={() => { setEditing(undefined); setShowCapture(false); window.scrollTo({ top: 0, behavior: 'instant' }) }}/></div>}
      {tab === 'Waiting list' && !showCapture && <section className="pg-card pg-wish-list"><div className="pg-section-title"><h2>Letting it sit</h2><button onClick={addWish}>+ Add a wish</button></div>{!waiting.length && <div className="pg-empty">A little breathing room.<p>Add a wish, then give yourself time to decide.</p></div>}{waiting.map(i => <article className="pg-item" key={i.id}><div><span className="pg-tag">{i.kind} · {waitDays(i)} days waiting</span><h3>{i.name}</h3><p>{i.note || 'No reflection yet.'}</p><strong>{money(i.cents)}</strong>{/^https?:\/\//i.test(i.url) && <a className="pg-product-link" href={i.url} target="_blank" rel="noopener noreferrer">Product details ↗</a>}<small>Next milestone: {waitDays(i) < 1 ? '1 day' : waitDays(i) < 7 ? '7 days' : waitDays(i) < 30 ? '30 days' : 'fully grown'}</small></div><div className="pg-actions"><button onClick={() => editItem(i)} aria-label={`Edit ${i.name}`}>Edit reflection</button><button onClick={() => resolve(i, 'skipped')}>I’ll skip it</button><button onClick={() => resolve(i, 'purchased')}>I bought it</button></div></article>)}<details className="pg-resolved"><summary>Resolved wishes ({s.items.length - waiting.length})</summary>{s.items.filter(i => i.status !== 'waiting').map(i => <article className="pg-item" key={i.id}><div><h3>{i.name}</h3><small>{i.status} · {i.kind}</small></div><button onClick={() => editItem(i)}>Edit reflection</button></article>)}</details></section>}
      {tab === 'Spending' && <SpendingPanel state={s} onSave={save} onBuySkipped={id => { const item = s.items.find(i => i.id === id); if (item) resolve(item, 'purchased') }} onCheckIn={checkIn}/>}
      {tab === 'Settings' && <section className="pg-card pg-settings"><h2>A budget with breathing room</h2><form key={s.budget} onSubmit={e => { e.preventDefault(); const cents = Math.round(Number(new FormData(e.currentTarget).get('budget')) * 100); if (cents > 0 && Number.isSafeInteger(cents)) save({ ...s, budget: cents, budgets: { ...s.budgets, [monthKey()]: cents }, tracking: { ...(s.tracking || { since: Date.now(), fed: Date.now(), budgets: {} }), budgets: { ...s.tracking?.budgets, [monthKey()]: Math.min(s.tracking?.budgets[monthKey()] ?? s.budget, cents) } } }) }}><label>Monthly Amazon budget ($)<input name="budget" type="number" min="1" max="1000000" step="0.01" defaultValue={s.budget / 100} required/></label><button>Save budget</button></form><p>One monthly limit, with a weekly pacing guide. Needs count too. Unspent budget does not roll over. Budget changes update this month’s guide; reward eligibility uses the lowest budget set during the month. Settled bonuses keep their original limit.</p><h3>Your data stays here</h3><p>Your garden lives in this browser on this device. Clearing site data removes it. Export regularly, especially before switching phones or moving between a preview link and the live site.</p><button onClick={exportSave}>Export backup</button><label>Restore backup (replaces current garden){importControl()}</label><details><summary>How rewards work</summary><p>Wait 1 / 7 / 30 days for 5 / 15 / 40 XP and 2 / 5 / 15 dewdrops. Skipping after 3 days earns 15 XP and 8 dewdrops. Buying later reverses the skip currency. A reflection of at least 10 characters earns 5 XP once, even if you add it later. Item rewards are capped to the first 3 additions per day and 10 per month.</p><p>Watering adds 2 growth per plant, plus 1 for each owned habitat. Fertilizer adds 3. Bog beds unlock at level 4; ponds at level 8. All upgrades use game currency. No real-money purchases.</p><p>Confirm purchases in Spending to collect eligible bonuses for the previous complete tracked week and month. Corrections reconcile newer bonuses without removing levels. Insects feed plants when you return, with up to two days of catch-up.</p></details></section>}
    </>}
    <footer className="pg-footer">PATIENCE IS A PRACTICE, NOT A PERFECT STREAK. <a href="/">Back to Aaron’s site ↗</a></footer>
  </div>
  function importControl() {
    return <input type="file" accept="application/json,.json" aria-label="Import garden backup" onChange={async e => {
      const input = e.currentTarget, file = input.files?.[0]
      if (!file) return
      try {
        if (file.size > 5000000) throw Error()
        const parsed: unknown = JSON.parse(await file.text())
        if (!validateBackup(parsed)) throw Error()
        if (!window.confirm('Replace this device’s garden with this backup? Export the current garden first if you want to keep it.')) return
        const serialized = JSON.stringify(parsed); localStorage.setItem(KEY, serialized); lastSaved.current = serialized
        setS(parsed); setCatches([]); setEditing(undefined); setReady(true); setBlocked(false); setMessage('Backup restored.')
      } catch { setMessage('Could not restore this backup. Existing data was kept.') }
      finally { input.value = '' }
    }}/>
  }
}
