import { BlogCard } from './BlogCard'
import type { BlogPost } from '../../types/blog-post'

type Props = {
  // Already filtered, newest first (getAllPosts() sorts by date).
  posts: BlogPost[]
  // Slug of the newest post overall (before filtering), so the LATEST label
  // only appears when the featured card really is the newest post.
  latestSlug: string | undefined
}

// Newest matching post as a full-width featured card, the rest as a
// single-column list of compact horizontal cards. A single match renders only the
// featured card. The empty state is the route's job, since clearing
// filters needs the route's search-param navigation.
export function BlogGrid({ posts, latestSlug }: Props) {
  const [featured, ...rest] = posts
  if (!featured) return null

  return (
    <div className="mt-8 space-y-6">
      <BlogCard post={featured} featured latest={featured.slug === latestSlug} />
      {rest.length > 0 && (
        <div className="space-y-6">
          {rest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
