import { createFileRoute } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { RssIcon } from '@hugeicons/core-free-icons'
import { getAllPosts } from '../lib/blog'
import { BlogGrid } from '../components/blog/BlogGrid'
import { BlogToolbar } from '../components/blog/BlogToolbar'
import { BlogEmptyState } from '../components/blog/BlogEmptyState'
import { useBlogFilterState } from '../components/blog/useBlogFilterState'
import { seoMeta, canonicalLink } from '../lib/meta'
import { pageContainer } from '../lib/styles'
import { blogMeta } from './routeMeta'

type BlogSearch = {
  tag?: string
}

export const Route = createFileRoute('/blog')({
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    tag: typeof search.tag === 'string' && search.tag !== '' ? search.tag : undefined,
  }),
  head: () => ({
    meta: seoMeta(blogMeta),
    links: [canonicalLink(blogMeta.path)],
  }),
  component: BlogRouteComponent,
})

// Shorter hero than the site default (bg-synth-grid's 26rem min-height and
// 11rem horizon) so the first post card lands above the fold on a ~800px
// laptop viewport. Horizon and glow move up with it to stay behind the text.
const compactHeroClass =
  '[--synth-grid-min-height:16rem] [--synth-grid-horizon:7.5rem] [--synth-grid-glow-y:7rem] [--synth-grid-glow-height:9rem]'

function BlogRouteComponent() {
  const posts = getAllPosts()
  // ?tag= is the single source of truth for the selected tag, so a filtered
  // view is shareable and a post page's tag badge can link straight into it.
  const { tag } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { search, setSearch, allTags, filteredPosts, hasActiveFilters } = useBlogFilterState(posts, tag)

  // replace: stepping through chips shouldn't pile up history entries.
  function selectTag(next: string | undefined) {
    void navigate({ search: { tag: next }, replace: true })
  }

  function clearFilters() {
    setSearch('')
    selectTag(undefined)
  }

  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <section className={cn('bg-synth-grid px-6 py-10 text-center sm:py-12', compactHeroClass)}>
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Transmission Log
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
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
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Notes on code, teams, and everything in between.
          </p>
        </div>
      </section>

      <section className={cn(pageContainer, 'py-8 sm:py-10')}>
        <BlogToolbar
          tags={allTags}
          selectedTag={tag}
          onSelectTag={selectTag}
          search={search}
          onSearchChange={setSearch}
        />
        {filteredPosts.length > 0 ? (
          <BlogGrid posts={filteredPosts} />
        ) : (
          <BlogEmptyState onClear={clearFilters} />
        )}
        {/* Always mounted so screen readers pick up changes to its text. */}
        <p className="sr-only" role="status">
          {hasActiveFilters ? `${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'} shown` : ''}
        </p>
      </section>
    </div>
  )
}
