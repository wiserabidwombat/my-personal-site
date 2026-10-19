export type Item = { id: string; name: string; url: string; cents: number; note: string; kind: 'want' | 'need' | 'unsure'; added: number; status: 'waiting' | 'skipped' | 'purchased'; rewarded: number[]; reflectionRewarded?: boolean }
export type Purchase = { id: string; itemId?: string; name: string; cents: number; date: number; refund: boolean; refundOf?: string }
export type Pot = 'terracotta' | 'moss' | 'glazed'
export type Plant = { id: string; species: string; planted: number; growth: number; pot?: Pot; container?: 'pot' | 'bog' }
export type BudgetAward = { id: string; start: number; end: number; limit: number; monthly: boolean; qualified: boolean; everQualified: boolean }
export type State = { version: 1; budget: number; items: Item[]; purchases: Purchase[]; xp: number; dew: number; plants: Plant[]; watered: string; claims: string[]; tracking?: { since: number; budgets: Record<string, number>; fed: number }; budgets?: Record<string, number>; awards?: BudgetAward[]; habitats?: ('bog' | 'pond')[]; pots?: Pot[] }
export const initial = (): State => ({ version: 1, budget: 20000, items: [], purchases: [], xp: 0, dew: 0, plants: [{ id: 'starter', species: 'Sundew', planted: Date.now(), growth: 0 }], watered: '', claims: [], tracking: { since: Date.now(), budgets: { [monthKey()]: 20000 }, fed: Date.now() } })
export const dayKey = (time = Date.now()) => { const d = new Date(time); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
export const monthKey = (time = Date.now()) => dayKey(time).slice(0, 7)
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
export function spending(s: State, month = monthKey()) { return s.purchases.filter(p => monthKey(p.date) === month).reduce((sum, p) => sum + (p.refund ? -p.cents : p.cents), 0) }
export function waitDays(item: Item, now = Date.now()) { return Math.max(0, Math.floor((now - item.added) / 86400000)) }
export function rewardEligible(s: State, item: Item) {
  const ordered = [...s.items].sort((a, b) => a.added - b.added)
  return ordered.filter(i => monthKey(i.added) === monthKey(item.added)).slice(0, 10).some(i => i.id === item.id) && ordered.filter(i => dayKey(i.added) === dayKey(item.added)).slice(0, 3).some(i => i.id === item.id)
}
export function visit(s: State, now = Date.now()): State {
  const tracking = s.tracking || { since: now, budgets: {}, fed: now }
  const elapsed = Math.min(2, Math.max(0, Math.floor((now - tracking.fed) / 86400000)))
  // Deterministic per plant/day: reopening cannot reroll catches. Catching only grows plants.
  const plants = s.plants.map(p => {
    let growth = p.growth
    for (let n = 0; n < elapsed; n++) {
      const seed = `${p.id}:${dayKey(tracking.fed + (n + 1) * 86400000)}`
      const hash = [...seed].reduce((v, c) => (v * 31 + c.charCodeAt(0)) >>> 0, 0)
      const tick = tracking.fed + (n + 1) * 86400000
      const lastWater = new Date(`${s.watered}T00:00:00`).getTime()
      if (p.planted <= tick && tick - lastWater <= 2 * 86400000 && hash % 100 < Math.min(75, 30 + p.growth)) growth += 2
    }
    return { ...p, growth }
  })
  return { ...s, plants, budgets: { ...s.budgets, [monthKey(now)]: s.budgets?.[monthKey(now)] ?? s.budget }, tracking: { ...tracking, budgets: { ...tracking.budgets, [monthKey(now)]: tracking.budgets[monthKey(now)] ?? s.budget }, fed: elapsed ? now : tracking.fed } }
}
export function budgetCheck(s: State, now = Date.now()): State {
  const base = visit(s, now), tracking = base.tracking!
  const d = new Date(now), month = monthKey(now)
  const claims = [...base.claims]
  const awards = [...(base.awards || [])]
  let xp = base.xp, dew = base.dew
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7))
  const start = new Date(monday.getTime()); start.setDate(start.getDate() - 7)
  if (monthKey(start.getTime()) === month && tracking.since <= start.getTime()) {
    const key = `week:${dayKey(start.getTime())}`
    if (!claims.includes(key)) {
      claims.push(key)
      const total = s.purchases.filter(p => monthKey(p.date) === month && p.date < monday.getTime()).reduce((n, p) => n + (p.refund ? -p.cents : p.cents), 0)
      const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      xp += 10; dew += 3
      const limit = tracking.budgets[month] * (monday.getDate() - 1) / days
      const qualified = total <= limit
      awards.push({ id: key, start: new Date(d.getFullYear(), d.getMonth(), 1).getTime(), end: monday.getTime(), limit, monthly: false, qualified, everQualified: qualified })
      if (qualified) { xp += 25; dew += 10 }
    }
  }
  const previousStart = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime(), previous = monthKey(previousStart)
  const key = `month:${previous}`
  if (tracking.since <= previousStart && tracking.budgets[previous] && !claims.includes(key)) {
    claims.push(key)
    const qualified = spending(s, previous) <= tracking.budgets[previous]
    awards.push({ id: key, start: previousStart, end: new Date(d.getFullYear(), d.getMonth(), 1).getTime(), limit: tracking.budgets[previous], monthly: true, qualified, everQualified: qualified })
    if (qualified) { xp += 100; dew += 40 }
  }
  return { ...base, claims, awards, xp, dew }
}
export function harvest(s: State, now = Date.now()): State {
  let xp = s.xp, dew = s.dew
  const items = s.items.map(item => {
    if (item.status !== 'waiting' || !rewardEligible(s, item)) return item
    const rewarded = [...item.rewarded]
    for (const [days, x, d] of [[1, 5, 2], [7, 15, 5], [30, 40, 15]]) {
      if (waitDays(item, now) >= days && !rewarded.includes(days)) { rewarded.push(days); xp += x; dew += d }
    }
    return { ...item, rewarded }
  })
  return { ...s, items, xp, dew }
}
export function validateBackup(value: unknown): value is State {
  if (!value || typeof value !== 'object') return false
  const s = value as State
  const integer = (n: unknown) => Number.isSafeInteger(n) && Number(n) >= 0
  const stamp = (n: unknown) => integer(n) && Number(n) <= Date.now()
  const budgets = (v: unknown) => !!v && typeof v === 'object' && !Array.isArray(v) && Object.entries(v).every(([k, n]) => /^\d{4}-(0[1-9]|1[0-2])$/.test(k) && integer(n) && n > 0)
  return (!s.budgets || budgets(s.budgets)) && (!s.pots || (Array.isArray(s.pots) && s.pots.every(p => ['terracotta', 'moss', 'glazed'].includes(p)))) && (!s.habitats || (Array.isArray(s.habitats) && s.habitats.every(h => ['bog', 'pond'].includes(h)) && (!s.habitats.includes('pond') || s.habitats.includes('bog')))) && (!s.awards || (Array.isArray(s.awards) && s.awards.every(a => a && typeof a.id === 'string' && stamp(a.start) && stamp(a.end) && a.end > a.start && Number.isFinite(a.limit) && a.limit >= 0 && typeof a.monthly === 'boolean' && typeof a.qualified === 'boolean' && typeof a.everQualified === 'boolean'))) && (!s.tracking || (stamp(s.tracking.since) && stamp(s.tracking.fed) && budgets(s.tracking.budgets))) && s.version === 1 && integer(s.budget) && s.budget > 0 && integer(s.xp) && Number.isSafeInteger(s.dew) &&
    typeof s.watered === 'string' && Array.isArray(s.claims) && s.claims.every(k => typeof k === 'string') &&
    Array.isArray(s.items) && new Set(s.items.map(i => i?.id)).size === s.items.length && s.items.every(i => i && typeof i.id === 'string' && typeof i.name === 'string' && typeof i.url === 'string' && typeof i.note === 'string' && (i.reflectionRewarded === undefined || typeof i.reflectionRewarded === 'boolean') && integer(i.cents) && stamp(i.added) && ['need', 'want', 'unsure'].includes(i.kind) && ['waiting', 'skipped', 'purchased'].includes(i.status) && Array.isArray(i.rewarded) && i.rewarded.every(n => [1, 7, 30].includes(n))) &&
    Array.isArray(s.purchases) && new Set(s.purchases.map(p => p?.id)).size === s.purchases.length && s.purchases.every(p => p && typeof p.id === 'string' && typeof p.name === 'string' && integer(p.cents) && stamp(p.date) && typeof p.refund === 'boolean' && (p.refundOf === undefined || (typeof p.refundOf === 'string' && s.purchases.some(original => original && original.id === p.refundOf && !original.refund)))) && s.purchases.filter(p => !p.refund).every(p => refunded(s, p.id) <= p.cents) &&
    Array.isArray(s.plants) && s.plants.length > 0 && new Set(s.plants.map(p => p?.id)).size === s.plants.length && s.plants.every(p => p && typeof p.id === 'string' && ['Sundew', 'Flytrap', 'Pitcher'].includes(p.species) && stamp(p.planted) && integer(p.growth) && (p.pot === undefined || ['terracotta', 'moss', 'glazed'].includes(p.pot)) && (p.container === undefined || ['pot', 'bog'].includes(p.container)))
}

export function refunded(s: State, purchaseId: string) { return s.purchases.filter(p => p.refund && (p.refundOf === purchaseId || p.id === `refund:${purchaseId}`)).reduce((n, p) => n + p.cents, 0) }
export function reconcileAwards(s: State): State {
  let xp = s.xp, dew = s.dew
  const awards = (s.awards || []).map(a => {
    const total = s.purchases.filter(p => p.date >= a.start && p.date < a.end).reduce((n, p) => n + (p.refund ? -p.cents : p.cents), 0)
    const qualified = total <= a.limit
    if (qualified !== a.qualified) dew += (qualified ? 1 : -1) * (a.monthly ? 40 : 10)
    if (qualified && !a.everQualified) xp += a.monthly ? 100 : 25
    return { ...a, qualified, everQualified: a.everQualified || qualified }
  })
  return { ...s, awards, xp, dew }
}
export function recordPurchase(s: State, record: Purchase): State {
  if (!record.name.trim() || !Number.isSafeInteger(record.cents) || record.cents <= 0 || !Number.isFinite(record.date) || record.date > Date.now() || record.date < 0) throw Error('Enter a name, a positive amount, and a date no later than today.')
  const previous = s.purchases.find(p => p.id === record.id)
  if (previous && (previous.refund !== record.refund || previous.refundOf !== record.refundOf)) throw Error('A correction cannot change a purchase into a refund.')
  const purchases = previous ? s.purchases.map(p => p.id === record.id ? record : p) : [...s.purchases, record]
  const next = { ...s, purchases }
  if (record.refund) {
    const parentId = record.refundOf || (record.id.startsWith('refund:') ? record.id.slice(7) : '')
    const original = purchases.find(p => p.id === parentId && !p.refund)
    if (!original || record.date < original.date || refunded(next, original.id) > original.cents) throw Error('Refunds must follow the purchase date and cannot exceed its total.')
  } else {
    if (refunded(next, record.id) > record.cents) throw Error('The purchase total cannot be less than its recorded refunds.')
    if (purchases.some(p => p.refund && (p.refundOf === record.id || p.id === `refund:${record.id}`) && p.date < record.date)) throw Error('The purchase date must be on or before its refunds.')
  }
  return reconcileAwards(next)
}
export const habitats = [
  { id: 'bog' as const, name: 'Bog bed', level: 4, cost: 80, description: 'A shared mossy bed, space for 12 plants, and +1 growth when watering.' },
  { id: 'pond' as const, name: 'Lily pond', level: 8, cost: 150, description: 'Water lilies and dragonflies, space for 16 plants, and another +1 watering growth. Requires the bog bed.' },
]
export const potStyles = [
  { id: 'terracotta' as const, name: 'Terracotta', cost: 0, level: 1 },
  { id: 'moss' as const, name: 'Moss-covered', cost: 15, level: 2 },
  { id: 'glazed' as const, name: 'Blue glaze', cost: 30, level: 3 },
]
export const plantCapacity = (s: State) => s.habitats?.includes('pond') ? 16 : s.habitats?.includes('bog') ? 12 : 8
export function buyHabitat(s: State, id: 'bog' | 'pond'): State {
  const h = habitats.find(h => h.id === id)!
  if (s.habitats?.includes(id)) throw Error('You already own this habitat.')
  if (Math.floor(s.xp / 100) + 1 < h.level || s.dew < h.cost || (id === 'pond' && !s.habitats?.includes('bog'))) throw Error('Reach the required level and save enough dewdrops first.')
  return { ...s, dew: s.dew - h.cost, habitats: [...(s.habitats || []), id] }
}
