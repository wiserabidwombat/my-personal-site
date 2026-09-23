import { createFileRoute, Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '@/components/ui/button'
import { getPostBySlug, postOgImagePath } from '../lib/blog'
import { BlogPostView } from '../components/blog/BlogPostView'
import { seoMeta, canonicalLink, SITE_URL } from '../lib/meta'

export const Route = createFileRoute('/blog_/$slug')({
  loader: ({ params }) => getPostBySlug(params.slug),
  head: ({ loaderData, params }) => {
    const ogImage = loaderData ? postOgImagePath(loaderData) : undefined
    return {
      meta: seoMeta({
        title: loaderData?.title ?? 'Post not found',
        description: loaderData?.blurb ?? 'That transmission never made it through.',
        path: `/blog/${params.slug}`,
        image: ogImage ? `${SITE_URL}${ogImage}` : undefined,
        type: 'article',
      }),
      links: [canonicalLink(`/blog/${params.slug}`)],
    }
  },
  component: BlogSlugRouteComponent,
})

function BlogSlugRouteComponent() {
  const post = Route.useLoaderData()

  if (!post) {
    return (
      <div className="bg-[var(--deep-space-black)] px-6 py-24 text-center text-slate-200">
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
