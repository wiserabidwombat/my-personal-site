import { headingClass } from './shared'

const wantToPlay = ['Ark Nova', 'Perseverance: Cast Away Chronicles Ep. 1 & 2', 'The Crew: Mission Deep Sea', 'The Lord of the Rings: Fellowship of the Ring - Trick-Taking Game ']

export function WantToPlay() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Want to Play</h2>
      <p className="mt-2 text-slate-300">On my immediate radar.</p>
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/30 px-6 py-4">
        {wantToPlay.map((name, i) => (
          <span key={name} className="flex items-center gap-4 text-sm font-medium text-slate-200">
            {i > 0 && <span className="text-[var(--cyber-purple)]">/</span>}
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}
