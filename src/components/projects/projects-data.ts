import type { LinkProps } from '@tanstack/react-router'

// Everything the Projects pages show. Adding a project is one new entry in
// `projects` below (plus its own detail route, if it gets one).
//
// Images live in src/assets/projects/ and are looked up by file name, so a
// file that hasn't been added yet just renders a placeholder slot instead of
// breaking the build. Skyline Defense is deliberately NOT listed here -- it's
// a hidden Easter egg and stays unlisted.

// TODO: paste your public TestFlight invite link (https://testflight.apple.com/join/...).
// While it's empty the "Join the beta" button renders disabled.
export const TODO_TESTFLIGHT_URL = ''

export type ProjectStatus = 'Beta on TestFlight' | 'Live'

export interface ProjectImage {
  // Resolved URL, or null until the file exists in src/assets/projects/.
  src: string | null
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
  summary: string
  status: ProjectStatus
  // Platform/tech pills.
  tags: string[]
  image: ProjectImage
  links: ProjectLinks
}

export interface Screenshot {
  // Expected file in src/assets/projects/.
  file: string
  image: ProjectImage
  // Shown under the placeholder until the file is added.
  caption: string
}

const assetFiles = import.meta.glob<string>('../../assets/projects/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

// The built URL for src/assets/projects/<file>, or null if it isn't there yet.
export function projectAsset(file: string): string | null {
  return assetFiles[`../../assets/projects/${file}`] ?? null
}

export const pomodoroSimple: Project = {
  slug: 'pomodoro-simple',
  name: 'pomodoro-simple',
  summary: 'A focused Pomodoro timer for iPhone, with Lock Screen and StandBy controls.',
  status: 'Beta on TestFlight',
  tags: ['iOS'],
  image: {
    // TODO: add src/assets/projects/pomodoro-card.png (a 16:9 image for the card).
    src: projectAsset('pomodoro-card.png'),
    // TODO: alt text for the card image.
    alt: '',
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
    alt: '',
  },
  links: {
    detail: { to: '/stack', label: 'About this site' },
    github: 'https://github.com/wiserabidwombat/my-personal-site',
  },
}

export const projects: readonly Project[] = [pomodoroSimple, personalSite]

// TODO: drop the screenshots into src/assets/projects/ under these names and
// fill in each alt text; they appear automatically once the files exist.
export const pomodoroScreenshots: readonly Screenshot[] = [
  {
    file: 'pomodoro-1.png',
    image: { src: projectAsset('pomodoro-1.png'), alt: '' /* TODO: alt text */ },
    caption: 'Screenshot 1',
  },
  {
    file: 'pomodoro-2.png',
    image: { src: projectAsset('pomodoro-2.png'), alt: '' /* TODO: alt text */ },
    caption: 'Screenshot 2',
  },
  {
    file: 'pomodoro-lock-screen.png',
    image: { src: projectAsset('pomodoro-lock-screen.png'), alt: '' /* TODO: alt text */ },
    caption: 'Lock Screen / StandBy controls',
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
