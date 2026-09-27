import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { PostImage } from './PostImage'
import ReactMarkdown from 'react-markdown'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { tagLabel } from '../../lib/blog'
import { headingText, pageContainer, pageTitle, pageTitleLeading } from '../../lib/styles'
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
          <h1 className={cn(pageTitle, pageTitleLeading, 'font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]')}>
            {post.title}
          </h1>
          <p className="text-sm font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author && <> &middot; {post.author}</>}
          </p>
        </div>
      </section>

      {/* Hero image, body, and "Back to blog" share the page container's left
          edge. The image keeps its original width (45rem: the old max-w-3xl
          block minus its padding), capped at the container on small screens. */}
      <article className={cn(pageContainer, 'py-12')}>
        <div className="max-w-[45rem]">
          <PostImage
            src={post.image}
            alt={post.title}
            loading="eager"
            className="aspect-video w-full rounded-2xl border-2 border-[var(--laser-cyan)]/40 object-cover shadow-glow-cyan"
          />
        </div>

        {/* Body: left-aligned prose capped at 60ch, which keeps desktop lines
            within about 65-75 characters. Blocks are 16px apart; headings get 48px
            above and 24px below (adjacent margins collapse to the larger). */}
        <div className="pt-8">
          <div className="max-w-[60ch] [&>:first-child]:mt-0">
            <ReactMarkdown
              components={{
                h2: ({ children }) => <h2 className={cn(headingText, 'mt-[48px] mb-[24px] font-bold text-[var(--neon-pink)]')}>{children}</h2>,
                h3: ({ children }) => <h3 className="mt-[40px] mb-[16px] text-xl font-bold text-[var(--laser-cyan)]">{children}</h3>,
                p: ({ children }) => <p className="mt-[16px] leading-relaxed text-slate-300">{children}</p>,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-[var(--laser-cyan)] underline decoration-[var(--laser-cyan)]/40 underline-offset-4 hover:[text-shadow:var(--glow-cyan)]"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => <ul className="mt-[16px] list-disc space-y-2 pl-6 text-slate-300">{children}</ul>,
                blockquote: ({ children }) => (
                  <blockquote className="mt-[16px] rounded-2xl border border-[var(--neon-pink)]/40 bg-[var(--deep-space-purple)]/70 px-6 py-4 text-slate-100 italic">
                    {children}
                  </blockquote>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt ?? ''}
                    loading="lazy"
                    className="mt-[16px] w-full rounded-2xl border border-[var(--laser-cyan)]/30"
                  />
                ),
              }}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        </div>

        <div>
          <Link to="/blog" className={buttonVariants({ variant: 'outline', className: 'mt-12' })}>
            <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            Back to blog
          </Link>
        </div>
      </article>
    </div>
  )
}
