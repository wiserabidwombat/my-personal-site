import { HugeiconsIcon } from '@hugeicons/react'
import { ImageNotFound01Icon } from '@hugeicons/core-free-icons'
import { Card, CardHeader, CardTitle } from '../../../@/components/ui/card'
import type { Book } from '../../types/book'
import { getResizedImageUrl } from '../../lib/image'
import { formatDateRead } from './bookFilters'

type Props = {
  book: Book
}

// Same cover-image-on-top card shape as the fossils/minerals SpecimenCard,
// minus the click-to-open-modal behavior -- there's no book detail view in
// this feature, so the card is purely presentational.
export function BookCard({ book }: Props) {
  return (
    <Card className="gap-0 p-0 text-left ring-white/10">
      {book.coverImageUrl ? (
        <img
          // 'large' returns the cover URL unresized/uncropped -- see
          // FavoritesShowcase.tsx and CurrentlyReading.tsx for why: the
          // wsrv proxy's 'thumbnail'/'medium' sizes hard-crop to a square,
          // which double-crops badly when rendered into this card's
          // book-proportioned (2:3) box.
          src={getResizedImageUrl(book.coverImageUrl, 'large')}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          className="aspect-[2/3] w-full rounded-t-2xl object-cover"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center rounded-t-2xl bg-[var(--deep-space-black)]/60">
          <HugeiconsIcon
            icon={ImageNotFound01Icon}
            strokeWidth={1.5}
            className="size-8 text-slate-500"
            aria-hidden="true"
          />
        </div>
      )}

      <CardHeader className="gap-1.5 py-4">
        <CardTitle className="line-clamp-2 text-base font-semibold text-slate-100">{book.title}</CardTitle>
        <p className="line-clamp-1 text-xs text-slate-400">{book.author}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">
          <span>{book.rating != null ? `${book.rating.toFixed(1)}/5` : 'Unrated'}</span>
          <span>{formatDateRead(book.dateRead)}</span>
          {book.rereadCount > 0 && <span>Reread {book.rereadCount}×</span>}
        </div>
      </CardHeader>
    </Card>
  )
}
