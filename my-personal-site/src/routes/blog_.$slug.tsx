import { createFileRoute, Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '../../@/components/ui/button'
import { getPostBySlug } from '../lib/blog'
import { BlogPostView } from '../components/blog/BlogPostView'

export const Route = createFileRoute('/blog_/$slug')({
  component: BlogSlugRouteComponent,
})

function BlogSlugRouteComponent() {
  const { slug } = Route.useParams()
  const post = getPostBySlug(slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--deep-space-black)] px-6 py-24 text-center text-slate-200">
        <h1 className="text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]">
          Post not found
        </h1>
        <p className="mt-4 text-slate-300">That transmission never made it through.</p>
        <Link to="/blog" className={buttonVariants({ variant: 'outline', className: 'mt-8' })}>
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
          Back to blog
        </Link>
      </div>
    )
  }

  return <BlogPostView post={post} />
}
