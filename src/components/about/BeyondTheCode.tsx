import { Link } from '@tanstack/react-router'
import boardGamePhoto from '../../assets/board-game.jpg'
import flyFishingPhoto from '../../assets/fly-fishing.jpg'
import golfPhoto from '../../assets/highest-golf.jpg'
import beefJerkyPhoto from '../../assets/beef-jerky.jpg'

const linkClass = 'text-[var(--laser-cyan)] underline underline-offset-2 hover:text-white'

const photos = [
  { src: boardGamePhoto, alt: 'Deep into a strategy board game session', caption: 'Strategy board game night' },
  { src: flyFishingPhoto, alt: 'Fly fishing, holding up a rainbow trout catch', caption: 'Fly fishing for rainbow trout' },
  { src: golfPhoto, alt: 'Tee marker at Copper Creek, the highest tee in North America', caption: "Copper Creek's highest tee in North America" },
  { src: beefJerkyPhoto, alt: 'A batch of homemade beef jerky smoking on the grill', caption: 'Smoking a batch of beef jerky' },
]

export function BeyondTheCode() {
  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2">
      <ul className="space-y-4">
        <li>
          <span className="font-semibold text-[var(--laser-cyan)]">At the Table:</span>{' '}
          <span className="text-slate-300">
            Diving into complex{' '}
            <Link to="/games" className={linkClass}>
              strategy board games
            </Link>{' '}
            or PC gaming.
          </span>
        </li>
        <li>
          <span className="font-semibold text-[var(--laser-cyan)]">In the Elements:</span>{' '}
          <span className="text-slate-300">
            Out on the water fly fishing, playing a fast-paced game of pickleball, exploring the great
            outdoors, covering every corner of the golf course.
          </span>
        </li>
        <li>
          <span className="font-semibold text-[var(--laser-cyan)]">Unwinding:</span>{' '}
          <span className="text-slate-300">
            Catching a great movie, getting lost in a good book, cooking and smoking good food,{' '}
            <Link to="/minerals_fossils" className={linkClass}>
              collecting minerals and fossils
            </Link>
            , going out to a great restaurant.
          </span>
        </li>
      </ul>
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo) => (
          <figure key={photo.alt}>
            <img
              src={photo.src}
              alt={photo.alt}
              className="aspect-square w-full rounded-2xl border border-[var(--laser-cyan)]/40 object-cover"
            />
            <figcaption className="mt-2 text-xs text-slate-400">{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
