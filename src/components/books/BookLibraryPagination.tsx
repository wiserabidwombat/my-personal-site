import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const PAGE_SIZE_OPTIONS = [6, 12, 24]

// Same page-number-list algorithm as GameInventory's pagination (not shared
// via import -- GameInventory doesn't export it -- but small enough that
// duplicating it matches this repo's existing tolerance for this kind of
// cross-feature duplication over an early shared-utility extraction).
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')

  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
    pages.push(page)
  }

  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

type Props = {
  pageSize: number
  onPageSizeChange: (size: number) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function BookLibraryPagination({ pageSize, onPageSizeChange, currentPage, totalPages, onPageChange }: Props) {
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Show</span>
        {PAGE_SIZE_OPTIONS.map((size) => (
          <Badge
            key={size}
            variant={pageSize === size ? 'secondary' : 'outline'}
            onClick={() => onPageSizeChange(size)}
            className="cursor-pointer select-none"
          >
            {size}
          </Badge>
        ))}
        <span>per page</span>
      </div>

      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  onPageChange(Math.max(1, currentPage - 1))
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {pageNumbers.map((page, index) =>
              page === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(event) => {
                      event.preventDefault()
                      onPageChange(page)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
