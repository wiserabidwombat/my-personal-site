import { describe, expect, it } from 'vitest'
import { budgetCheck, buyHabitat, harvest, initial, plantCapacity, recordPurchase, refunded, spending, validateBackup, visit } from './engine'
describe('patient garden', () => {
  it('records partial refunds and rejects over-refunds or totals below refunds', () => {
    const now = Date.now()
    const purchase = { id: 'p', name: 'Lamp', cents: 5000, date: now - 86400000, refund: false }
    let s = recordPurchase(initial(), purchase)
    s = recordPurchase(s, { id: 'r1', refundOf: 'p', name: 'Lamp', cents: 1000, date: now, refund: true })
    s = recordPurchase(s, { id: 'r2', refundOf: 'p', name: 'Lamp', cents: 1500, date: now, refund: true })
    expect(refunded(s, 'p')).toBe(2500)
    expect(() => recordPurchase(s, { ...purchase, cents: 2000 })).toThrow()
    expect(() => recordPurchase(s, { id: 'r3', refundOf: 'p', name: 'Lamp', cents: 3000, date: now, refund: true })).toThrow()
    expect(validateBackup(s)).toBe(true)
  })
  it('preserves old full refunds and rejects corrupt refund relationships', () => {
    const s = initial(), now = Date.now()
    s.purchases = [{ id: 'p', name: 'Lamp', cents: 5000, date: now - 10, refund: false }, { id: 'refund:p', name: 'Lamp', cents: 5000, date: now, refund: true }]
    expect(refunded(s, 'p')).toBe(5000); expect(validateBackup(s)).toBe(true)
    expect(validateBackup({ ...s, purchases: [...s.purchases, { id: 'bad', name: 'Lamp', cents: 1, date: now, refund: true, refundOf: 'missing' }] })).toBe(false)
  })
  it('reconciles corrected bonuses without farming XP across repeated corrections', () => {
    const now = new Date(2026, 9, 2).getTime(), purchase = { id: 'p', name: 'Lamp', cents: 9000, date: new Date(2026, 8, 15).getTime(), refund: false }
    let s = initial()
    s.tracking = { since: new Date(2026, 7, 1).getTime(), fed: now, budgets: { '2026-09': 10000 } }
    s.purchases = [purchase]; s = budgetCheck(s, now)
    expect(s.dew).toBe(40)
    s = recordPurchase(s, { ...purchase, cents: 11000 }); expect(s.dew).toBe(0); expect(s.xp).toBe(100)
    s = recordPurchase(s, purchase); expect(s.dew).toBe(40); expect(s.xp).toBe(100)
    expect(recordPurchase(s, purchase).dew).toBe(40)
  })
  it('enforces habitat prerequisites, levels, currency, and capacity', () => {
    let s = initial(); s.dew = 500
    expect(() => buyHabitat(s, 'bog')).toThrow()
    s.xp = 700; expect(() => buyHabitat(s, 'pond')).toThrow()
    s = buyHabitat(s, 'bog'); expect(plantCapacity(s)).toBe(12); expect(s.dew).toBe(420)
    s = buyHabitat(s, 'pond'); expect(plantCapacity(s)).toBe(16); expect(s.dew).toBe(270)
    expect(() => buyHabitat(s, 'pond')).toThrow(); expect(validateBackup(s)).toBe(true)
    expect(validateBackup({ ...s, habitats: ['pond'] })).toBe(false)
  })
  it('awards a completed tracked month once and respects its frozen budget', () => {
    const s = initial(), now = new Date(2026, 9, 2).getTime()
    s.tracking = { since: new Date(2026, 7, 1).getTime(), fed: now, budgets: { '2026-09': 10000, '2026-10': 20000 } }
    s.purchases = [{ id: 'p', name: 'Thing', cents: 9000, date: new Date(2026, 8, 15).getTime(), refund: false }]
    const checked = budgetCheck(s, now)
    expect(checked.xp).toBe(100); expect(checked.dew).toBe(40)
    expect(budgetCheck(checked, now)).toEqual(checked)
    expect(budgetCheck({ ...s, purchases: [{ ...s.purchases[0], cents: 11000 }] }, now).dew).toBe(0)
  })
  it('does not award a month the app did not track', () => {
    const s = initial(), now = new Date(2026, 9, 2).getTime()
    s.tracking = { since: new Date(2026, 8, 15).getTime(), fed: now, budgets: { '2026-09': 20000 } }
    expect(budgetCheck(s, now).dew).toBe(0)
  })
  it('awards a completed week once and checks cumulative pace', () => {
    const s = initial(), now = new Date(2026, 9, 20).getTime()
    s.tracking = { since: new Date(2026, 9, 1).getTime(), fed: now, budgets: { '2026-10': 20000 } }
    const checked = budgetCheck(s, now)
    expect(checked.dew).toBe(13); expect(checked.xp).toBe(35)
    expect(budgetCheck(checked, now)).toEqual(checked)
  })
  it('caps catch-up growth and cannot reroll a visit', () => {
    const now = Date.now(), s = initial()
    s.tracking!.fed = now - 20 * 86400000
    const advanced = visit(s, now)
    expect(advanced.plants[0].growth).toBeLessThanOrEqual(4)
    expect(visit(advanced, now)).toEqual(advanced)
  })
  it('awards elapsed milestones once, including when resolving a purchase', () => {
    const now = Date.now(), s = initial()
    s.items.push({ id: 'wish', name: 'Thing', url: '', cents: 5000, kind: 'want', note: '', added: now - 31 * 86400000, status: 'waiting', rewarded: [] })
    const earned = harvest(s, now)
    expect(earned.xp).toBe(60); expect(earned.dew).toBe(22)
    expect(harvest(earned, now)).toEqual(earned)
  })
  it('counts refunds when received rather than rewriting prior months', () => {
    const s = initial()
    s.purchases = [{ id: 'p', name: 'Thing', cents: 5000, date: new Date(2026, 8, 15).getTime(), refund: false }, { id: 'r', name: 'Thing', cents: 5000, date: new Date(2026, 9, 15).getTime(), refund: true }]
    expect(spending(s, '2026-09')).toBe(5000); expect(spending(s, '2026-10')).toBe(-5000)
  })
  it('rejects corrupt backups and accepts a valid save', () => {
    expect(validateBackup(initial())).toBe(true)
    expect(validateBackup({ ...initial(), items: [null] })).toBe(false)
    expect(validateBackup({ ...initial(), budget: -1 })).toBe(false)
  })
  it('caps item rewards on high-volume days', () => {
    const s = initial(), now = Date.now()
    s.items = Array.from({ length: 8 }, (_, n) => ({ id: String(n), name: String(n), url: '', cents: 100, kind: 'want', note: '', added: now - 2 * 86400000, status: 'waiting', rewarded: [] }))
    expect(harvest(s, now).dew).toBe(6)
  })
})
