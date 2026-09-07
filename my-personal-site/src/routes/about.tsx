import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { CameraAdd01Icon } from '@hugeicons/core-free-icons'
import { Badge } from '../../@/components/ui/badge'

export const Route = createFileRoute('/about')({
  component: AboutRouteComponent,
})

const toolkit = [
  {
    category: 'Frontend Architecture',
    skills: ['React', 'Angular', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'HTML5', 'CSS3'],
  },
  {
    category: 'Data & Visualization',
    skills: ['SQL', 'D365', 'Data Analytics'],
  },
  {
    category: 'Cloud & Infrastructure',
    skills: ['AWS (Amazon Web Services)', 'Modern CI/CD Flow Integration'],
  },
  {
    category: 'Emerging Tech',
    skills: ['AI-Assisted Development', 'Prompt Engineering', 'LLM Workflow Automation'],
  },
]

const beyondTheCode = [
  { label: 'At the Table', detail: 'Diving into complex strategy board games or PC gaming.' },
  {
    label: 'In the Elements',
    detail: 'Out on the water fly fishing or playing a fast-paced game of pickleball.',
  },
  { label: 'Unwinding', detail: 'Catching a great movie or getting lost in a good book.' },
]

const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

function AboutRouteComponent() {
  return (
    <div className="min-h-screen bg-[var(--deep-space-black)] text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Lead Developer &middot; Full-Stack Engineer &middot; Team Enabler
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            I build up the people around me.
          </h1>
          <blockquote className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[var(--neon-pink)]/40 bg-[var(--deep-space-purple)]/70 px-6 py-5 text-lg text-slate-100 italic shadow-glow-pink">
            "I build full-stack, efficient, and highly maintainable software. More importantly, I
            build up the people around me."
          </blockquote>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <p className="leading-relaxed text-slate-300">
          I am a Lead Developer specializing in creating robust, scalable applications while
          fostering collaborative, high-performing engineering teams. I believe that great
          software isn't just about clean code—it's about empowering the developers beside you to
          grow, innovate, and succeed together.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className={headingClass}>⏳ My Journey</h2>
        <div className="mt-4 space-y-4 leading-relaxed text-slate-300">
          <p>
            My passion for coding started back in high school, writing simple programs in BASIC.
            That early spark led me to the University of North Texas, where I earned my degree in
            Computer Information Systems.
          </p>
          <p>
            I began my professional career on the front lines, doing technical support for
            mission-critical emergency department software. Navigating those high-stakes
            environments taught me the real-world value of software reliability and user empathy.
            Over time, I channeled those insights into engineering, coding my way up through
            complex enterprise ecosystems to become a Lead Developer.
          </p>
          <p>
            Today, my focus is split between architecting clean full-stack systems and mentoring
            teams. I am an execution-driven learner who is constantly evolving—currently mastering
            the seamless implementation of AI into modern development workflows to accelerate
            delivery and code quality.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className={headingClass}>🛠️ Technical Toolkit</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {toolkit.map((group) => (
            <div
              key={group.category}
              className="rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-5"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
                {group.category}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="shadow-glow-cyan">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className={headingClass}>🕹️ Beyond the Code</h2>
        <p className="mt-3 text-slate-300">
          When I'm not staring at a terminal or architectural diagrams, I like to unplug and stay
          active. You can usually find me:
        </p>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <ul className="space-y-4">
            {beyondTheCode.map((item) => (
              <li key={item.label}>
                <span className="font-semibold text-[var(--laser-cyan)]">{item.label}:</span>{' '}
                <span className="text-slate-300">{item.detail}</span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--laser-cyan)]/40 text-[var(--laser-cyan)]/70"
              >
                <HugeiconsIcon
                  icon={CameraAdd01Icon}
                  strokeWidth={2}
                  className="size-8"
                  aria-hidden="true"
                />
                <span className="text-xs">Add photo</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
