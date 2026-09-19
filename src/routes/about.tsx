import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '../../@/components/ui/badge'
import boardGamePhoto from '../assets/board-game.jpg'
import flyFishingPhoto from '../assets/fly-fishing.jpg'
import golfPhoto from '../assets/highest-golf.jpg'
import beefJerkyPhoto from '../assets/beef-jerky.jpg'
import { seoMeta } from '../lib/meta'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: seoMeta({
      title: 'About',
      description: 'Senior Developer specializing in React, .NET, and enterprise CRM systems.',
      path: '/about',
    }),
  }),
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
    detail: 'Out on the water fly fishing, playing a fast-paced game of pickleball, exploring the great outdoors, covering every corner of the golf course.',
  },
  { label: 'Unwinding', detail: 'Catching a great movie, getting lost in a good book, cooking and smoking good food, collecting minerals and fossils, going out to a great restaurant.' },
]

const beyondPhotos = [
  { src: boardGamePhoto, alt: 'Deep into a strategy board game session' },
  { src: flyFishingPhoto, alt: 'Fly fishing, holding up a rainbow trout catch' },
  { src: golfPhoto, alt: 'Tee marker at Copper Creek, the highest tee in North America' },
  { src: beefJerkyPhoto, alt: 'A batch of homemade beef jerky smoking on the grill' },
]

const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

function AboutRouteComponent() {
  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
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
          When I'm not playing with code or AIs, I like to unplug and stay
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
            {beyondPhotos.map((photo) => (
              <img
                key={photo.alt}
                src={photo.src}
                alt={photo.alt}
                className="aspect-square w-full rounded-2xl border-2 border-[var(--laser-cyan)]/40 object-cover shadow-glow-cyan"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
