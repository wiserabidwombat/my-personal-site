import { createFileRoute } from '@tanstack/react-router'
import { Games } from '../components/Games'

export const Route = createFileRoute('/games')({
  component: Games,
})
