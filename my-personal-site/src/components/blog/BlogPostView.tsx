import { Link } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { Badge } from '../../../@/components/ui/badge'
import { buttonVariants } from '../../../@/components/ui/button'
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
                  className="cursor-pointer capitalize"
                >
                  {tag}
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

      <article className="mx-auto max-w-3xl px-6 py-12">
        <img
          src={post.image}
          alt={post.title}
          className="aspect-video w-full rounded-2xl border-2 border-[var(--laser-cyan)]/40 object-cover shadow-glow-cyan"
        />

        <div className="mt-8">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="mt-10 text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 text-xl font-bold text-[var(--laser-cyan)]">{children}</h3>
              ),
              p: ({ children }) => <p className="mt-4 leading-relaxed text-slate-300">{children}</p>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-[var(--laser-cyan)] underline decoration-[var(--laser-cyan)]/40 underline-offset-4 hover:[text-shadow:var(--glow-cyan)]"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">{children}</ul>
              ),
              blockquote: ({ children }) => (
                <blockquote className="mt-6 rounded-2xl border border-[var(--neon-pink)]/40 bg-[var(--deep-space-purple)]/70 px-6 py-4 text-slate-100 italic">
                  {children}
                </blockquote>
              ),
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt ?? ''}
                  loading="lazy"
                  className="mt-6 w-full rounded-2xl border border-[var(--laser-cyan)]/30"
                />
              ),
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        <Link to="/blog" className={buttonVariants({ variant: 'outline', className: 'mt-12' })}>
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
          Back to blog
        </Link>
      </article>
    </div>
  )
}
