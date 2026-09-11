import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getAllPosts, getAllTags } from '../lib/blog'
import { BlogGrid } from '../components/blog/BlogGrid'
import { TagFilter } from '../components/blog/TagFilter'

export const Route = createFileRoute('/blog')({
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
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            Blog
          </h1>
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
