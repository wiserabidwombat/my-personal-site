import { createFileRoute } from '@tanstack/react-router'
import { Games } from '../components/Games'
import { parseInventorySearch } from '../components/games/inventoryFilters'
import { seoMeta, canonicalLink } from '../lib/meta'
import { gamesMeta } from './routeMeta'

export const Route = createFileRoute('/games')({
  // Inventory filters, search, and sort live in the URL so filtered views
  // are shareable; invalid or stale params are dropped, not errors.
  validateSearch: parseInventorySearch,
  head: () => ({
    meta: seoMeta(gamesMeta),
    links: [canonicalLink(gamesMeta.path)],
  }),
  component: Games,
})
