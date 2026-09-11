import { BlogCard, type Glow } from './BlogCard'
import type { BlogPost } from '../../types/blog-post'

const GLOW_CYCLE: Glow[] = ['pink', 'cyan', 'purple']

type Props = {
  posts: BlogPost[]
}

export function BlogGrid({ posts }: Props) {
  if (posts.length === 0) {
    return <p className="mt-8 text-center text-slate-400">No posts match this tag yet.</p>
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <BlogCard key={post.slug} post={post} glow={GLOW_CYCLE[index % GLOW_CYCLE.length]} />
      ))}
    </div>
  )
}
