import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { bodyText, mutedText, proseWidth } from './typography'
import boardGamePhoto from '../../assets/board-game.jpg'
import flyFishingPhoto from '../../assets/fly-fishing.jpg'
import golfPhoto from '../../assets/highest-golf.jpg'
import beefJerkyPhoto from '../../assets/beef-jerky.jpg'

const linkClass = 'text-[var(--laser-cyan)] underline underline-offset-2 hover:text-[var(--neon-pink)]'

const photos = [
  { src: boardGamePhoto, alt: 'Deep into a strategy board game session', caption: 'Strategy board game night' },
  { src: flyFishingPhoto, alt: 'Fly fishing, holding up a rainbow trout catch', caption: 'Fly fishing for rainbow trout' },
  { src: golfPhoto, alt: 'Tee marker at Copper Creek, the highest tee in North America', caption: "Copper Creek's 14th, the highest tee box in North America" },
  { src: beefJerkyPhoto, alt: 'A batch of homemade beef jerky smoking on the grill', caption: 'Smoking a batch of beef jerky' },
]

export function BeyondTheCode() {
  return (
    // Stacked rather than side-by-side: capped at prose width the text can't
    // fill half the row, and a 2x2 photo grid beside it left dead space
    // below the list on desktop. One row of four (2x2 on mobile) spans the
    // full container width like the Toolkit grid.
    <div className="mt-6 space-y-8">
      <ul className={cn('space-y-4', bodyText, proseWidth)}>
        <li>
          <span className="font-semibold text-[var(--laser-cyan)]">At the Table:</span>{' '}
          <span>
            Playing complex{' '}
            <Link to="/games" className={linkClass}>
              strategy board games
            </Link>{' '}
            or PC games.
          </span>
        </li>
        <li>
          <span className="font-semibold text-[var(--laser-cyan)]">Outside:</span>{' '}
          <span>
            Fly fishing, playing pickleball, hiking, or golfing, where I usually see every corner of the
            course.
          </span>
        </li>
        <li>
          <span className="font-semibold text-[var(--laser-cyan)]">Unwinding:</span>{' '}
          <span>
            Watching a movie, reading, cooking and smoking food,{' '}
            <Link to="/minerals_fossils" className={linkClass}>
              collecting minerals and fossils
            </Link>
            , or finding a good dinner out.
          </span>
        </li>
      </ul>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {photos.map((photo) => (
          <figure key={photo.alt}>
            <img
              src={photo.src}
              alt={photo.alt}
              className="aspect-square w-full rounded-2xl border border-[var(--laser-cyan)]/40 object-cover"
            />
            <figcaption className={cn('mt-2', mutedText)}>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
