import { useState } from 'react'
import { dayKey, money, monthKey, recordPurchase, refunded, spending } from './engine'
import type { Purchase, State } from './engine'

export function SpendingPanel({ state, onSave, onBuySkipped, onCheckIn }: { state: State; onSave: (s: State) => boolean; onBuySkipped: (id: string) => void; onCheckIn: () => void }) {
  const [month, setMonth] = useState(monthKey())
  const [edit, setEdit] = useState<Purchase | null>(null)
  const [refundFor, setRefundFor] = useState<Purchase | null>(null)
  const [notice, setNotice] = useState('')
  const months = [...new Set([monthKey(), ...state.purchases.map(p => monthKey(p.date)), ...Object.keys(state.budgets || {}), ...Object.keys(state.tracking?.budgets || {})])].sort().reverse()
  const rows = state.purchases.filter(p => monthKey(p.date) === month).sort((a, b) => b.date - a.date)
  function newPurchase() { setEdit({ id: crypto.randomUUID(), name: '', cents: 0, date: Date.now(), refund: false }); setRefundFor(null); setNotice('') }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const values = new FormData(e.currentTarget)
    try {
      const date = new Date(`${values.get('date')}T12:00:00`).getTime()
      // A date-only entry for today uses the present instant, so morning entries aren't in the future.
      const timestamp = edit && String(values.get('date')) === dayKey(edit.date) ? edit.date : String(values.get('date')) === dayKey() ? Date.now() : date
      const record: Purchase = refundFor ? { id: crypto.randomUUID(), name: refundFor.name, cents: 0, date: timestamp, refund: true, refundOf: refundFor.id } : { ...edit!, date: timestamp }
      record.name = String(values.get('name') || record.name).trim()
      record.cents = Math.round(Number(values.get('amount')) * 100)
      const next = recordPurchase(state, record)
      const difference = next.dew - state.dew
      if (onSave(next)) { setEdit(null); setRefundFor(null); setNotice(`Record saved.${difference ? ` Budget bonus adjustment: ${difference > 0 ? '+' : ''}${difference} dewdrops.` : ''}`) }
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Could not save this record.') }
  }
  const editor = edit || refundFor
  return <section className="pg-card"><h2>An honest record</h2><p>Record checkout totals, correct mistakes, and log refunds when the money arrives.</p><div className="pg-section-title"><label>View month<select value={month} onChange={e => setMonth(e.target.value)}>{months.map(m => <option key={m} value={m}>{new Date(`${m}-01T12:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</option>)}</select></label><button onClick={newPurchase}>+ Log a purchase</button></div>
    <div className="pg-history-summary"><span>Purchases <strong>{money(rows.filter(p => !p.refund).reduce((n, p) => n + p.cents, 0))}</strong></span><span>Refunds <strong>{money(rows.filter(p => p.refund).reduce((n, p) => n + p.cents, 0))}</strong></span><span>Net spending <strong>{money(spending(state, month))}</strong></span><span>Budget <strong>{state.budgets?.[month] ? money(state.budgets[month]) : state.tracking?.budgets[month] ? `${money(state.tracking.budgets[month])} reward baseline` : 'Not recorded'}</strong></span></div>
    {editor && <form className="pg-record-editor" key={`${editor.id}:${!!refundFor}`} onSubmit={submit}><h3>{refundFor ? `Refund for ${refundFor.name}` : state.purchases.some(p => p.id === edit?.id) ? 'Correct this record' : 'Log a purchase'}</h3>{!refundFor && <label>Record name<input name="name" defaultValue={editor.name} required maxLength={150}/></label>}<div className="pg-fields"><label>{refundFor ? 'Refund amount ($)' : 'Record amount ($)'}<input name="amount" type="number" min="0.01" step="0.01" required inputMode="decimal" defaultValue={refundFor ? ((refundFor.cents - refunded(state, refundFor.id)) / 100).toFixed(2) : editor.cents ? (editor.cents / 100).toFixed(2) : ''}/></label><label>{refundFor || editor.refund ? 'Refund received on' : 'Purchased on'}<input name="date" type="date" max={dayKey()} defaultValue={refundFor ? dayKey() : dayKey(editor.date)} required/></label></div>{refundFor && <small>Up to {money(refundFor.cents - refunded(state, refundFor.id))} remains refundable. Partial refunds are welcome.</small>}<div className="pg-actions"><button type="submit">Save record</button><button type="button" onClick={() => { setEdit(null); setRefundFor(null) }}>Cancel</button></div></form>}
    <p className="pg-inline-notice" role="status">{notice}</p>
    {!rows.length && <p className="pg-empty">No spending recorded for this month.</p>}
    {rows.map(p => <article className="pg-item" key={p.id}><div><h3>{p.name}</h3><small>{new Date(p.date).toLocaleDateString()} · {p.refund ? 'Refund received' : 'Purchase'}</small>{!p.refund && refunded(state, p.id) > 0 && <small>{money(refunded(state, p.id))} refunded so far</small>}</div><strong>{p.refund ? '−' : ''}{money(p.cents)}</strong><div className="pg-actions"><button aria-label={`Correct ${p.refund ? 'refund for ' : ''}${p.name}`} onClick={() => { setEdit(p); setRefundFor(null); setNotice('') }}>Correct</button>{!p.refund && refunded(state, p.id) < p.cents && <button aria-label={`Refund ${p.name}`} onClick={() => { setRefundFor(p); setEdit(null); setNotice('') }}>Add refund</button>}</div></article>)}
    <details className="pg-month-history"><summary>Monthly history</summary><div className="pg-history-table"><table><thead><tr><th>Month</th><th>Budget</th><th>Net spent</th><th>Remaining</th></tr></thead><tbody>{months.map(m => { const budget = state.budgets?.[m] ?? state.tracking?.budgets[m]; return <tr key={m}><th scope="row"><button onClick={() => setMonth(m)}>{m}</button></th><td data-label="Budget">{budget ? money(budget) : '—'}</td><td data-label="Net spent">{money(spending(state, m))}</td><td>{budget ? money(budget - spending(state, m)) : '—'}</td></tr> })}</tbody></table></div></details>
    <p className="pg-inline-notice">Corrections can change a previously collected budget bonus. Dewdrops adjust; earned levels stay. Bonuses collected in older starter versions have no adjustment history.</p><h3>Skipped wishes</h3>{state.items.filter(i => i.status === 'skipped').map(i => <article className="pg-item" key={i.id}><span>{i.name} · {money(i.cents)}</span><button onClick={() => onBuySkipped(i.id)}>Bought it later</button></article>)}<button disabled={state.claims.includes(`check:${dayKey()}`)} onClick={onCheckIn}>Confirm purchases & collect budget bonuses</button>
  </section>
}
