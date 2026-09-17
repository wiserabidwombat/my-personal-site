import { useMemo, useState } from 'react'
import type { BlogPost } from '../../types/blog-post'
import { uniqueSorted } from './shared'
import { filterBlogPosts } from './blogFilters'

// Mirrors useGameFilterState's shape (options list + selected state +
// filtered result + hasActiveFilters/clearAllFilters) so the blog listing's
// tag filter follows the same pattern as the Game Inventory's
// Categories/Mechanics filters. initialTags seeds the tag filter from a URL
// search param (set when arriving from a post page's clickable tag badge).
export function useBlogFilterState(posts: BlogPost[], initialTags: string[] = []) {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)

  const allTags = useMemo(() => uniqueSorted(posts.map((post) => post.tags)), [posts])

  const filteredPosts = useMemo(
    () => filterBlogPosts(posts, { tags: selectedTags, search }),
    [posts, selectedTags, search]
  )

  // Matches Game Inventory's convention: the search box is always visible
  // and isn't itself counted as an "active filter" -- only the tag
  // selection is, since that's what "Clear all" resets.
  const hasActiveFilters = selectedTags.length > 0

  function clearAllFilters() {
    setSelectedTags([])
  }

  return {
    search,
    setSearch,
    allTags,
    selectedTags,
    setSelectedTags,
    filteredPosts,
    hasActiveFilters,
    clearAllFilters,
  }
}
