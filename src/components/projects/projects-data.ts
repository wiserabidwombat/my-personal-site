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
  // TODO: confirm this one-line description.
  summary: 'A simple Pomodoro timer for iOS.',
  status: 'Beta on TestFlight',
  // TODO: add tech pills you want to show (e.g. the UI framework), if any.
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

// Each item is a suggested phrasing, not a confirmed fact. Confirm or rewrite
// it, then set `confirmed: true` to drop its on-page TODO marker.
export interface FeatureItem {
  text: string
  confirmed: boolean
}

export const pomodoroFeatures: readonly FeatureItem[] = [
  { text: 'Start, pause, and reset focus and break sessions with one tap.', confirmed: false },
  { text: 'Control the timer from the Lock Screen and StandBy.', confirmed: false },
  { text: 'Adjustable focus and break lengths.', confirmed: false },
  { text: 'No account and no sign-up.', confirmed: false },
]
