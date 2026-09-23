import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import type { Book } from '../../types/book'
import { getResizedImageUrl } from '../../lib/image'
import { formatDateRead } from './bookFilters'

// Shown when a book has no cover URL at all, or its cover URL 404s/fails to
// load (Hardcover's data isn't guaranteed to have a working image for every
// book) -- a T-Rex with famously short arms failing to pick a book up off
// the ground reads better than a plain broken-image icon.
const NO_COVER_IMAGE = '/books/trex-no-cover.jpg'

type Props = {
  book: Book
}

// Same cover-image-on-top card shape as the fossils/minerals SpecimenCard,
// minus the click-to-open-modal behavior -- there's no book detail view in
// this feature, so the card is purely presentational.
export function BookCard({ book }: Props) {
  const [coverFailed, setCoverFailed] = useState(false)
  // 'large' returns the cover URL unresized/uncropped -- see
  // FavoritesShowcase.tsx and CurrentlyReading.tsx for why: the wsrv proxy's
  // 'thumbnail'/'medium' sizes hard-crop to a square, which double-crops
  // badly when rendered into this card's book-proportioned (2:3) box.
  const coverUrl =
    !coverFailed && book.coverImageUrl ? getResizedImageUrl(book.coverImageUrl, 'large') : NO_COVER_IMAGE
  const showCover = coverUrl !== NO_COVER_IMAGE

  return (
    <Card className="gap-0 p-0 text-left ring-white/10">
      <img
        src={coverUrl}
        alt={showCover ? `Cover of ${book.title}` : `No cover available for ${book.title}`}
        loading="lazy"
        onError={() => setCoverFailed(true)}
        className="aspect-[2/3] w-full rounded-t-2xl object-cover"
      />

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
