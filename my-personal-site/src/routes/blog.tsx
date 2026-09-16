import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { RssIcon } from '@hugeicons/core-free-icons'
import { getAllPosts, getAllTags } from '../lib/blog'
import { BlogGrid } from '../components/blog/BlogGrid'
import { TagFilter } from '../components/blog/TagFilter'
import { seoMeta } from '../lib/meta'

export const Route = createFileRoute('/blog')({
  head: () => ({
    meta: seoMeta({
      title: 'Blog',
      description:
        'Notes on code, engineering leadership, and everything in between -- Aaron Tilley writes about software development, teams, and AI-assisted workflows.',
      path: '/blog',
    }),
  }),
  component: BlogRouteComponent,
})

function BlogRouteComponent() {
  const posts = useMemo(() => getAllPosts(), [])
  const tags = useMemo(() => getAllTags(), [])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts
    return posts.filter((post) => post.tags?.includes(activeTag))
  }, [posts, activeTag])

  return (
    <div className="min-h-screen bg-[var(--deep-space-black)] text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Transmission Log
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <h1 className="max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
              Blog
            </h1>
            <a
              href="/rss.xml"
              aria-label="RSS feed"
              title="RSS feed"
              className="text-slate-400 transition-colors duration-300 hover:text-[var(--laser-cyan)] hover:[filter:drop-shadow(0_0_6px_var(--laser-cyan))]"
            >
              <HugeiconsIcon icon={RssIcon} strokeWidth={2} className="size-6" aria-hidden="true" />
            </a>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Notes on code, teams, and everything in between.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <TagFilter tags={tags} active={activeTag} onChange={setActiveTag} />
        <BlogGrid posts={filteredPosts} />
      </section>
    </div>
  )
}
