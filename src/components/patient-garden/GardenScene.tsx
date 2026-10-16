import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Plant } from './engine'
import './scene.css'

type InsectKind = 'gnat' | 'fly' | 'moth'
export type CatchEvent = { id: string; plantId: string; growth: number }
type ActiveCatch = { id: string; plantId: string; growth: number; preview: boolean }

function Insect({ kind }: { kind: InsectKind }) {
  return <svg className={`pg-insect-art pg-insect-${kind}`} viewBox="0 0 48 40" aria-hidden="true">
    <g className="pg-insect-wings" fill={kind === 'moth' ? '#d5b786' : '#f0f6e9'} stroke={kind === 'moth' ? '#9a7954' : '#9baea2'} strokeWidth="1.3">
      {kind === 'moth' ? <><path d="M23 19C1-4 0 29 19 30Z"/><path d="M25 19C47-4 48 29 29 30Z"/><circle cx="12" cy="20" r="3" fill="#a2835d"/><circle cx="36" cy="20" r="3" fill="#a2835d"/></> : <><ellipse cx="15" cy="14" rx={kind === 'gnat' ? 5 : 8} ry="10" transform="rotate(-34 15 14)"/><ellipse cx="33" cy="14" rx={kind === 'gnat' ? 5 : 8} ry="10" transform="rotate(34 33 14)"/></>}
    </g>
    <g fill="none" stroke="#45564a" strokeWidth="1.5" strokeLinecap="round"><path d="M21 23L13 28M27 23L35 28M22 27L17 34M26 27L31 34M22 12L18 7M26 12L30 7"/></g>
    <ellipse cx="24" cy="24" rx={kind === 'gnat' ? 2.5 : 4} ry="9" fill={kind === 'moth' ? '#8c6844' : '#45564a'}/><circle cx="24" cy="14" r="4" fill="#45564a"/>
    {kind === 'fly' && <><circle cx="21" cy="13" r="2" fill="#b87b60"/><circle cx="27" cy="13" r="2" fill="#b87b60"/></>}
  </svg>
}

function PlantArt({ plant, catching }: { plant: Plant; catching: boolean }) {
  return <svg className={`pg-botanical ${catching ? 'pg-catching' : ''}`} viewBox="0 0 160 190" aria-hidden="true">
    <ellipse cx="80" cy="180" rx="48" ry="6" fill="#5b6f40" opacity=".12"/>
    <g className="pg-foliage" style={{ transform: `scale(${Math.min(1.15, .78 + plant.growth / 150)})` }}>
      <path d="M80 151Q61 116 35 119Q39 145 80 151M80 153Q102 118 128 123Q116 150 80 153" fill="#65864b"/>
      {plant.species === 'Flytrap' ? <>
        <path d="M80 155Q76 97 81 58M73 151Q53 115 38 98M87 153Q108 126 123 113" fill="none" stroke="#6b8b49" strokeWidth="7"/>
        <g className="pg-trap-head"><g className="pg-jaw-left"><path d="M80 67Q39 73 43 37Q67 32 80 67" fill="#8da85a" stroke="#597d40" strokeWidth="2"/><path d="M76 62Q49 64 49 42Q65 44 76 62" fill="#c57d6c"/><path d="M43 39L35 31M50 35L46 25M59 37L58 26M69 43L72 32" stroke="#d3d9a2" strokeWidth="2"/></g><g className="pg-jaw-right"><path d="M80 67Q121 73 117 37Q93 32 80 67" fill="#8da85a" stroke="#597d40" strokeWidth="2"/><path d="M84 62Q111 64 111 42Q95 44 84 62" fill="#c57d6c"/><path d="M117 39L125 31M110 35L114 25M101 37L102 26M91 43L88 32" stroke="#d3d9a2" strokeWidth="2"/></g></g>
        <path d="M39 105Q12 100 19 80Q36 78 39 105M39 105Q62 90 50 77Q35 83 39 105M122 119Q102 108 110 91Q128 96 122 119M122 119Q145 110 140 96Q124 99 122 119" fill="#8fa65c" stroke="#658348" strokeWidth="2"/>
      </> : plant.species === 'Pitcher' ? <>
        <path d="M80 158Q70 123 59 92M85 156Q98 129 112 112" fill="none" stroke="#64834c" strokeWidth="5"/>
        <path d="M64 61Q43 102 56 133Q72 155 87 131Q96 102 82 61Z" fill="#819957" stroke="#5e7b49" strokeWidth="2"/>
        <path d="M67 70Q58 104 65 128" fill="none" stroke="#b4bd79" strokeWidth="4"/>
        <ellipse cx="73" cy="62" rx="17" ry="9" fill="#b77e6a"/><ellipse cx="73" cy="62" rx="11" ry="5" fill="#475c3d"/>
        <g className="pg-pitcher-lid"><path d="M81 57Q104 31 72 30Q55 33 60 42Q74 48 81 57" fill="#9aa864" stroke="#6b854b" strokeWidth="2"/></g>
        <path d="M104 103Q92 132 107 149Q124 153 126 133L124 103Z" fill="#a58b65" stroke="#71824d" strokeWidth="2"/><ellipse cx="114" cy="103" rx="12" ry="6" fill="#b87a67"/><ellipse cx="114" cy="103" rx="8" ry="3" fill="#4f603e"/>
      </> : <>
        <path d="M80 157Q48 116 37 86M80 156Q62 104 64 69M81 158Q91 101 102 76M83 157Q115 123 126 100" fill="none" stroke="#729254" strokeWidth="5"/>
        <g className="pg-sundew-frond"><ellipse cx="65" cy="66" rx="14" ry="28" transform="rotate(-12 65 66)" fill="#8da367" stroke="#b1796e" strokeWidth="2"/>
          {Array.from({ length: 9 }, (_, n) => <g key={n}><path d={`M${54 + n % 3 * 10} ${46 + Math.floor(n / 3) * 17}l${n % 2 ? 7 : -7} -7`} stroke="#ac746e" strokeWidth="1.4"/><circle cx={54 + n % 3 * 10 + (n % 2 ? 7 : -7)} cy={39 + Math.floor(n / 3) * 17} r="2.7" fill="#d19a8b"/></g>)}
        </g>
        <ellipse cx="35" cy="86" rx="11" ry="25" transform="rotate(-35 35 86)" fill="#91a56b" stroke="#b87970" strokeWidth="3" strokeDasharray="1 6"/>
        <ellipse cx="105" cy="75" rx="12" ry="27" transform="rotate(23 105 75)" fill="#91a56b" stroke="#b87970" strokeWidth="3" strokeDasharray="1 6"/>
        <ellipse cx="128" cy="100" rx="11" ry="22" transform="rotate(42 128 100)" fill="#91a56b" stroke="#b87970" strokeWidth="3" strokeDasharray="1 6"/>
      </>}
    </g>
    <ellipse className="pg-soil-mound" cx="80" cy="161" rx="48" ry="12" fill="#77834f"/><g className={`pg-pot-art pg-pot-${plant.pot || 'terracotta'}`}><path d="M48 153H112L103 181H57Z" fill="#b98262"/><path d="M51 155H109L105 168H55Z" fill="#c79472"/><rect x="44" y="146" width="72" height="12" rx="3" fill="#d4a180"/><path d="M50 148H106" stroke="#e6bba0" strokeWidth="2"/></g>
  </svg>
}

const insectKinds: InsectKind[] = ['gnat', 'fly', 'moth']
export function GardenScene({ plants, catches, onCatchShown, habitats = [] }: { plants: Plant[]; catches: CatchEvent[]; onCatchShown: (id: string) => void; habitats?: ('bog' | 'pond')[] }) {
  const [active, setActive] = useState<ActiveCatch | null>(null)
  const [paused, setPaused] = useState(false)
  const [announcement, setAnnouncement] = useState('Gnats, flies, and moths wander through your garden.')
  const previewIndex = useRef(0)
  const next = catches[0]
  useEffect(() => {
    if (active || !next) return
    const timer = window.setTimeout(() => {
      setActive({ ...next, preview: false })
      const plant = plants.find(p => p.id === next.plantId)
      setAnnouncement(`${plant?.species || 'Your plant'} caught food while you were away. +${next.growth} growth.`)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [active, next, plants])
  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => { if (!active.preview) onCatchShown(active.id); setActive(null) }, 7000)
    return () => window.clearTimeout(timer)
  }, [active, onCatchShown])
  function preview() {
    const plant = plants[previewIndex.current++ % plants.length]
    if (!plant) return
    setActive({ id: `preview-${Date.now()}`, plantId: plant.id, growth: 0, preview: true })
    setAnnouncement(`Preview: ${plant.species} ${plant.species === 'Flytrap' ? 'snaps shut' : plant.species === 'Pitcher' ? 'catches a fly in its pitcher' : 'curls around a gnat'}. No growth is awarded for previews.`)
  }
  return <div className={`pg-living-garden ${paused ? 'pg-motion-paused' : ''} ${habitats.includes('bog') ? 'pg-has-bog' : ''} ${habitats.includes('pond') ? 'pg-has-pond' : ''}`}>
    <div className="pg-habitat-controls"><span className="pg-habitat-label"><span/> A living little ecosystem</span><button type="button" aria-pressed={paused} onClick={() => setPaused(v => !v)}>{paused ? 'Resume motion' : 'Pause motion'}</button></div>
    <div className="pg-scene pg-living-scene" role="group" aria-label="Carnivorous garden with flying gnats, flies, and moths">
      <span className="pg-sun" aria-hidden="true"/><div className="pg-reeds" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      <div className="pg-insect-layer" aria-hidden="true">{Array.from({ length: Math.min(8, 3 + plants.length) }, (_, n) => <span key={n} className={`pg-airborne pg-flight-${n % 3}`} style={{ '--flight-delay': `${-n * 3.7}s`, '--flight-time': `${13 + n * 2}s`, left: `${9 + n * 11}%`, top: `${14 + n % 3 * 18}%` } as CSSProperties}><Insect kind={insectKinds[n % 3]}/></span>)}</div>
      {plants.map(plant => {
        const feeding = active?.plantId === plant.id
        const kind = plant.species === 'Sundew' ? 'gnat' : plant.species === 'Pitcher' ? 'fly' : 'moth'
        return <div className={`pg-plant pg-living-plant ${plant.species.toLowerCase()} ${plant.container === 'bog' && habitats.includes('bog') ? 'pg-in-bog' : ''}`} key={plant.id}>
          <div className="pg-plant-portrait"><PlantArt plant={plant} catching={feeding}/>{feeding && <span key={active.id} className={`pg-catch-insect pg-catch-${plant.species.toLowerCase()}`} aria-hidden="true"><Insect kind={kind}/></span>}{feeding && <span className="pg-growth-bubble" key={`bubble-${active.id}`}>{active.preview ? 'A little demonstration' : `+${active.growth} growth`}</span>}</div>
          <strong>{plant.species}</strong><small>{plant.growth < 15 ? 'Seedling' : plant.growth < 40 ? 'Juvenile' : 'Mature'} · {plant.growth} growth</small>
        </div>
      })}
      <div className="pg-ground" aria-hidden="true"/>{habitats.includes('pond') && <div className="pg-lily-pond"><svg viewBox="0 0 360 130" role="img" aria-label="Lily pond surrounded by stones and reeds"><ellipse cx="180" cy="75" rx="165" ry="48" fill="#a9b49a"/><ellipse cx="180" cy="69" rx="153" ry="41" fill="#80aaa6"/><ellipse className="pg-pond-ripple" cx="181" cy="69" rx="125" ry="29" fill="none" stroke="#b6d2bc" strokeWidth="2"/><path d="M116 65A30 18 0 1 1 114 62L131 70Z" fill="#6e925d"/><path d="M226 84A23 13 0 1 1 224 81L239 86Z" fill="#88a66c"/><path d="M116 61Q98 48 111 40L120 51Q125 32 133 44L129 58Q145 43 147 56Q137 67 116 61" fill="#e1b4b2"/><circle cx="126" cy="58" r="4" fill="#e4c87e"/><path d="M33 71Q28 27 17 19M36 73Q41 38 51 28M310 68Q317 25 333 12M315 70Q329 46 343 47" stroke="#758c54" strokeWidth="4" fill="none"/>{[45, 80, 280, 310].map((x, n) => <ellipse key={x} cx={x} cy={n % 2 ? 103 : 36} rx="13" ry="7" fill="#b5b7a1"/>)}</svg><span className="pg-dragonfly" aria-hidden="true"><svg viewBox="0 0 60 40"><g fill="#e5eee0" stroke="#9caf9d"><ellipse cx="21" cy="12" rx="15" ry="5" transform="rotate(25 21 12)"/><ellipse cx="41" cy="12" rx="15" ry="5" transform="rotate(-25 41 12)"/><ellipse cx="21" cy="24" rx="13" ry="4"/><ellipse cx="41" cy="24" rx="13" ry="4"/></g><path d="M31 9V37" stroke="#557f79" strokeWidth="4"/><circle cx="31" cy="8" r="4" fill="#4a6e67"/></svg></span><small>Lily pond · a place to slow down</small></div>}
    </div>
    <div className="pg-catch-summary"><p role="status" aria-live="polite">{announcement}</p><button type="button" disabled={!!active || !!next} onClick={preview}>Watch a catch</button></div>
    <p className="pg-caption">Real catches add growth when you return. “Watch a catch” previews the animation without changing your plants.</p>
  </div>
}
