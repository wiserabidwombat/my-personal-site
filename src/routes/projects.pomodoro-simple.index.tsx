import { createFileRoute } from '@tanstack/react-router'
import { PomodoroSimple } from '../components/projects/PomodoroSimple'
import { seoMeta, canonicalLink } from '../lib/meta'
import { pomodoroSimpleMeta } from './routeMeta'

export const Route = createFileRoute('/projects/pomodoro-simple/')({
  head: () => ({
    meta: seoMeta(pomodoroSimpleMeta),
    links: [canonicalLink(pomodoroSimpleMeta.path)],
  }),
  component: PomodoroSimple,
})
