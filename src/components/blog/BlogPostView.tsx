import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { PostImage } from './PostImage'
import ReactMarkdown from 'react-markdown'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { tagLabel } from '../../lib/blog'
import { pageContainer } from '../../lib/styles'
import type { BlogPost } from '../../types/blog-post'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

type Props = {
  post: BlogPost
}

export function BlogPostView({ post }: Props) {
  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10 mx-auto max-w-3xl">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  render={<Link to="/blog" search={{ tag }} />}
                  className="cursor-pointer"
                >
                  {tagLabel(tag)}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="mt-4 text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author && <> &middot; {post.author}</>}
          </p>
        </div>
      </section>

      <article className="py-12">
        {/* Hero image and "Back to blog" keep their original centered width. */}
        <div className="mx-auto max-w-3xl px-6">
          <PostImage
            src={post.image}
            alt={post.title}
            loading="eager"
            className="aspect-video w-full rounded-2xl border-2 border-[var(--laser-cyan)]/40 object-cover shadow-glow-cyan"
          />
        </div>

        {/* Body: left-aligned prose on the shared page container's edge,
            capped at max-w-prose. index.css styles bare p and h2 outside
            Tailwind's layers (their margins, and #root's centered text), and
            those beat margin utilities -- so blocks are spaced by the
            column's gap, and headings get extra top padding: 48px above,
            24px below. */}
        <div className={cn(pageContainer, 'pt-8')}>
          <div className="flex max-w-prose flex-col gap-4 text-left">
            <ReactMarkdown
              components={{
                h2: ({ children }) => <h2 className="pt-8 text-2xl font-bold text-[var(--neon-pink)]">{children}</h2>,
                h3: ({ children }) => <h3 className="pt-6 text-xl font-bold text-[var(--laser-cyan)]">{children}</h3>,
                p: ({ children }) => <p className="leading-relaxed text-slate-300">{children}</p>,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-[var(--laser-cyan)] underline decoration-[var(--laser-cyan)]/40 underline-offset-4 hover:[text-shadow:var(--glow-cyan)]"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => <ul className="list-disc space-y-2 pl-6 text-slate-300">{children}</ul>,
                blockquote: ({ children }) => (
                  <blockquote className="rounded-2xl border border-[var(--neon-pink)]/40 bg-[var(--deep-space-purple)]/70 px-6 py-4 text-slate-100 italic">
                    {children}
                  </blockquote>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt ?? ''}
                    loading="lazy"
                    className="w-full rounded-2xl border border-[var(--laser-cyan)]/30"
                  />
                ),
              }}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6">
          <Link to="/blog" className={buttonVariants({ variant: 'outline', className: 'mt-12' })}>
            <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            Back to blog
          </Link>
        </div>
      </article>
    </div>
  )
}
