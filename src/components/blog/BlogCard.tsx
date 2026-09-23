import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { formatPostDate, readingMinutes, tagLabel } from '../../lib/blog'
import type { BlogPost } from '../../types/blog-post'

type Props = {
  post: BlogPost
  // Featured: image and text split 50/50 from md up. Otherwise a compact
  // horizontal card (image ~1/3) -- a smaller version of the same layout.
  featured?: boolean
  // Shows the LATEST label. Only the route knows whether this card is the
  // newest post overall vs. merely the first match of a filter.
  latest?: boolean
}

// The whole card is one link, with nothing interactive nested inside it.
// Tags are plain accent text here, so the toolbar's filter chips stay the
// only full-size pills on the page. One border color for every card;
// hover/focus lift it and brighten the border, plus a focus ring.
export function BlogCard({ post, featured = false, latest = false }: Props) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 text-left transition duration-300',
        'hover:-translate-y-1 hover:border-[var(--laser-cyan)]/70 motion-reduce:hover:translate-y-0',
        'focus-visible:-translate-y-1 focus-visible:border-[var(--laser-cyan)]/70 focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
        featured ? 'md:grid md:grid-cols-2' : 'sm:flex-row sm:items-center',
      )}
    >
      {/* Fixed 16:9 at every size so a card never grows empty image space.
          Compact cards inset the image as a thumbnail from sm up, so any
          height difference against the text column reads as padding. */}
      <div className={cn('relative shrink-0', !featured && 'sm:m-4 sm:w-1/3 sm:overflow-hidden sm:rounded-xl')}>
        {/* Decorative: the title beside it already names the post, and alt
            text would be read again as part of the link's name. */}
        <img
          src={post.image}
          alt=""
          loading={featured ? 'eager' : 'lazy'}
          className={cn(
            'aspect-video w-full object-cover transition-[filter] duration-300 group-hover:brightness-110',
            featured && 'md:h-full',
          )}
        />
        {latest && (
          <span className="absolute top-3 left-3 rounded-md border border-[var(--neon-pink)]/60 bg-[var(--deep-space-black)]/80 px-2 py-0.5 text-[11px] font-semibold tracking-[0.2em] text-[var(--neon-pink)] uppercase backdrop-blur-sm">
            Latest
          </span>
        )}
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-2 p-5',
          featured ? 'md:justify-center md:gap-3 md:p-8' : 'sm:py-4 sm:pr-6 sm:pl-2',
        )}
      >
        {post.tags.length > 0 && (
          <p className="text-xs font-semibold tracking-wider text-[var(--laser-cyan)] uppercase">
            {post.tags.map(tagLabel).join(' · ')}
          </p>
        )}
        <h2 className={cn('font-bold text-slate-50', featured ? 'text-xl sm:text-2xl' : 'text-lg')}>{post.title}</h2>
        <p className={cn('text-slate-300', !featured && 'sm:line-clamp-2')}>{post.blurb}</p>
        <p className="mt-auto pt-1 text-xs font-medium tracking-wide text-slate-400 uppercase">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time> &middot; {readingMinutes(post.body)} min read
        </p>
      </div>
    </Link>
  )
}
