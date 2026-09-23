import { useMemo, useState } from 'react'
import type { BlogPost } from '../../types/blog-post'
import { uniqueSorted } from './shared'
import { filterBlogPosts } from './blogFilters'

// The selected tag lives in the URL (?tag=, owned by the /blog route) so
// filtered views are shareable; it's passed in rather than held here. The
// free-text search is transient, so it stays local state. Both combine:
// a post must match the tag AND the search text.
export function useBlogFilterState(posts: BlogPost[], selectedTag: string | undefined) {
  const [search, setSearch] = useState('')

  const allTags = useMemo(() => uniqueSorted(posts.map((post) => post.tags)), [posts])

  const filteredPosts = useMemo(
    () => filterBlogPosts(posts, { tags: selectedTag ? [selectedTag] : [], search }),
    [posts, selectedTag, search]
  )

  const hasActiveFilters = selectedTag !== undefined || search.trim() !== ''

  return {
    search,
    setSearch,
    allTags,
    filteredPosts,
    hasActiveFilters,
  }
}
