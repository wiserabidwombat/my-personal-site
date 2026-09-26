import { useSeason } from '../../hooks/useSeason'
import dallasSkylineDark from '../../assets/dallas-skyline.webp'
import dallasSkylineLight from '../../assets/dallas-skyline-light.webp'

// Shared by every skyline <img> so they can never drift apart -- identical
// height, object-fit/position, pixelated rendering, and fade mask. On mobile
// the panorama is cropped to a fixed height, anchored left so Reunion Tower
// and the Margaret Hunt Hill Bridge stay in frame.
const skylineImgClass =
  'block h-56 w-full object-cover [object-position:left_bottom] select-none [image-rendering:pixelated] [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_80%,transparent_100%)] sm:h-auto'

// Optional October art (2172x724, same framing as the normal skylines):
//   src/assets/skyline-halloween-dark.webp
//   src/assets/skyline-halloween-light.webp
// Each is used only if its file exists; until then the normal skyline shows
// for that theme, Halloween or not.
const halloweenFiles = import.meta.glob<string>('../../assets/skyline-halloween-{dark,light}.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

type Theme = 'dark' | 'light'

const skylines: Record<Theme, { src: string; alt: string; halloweenSrc?: string; halloweenAlt: string }> = {
  dark: {
    src: dallasSkylineDark,
    alt: 'Pixel-art neon skyline of Dallas, Texas at night, with Reunion Tower, the Margaret Hunt Hill Bridge, and American Airlines Center reflected in the water below',
    halloweenSrc: halloweenFiles['../../assets/skyline-halloween-dark.webp'],
    halloweenAlt:
      "Pixel-art Dallas skyline on Halloween night under a huge orange moon: bats over Reunion Tower and the Margaret Hunt Hill Bridge, a tentacled monster climbing a tower, a glowing jack-o'-lantern, and tentacles rising from the purple water in front of American Airlines Center",
  },
  light: {
    src: dallasSkylineLight,
    alt: 'Pixel-art Dallas, Texas skyline at dawn, rendered in a pastel palette, with Reunion Tower, the Margaret Hunt Hill Bridge, and American Airlines Center reflected in the water below',
    halloweenSrc: halloweenFiles['../../assets/skyline-halloween-light.webp'],
    halloweenAlt:
      "Pixel-art Dallas skyline at dusk in a pastel Halloween palette: bats and a full moon over Reunion Tower and the Margaret Hunt Hill Bridge, a tentacled monster climbing a tower, a glowing jack-o'-lantern, and tentacles rising from the water in front of American Airlines Center",
  },
}

// Both themes' images are always mounted and swapped purely by the
// theme-dark-only/theme-light-only classes (keyed off <html data-theme>),
// and the Halloween art by season-only/season-hidden (keyed off
// <html data-season>) -- so prerendered HTML paints the right art before
// any JS runs, with no flash. The normal images stay eager (they're the
// hero's LCP), with fetchPriority favoring the active theme. The Halloween
// images start lazy: hidden (display: none) outside October, the browser
// never downloads them. Once the season is confirmed active they switch to
// eager, so the other theme's Halloween art is ready before a toggle (a
// lazy, hidden image may not load until it's shown).
export function SkylineImages({ theme }: { theme: Theme }) {
  const { active: halloween } = useSeason()
  return (
    <>
      {(['dark', 'light'] as const).map((variant) => {
        const skyline = skylines[variant]
        const hasHalloween = Boolean(skyline.halloweenSrc)
        return (
          <div key={variant} className={variant === 'dark' ? 'theme-dark-only' : 'theme-light-only'}>
            <div className={hasHalloween ? 'season-hidden' : undefined}>
              <img
                src={skyline.src}
                alt={skyline.alt}
                className={skylineImgClass}
                loading="eager"
                decoding="async"
                fetchPriority={theme === variant ? 'high' : 'low'}
              />
            </div>
            {hasHalloween && (
              <div className="season-only">
                <img
                  src={skyline.halloweenSrc}
                  alt={skyline.halloweenAlt}
                  className={skylineImgClass}
                  loading={halloween ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={halloween && theme === variant ? 'high' : 'low'}
                />
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
