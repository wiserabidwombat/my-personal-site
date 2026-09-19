import { headingClass } from './shared'

const currentlyLoving = {
  name: 'Champions of Midgard',
  blurb: 'Viking worker-placement with a monster-hunting twist -- back on the table on repeat.',
}

export function CurrentlyLoving() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Currently Loving</h2>
      <div className="mt-6 rounded-3xl border-2 border-[var(--laser-cyan)] bg-[var(--deep-space-purple)]/40 p-8 text-center shadow-glow-cyan backdrop-blur-md">
        <h3 className="text-xl font-bold text-slate-50">{currentlyLoving.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{currentlyLoving.blurb}</p>
      </div>
    </section>
  )
}
