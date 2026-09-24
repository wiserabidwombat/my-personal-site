import { useMemo } from 'react'
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

type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  pageSizeOptions: readonly number[]
  onPageSizeChange: (size: number) => void
}

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

export function InventoryPagination({ page, totalPages, onPageChange, pageSize, pageSizeOptions, onPageSizeChange }: Props) {
  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages])

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Show</span>
        {pageSizeOptions.map((size) => (
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
                  onPageChange(Math.max(1, page - 1))
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {pageNumbers.map((number, index) =>
              number === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={number}>
                  <PaginationLink
                    href="#"
                    isActive={number === page}
                    onClick={(event) => {
                      event.preventDefault()
                      onPageChange(number)
                    }}
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  onPageChange(Math.min(totalPages, page + 1))
                }}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
