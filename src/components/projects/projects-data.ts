import type { LinkProps } from '@tanstack/react-router'
import pomodoroApp400 from '../../assets/projects/pomodoro-app-400.webp'
import pomodoroApp600 from '../../assets/projects/pomodoro-app-600.webp'
import pomodoroCard800 from '../../assets/projects/pomodoro-card-800.webp'
import pomodoroCard1600 from '../../assets/projects/pomodoro-card-1600.webp'
import pomodoroLock400 from '../../assets/projects/pomodoro-lock-screen-400.webp'
import pomodoroLock600 from '../../assets/projects/pomodoro-lock-screen-600.webp'
import pomodoroStandby900 from '../../assets/projects/pomodoro-standby-900.webp'
import pomodoroStandby1800 from '../../assets/projects/pomodoro-standby-1800.webp'
import pomodoroWidget400 from '../../assets/projects/pomodoro-widget-400.webp'
import pomodoroWidget600 from '../../assets/projects/pomodoro-widget-600.webp'

// Everything the Projects pages show. Adding a project is one new entry in
// `projects` below (plus its own detail route, if it gets one).
//
// Images are the resized .webp files in src/assets/projects/, made from
// full-size masters kept out of git (see .gitignore). Skyline Defense is
// deliberately NOT listed here -- it's a hidden Easter egg and stays
// unlisted.

export const TESTFLIGHT_URL = 'https://testflight.apple.com/join/GYzhgfF5'

export type ProjectStatus = 'Beta on TestFlight' | 'Live'

export interface ProjectImage {
  src: string
  // Width-described candidates ("url 400w, url 600w") for retina screens.
  srcSet?: string
  // Intrinsic size of the largest candidate; sets the aspect ratio.
  width: number
  height: number
  alt: string
}

export interface ProjectLinks {
  // An internal page about the project (its own detail page, or /stack).
  detail?: { to: LinkProps['to']; label: string }
  github?: string
  external?: { href: string; label: string }
}

export interface Project {
  slug: string
  name: string
  // The name under the app's icon on iPhone and iPad, when it differs from
  // `name`, and on Apple Watch if that's different again.
  displayName?: string
  watchDisplayName?: string
  summary: string
  status: ProjectStatus
  // Platform/tech pills.
  tags: string[]
  // 16:9 card image; the card shows a placeholder without one.
  image?: ProjectImage
  links: ProjectLinks
}

export interface Screenshot {
  image: ProjectImage
  caption: string
}

export const pomodoroSimple: Project = {
  slug: 'pomodoro-simple',
  name: 'pomodoro-simple',
  displayName: 'Simple: StandBy Timer',
  watchDisplayName: 'Simple Timer',
  summary: 'A focused Pomodoro timer for iPhone, iPad, and Apple Watch, with Lock Screen and StandBy controls.',
  status: 'Beta on TestFlight',
  tags: ['iOS', 'iPadOS', 'watchOS'],
  image: {
    src: pomodoroCard800,
    srcSet: `${pomodoroCard800} 800w, ${pomodoroCard1600} 1600w`,
    width: 1600,
    height: 900,
    alt: 'Two iPhone screens from pomodoro-simple: the in-app timer and the Lock Screen Live Activity.',
  },
  links: {
    detail: { to: '/projects/pomodoro-simple', label: 'View project' },
    github: 'https://github.com/wiserabidwombat/pomodoro-simple',
  },
}

export const personalSite: Project = {
  slug: 'my-personal-site',
  name: 'aarontilley.me',
  summary: 'This site: blog, resume, and hobby collections, built with Claude Code.',
  status: 'Live',
  tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Vercel'],
  image: {
    // The site's own social preview banner (public/og-image.png).
    src: '/og-image.png',
    width: 1200,
    height: 630,
    alt: '',
  },
  links: {
    detail: { to: '/stack', label: 'About this site' },
    github: 'https://github.com/wiserabidwombat/my-personal-site',
  },
}

export const projects: readonly Project[] = [pomodoroSimple, personalSite]

// iPhone screenshots are 1320x2868 (portrait) or 2868x1320 (StandBy).
const portrait = (small: string, large: string, alt: string): ProjectImage => ({
  src: small,
  srcSet: `${small} 400w, ${large} 600w`,
  width: 600,
  height: 1304,
  alt,
})

export const pomodoroScreenshots: readonly Screenshot[] = [
  {
    image: portrait(
      pomodoroApp400,
      pomodoroApp600,
      'pomodoro-simple timer screen showing a Focus session with 8:27 remaining, session dots, and Pause and Skip buttons.',
    ),
    caption: 'The timer',
  },
  {
    image: portrait(
      pomodoroLock400,
      pomodoroLock600,
      'iPhone Lock Screen with a pomodoro-simple Live Activity showing a Focus session with 9:51 left and Pause and Skip buttons.',
    ),
    caption: 'Lock Screen',
  },
  {
    image: {
      src: pomodoroStandby900,
      srcSet: `${pomodoroStandby900} 900w, ${pomodoroStandby1800} 1800w`,
      width: 1800,
      height: 828,
      alt: 'iPhone in StandBy mode on its side, showing the pomodoro-simple timer at 9:34 with pause and skip buttons next to a calendar.',
    },
    caption: 'StandBy',
  },
  {
    image: portrait(
      pomodoroWidget400,
      pomodoroWidget600,
      "pomodoro-simple home screen widget showing a Focus session at 9:02, controls, and today's goal progress.",
    ),
    caption: 'Home Screen widget',
  },
]

export interface FeatureItem {
  title: string
  text: string
}

export const pomodoroFeatures: readonly FeatureItem[] = [
  {
    title: 'Lock Screen and StandBy',
    text: 'pause, resume and skip without unlocking your phone, plus a live countdown when your phone is on its side while charging.',
  },
  {
    title: 'Custom timer profiles',
    text: 'set focus and break lengths and how many sessions make a cycle.',
  },
  {
    title: 'Make it yours',
    text: 'accent colors, chime sounds, and an option to silence chimes during Focus.',
  },
  {
    title: 'Stats and daily goals',
    text: 'track completed focus sessions, set a daily target, and export your history as CSV.',
  },
]

// "How I Built It", one string per paragraph.
export const pomodoroBuildStory: readonly string[] = [
  'pomodoro-simple is my first iOS app. I wanted a timer for my own focus sessions that did exactly what I needed and nothing else, so I built one.',
  'I built it with Claude. We started small: a basic app that met a short list of requirements. Once that worked, I added Lock Screen controls and StandBy support, which are the features I use most.',
  "That second step was the hard part. The app, its widgets and the Live Activity all show the same timer, but each one runs separately and follows its own rules. Keeping them in sync, and learning each one's quirks, taught me more about how iOS works than the rest of the app combined.",
]
