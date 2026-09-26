import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, News01Icon } from '@hugeicons/core-free-icons'
import { getAllPosts } from '../../lib/blog'
import { pageContainer } from '../../lib/styles'
import { SectionHeading } from '../SectionHeading'
import { BlogCard } from '../blog/BlogCard'

// The newest post, in the Blog page's own featured card.
export function LatestPost() {
  const [latest] = getAllPosts()
  if (!latest) return null

  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <SectionHeading icon={News01Icon}>Latest from the Blog</SectionHeading>
        <Link
          to="/blog"
          className="flex items-center gap-1 text-sm font-medium text-slate-400 transition-colors hover:text-[var(--laser-cyan)]"
        >
          All posts
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-6">
        <BlogCard post={latest} featured latest />
      </div>
    </section>
  )
}
