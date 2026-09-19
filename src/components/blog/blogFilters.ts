import type { BlogPost } from '../../types/blog-post'

export type BlogFilters = {
  tags: string[]
  search: string
}

export const emptyBlogFilters: BlogFilters = {
  tags: [],
  search: '',
}

// Pulled out of useBlogFilterState as a plain function so the filter
// combination logic can be unit tested directly, without rendering a hook.
// Unlike the Game Inventory's category/mechanic filters (which AND every
// selected value together), tags use OR: blog browsing is more exploratory,
// so selecting multiple tags should widen the result set, not narrow it to
// posts that have every one of them.
export function filterBlogPosts(posts: BlogPost[], filters: BlogFilters): BlogPost[] {
  const query = filters.search.trim().toLowerCase()

  return posts.filter((post) => {
    const matchesSearch =
      query === '' ||
      post.title.toLowerCase().includes(query) ||
      post.blurb.toLowerCase().includes(query)
    const matchesTags = filters.tags.length === 0 || filters.tags.some((tag) => post.tags.includes(tag))
    return matchesSearch && matchesTags
  })
}
