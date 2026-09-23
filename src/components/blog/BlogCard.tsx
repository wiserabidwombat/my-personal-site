import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { OutlinePill } from '../OutlinePill'
import { formatPostDate, readingMinutes, tagLabel } from '../../lib/blog'
import type { BlogPost } from '../../types/blog-post'

type Props = {
  post: BlogPost
  // Featured: full-width, image and text side by side from md up.
  featured?: boolean
}

// The whole card is one link, with nothing interactive nested inside it --
// tag pills here are plain labels; filtering happens via the toolbar chips.
// One border color for every card (the old pink/cyan/purple cycled by list
// position, not by category). Hover/focus: slight lift + brighter border,
// plus a visible focus ring for keyboard users.
export function BlogCard({ post, featured = false }: Props) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 text-left transition duration-300',
        'hover:-translate-y-1 hover:border-[var(--laser-cyan)]/70 motion-reduce:hover:translate-y-0',
        'focus-visible:-translate-y-1 focus-visible:border-[var(--laser-cyan)]/70 focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
        featured && 'md:grid md:grid-cols-2',
      )}
    >
      {/* Decorative: the title right beside it already names the post, and
          alt text here would be read again as part of the link's name. */}
      <img
        src={post.image}
        alt=""
        loading={featured ? 'eager' : 'lazy'}
        className="aspect-video w-full object-cover transition-[filter] duration-300 group-hover:brightness-110 md:h-full"
      />
      <div className={cn('flex flex-1 flex-col gap-3 p-5', featured && 'md:justify-center md:p-8')}>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <OutlinePill key={tag}>{tagLabel(tag)}</OutlinePill>
            ))}
          </div>
        )}
        <h2 className={cn('font-bold text-slate-50', featured ? 'text-xl sm:text-2xl' : 'text-lg')}>{post.title}</h2>
        <p className={cn('text-slate-300', !featured && 'line-clamp-3')}>{post.blurb}</p>
        <p className="mt-auto pt-1 text-xs font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time> &middot; {readingMinutes(post.body)} min read
        </p>
      </div>
    </Link>
  )
}
