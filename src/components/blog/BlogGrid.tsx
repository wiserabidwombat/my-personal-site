import { BlogCard } from './BlogCard'
import type { BlogPost } from '../../types/blog-post'

type Props = {
  // Already filtered, newest first (getAllPosts() sorts by date).
  posts: BlogPost[]
}

// Newest matching post as a full-width featured card, the rest in a
// 2-column grid (1 column on mobile). A single match renders only the
// featured card. The empty state is the route's job, since clearing
// filters needs the route's search-param navigation.
export function BlogGrid({ posts }: Props) {
  const [featured, ...rest] = posts
  if (!featured) return null

  return (
    <div className="mt-8 space-y-6">
      <BlogCard post={featured} featured />
      {rest.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {rest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
