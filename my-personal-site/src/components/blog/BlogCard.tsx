import { Link } from '@tanstack/react-router'
import { Badge } from '../../../@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '../../../@/components/ui/card'
import type { BlogPost } from '../../types/blog-post'

export type Glow = 'pink' | 'cyan' | 'purple'

const glowStyles: Record<Glow, { ring: string; shadow: string }> = {
  pink: { ring: 'ring-[var(--neon-pink)]/50', shadow: 'shadow-glow-pink' },
  cyan: { ring: 'ring-[var(--laser-cyan)]/50', shadow: 'shadow-glow-cyan' },
  purple: { ring: 'ring-[var(--cyber-purple)]/50', shadow: 'shadow-glow-purple' },
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

type Props = {
  post: BlogPost
  glow?: Glow
}

export function BlogCard({ post, glow = 'cyan' }: Props) {
  const style = glowStyles[glow]

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)]"
    >
      <Card
        className={`${style.ring} ${style.shadow} h-full bg-[var(--deep-space-purple)]/50 backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-1`}
      >
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="aspect-video w-full object-cover transition-[filter] duration-300 group-hover:brightness-110"
        />
        <CardHeader>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <CardTitle className="mt-1 text-base font-bold text-slate-50">{post.title}</CardTitle>
          <CardDescription className="line-clamp-3 text-slate-300">{post.blurb}</CardDescription>
          <p className="mt-2 text-xs font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author && <> &middot; {post.author}</>}
          </p>
        </CardHeader>
      </Card>
    </Link>
  )
}
