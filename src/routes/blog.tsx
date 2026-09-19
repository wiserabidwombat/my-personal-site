import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { RssIcon, Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { Input } from '../../@/components/ui/input'
import { Badge } from '../../@/components/ui/badge'
import { getAllPosts } from '../lib/blog'
import { BlogGrid } from '../components/blog/BlogGrid'
import { MultiSelectFilter } from '../components/games/MultiSelectFilter'
import { useBlogFilterState } from '../components/blog/useBlogFilterState'
import { toggleValue } from '../components/blog/shared'
import { seoMeta } from '../lib/meta'

type BlogSearch = {
  tag?: string
}

export const Route = createFileRoute('/blog')({
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    tag: typeof search.tag === 'string' ? search.tag : undefined,
  }),
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
  const posts = getAllPosts()
  // The tag search param is only ever read on mount (as the filter's
  // initial state, seeded by a post page's clickable tag badge) -- once
  // the user is on this page, the filter UI itself is the single source of
  // truth, not the URL, matching how the rest of the filter state works.
  const { tag } = Route.useSearch()
  const {
    search,
    setSearch,
    allTags,
    selectedTags,
    setSelectedTags,
    filteredPosts,
    hasActiveFilters,
    clearAllFilters,
  } = useBlogFilterState(posts, tag ? [tag] : [])

  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
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
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="relative w-full sm:w-64">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search posts..."
              className="pl-9"
            />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <MultiSelectFilter label="Tags" options={allTags} selected={selectedTags} onChange={setSelectedTags} />
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-[var(--laser-cyan)] underline-offset-4 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((selectedTag) => (
                  <Badge
                    key={selectedTag}
                    variant="secondary"
                    onClick={() => setSelectedTags((prev) => toggleValue(prev, selectedTag))}
                    className="cursor-pointer gap-1 text-[10px] capitalize select-none"
                  >
                    {selectedTag}
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <BlogGrid posts={filteredPosts} />
      </section>
    </div>
  )
}
