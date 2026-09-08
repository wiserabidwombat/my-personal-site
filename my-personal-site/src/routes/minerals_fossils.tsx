import { createFileRoute } from '@tanstack/react-router'
import { Fossils } from '../components/Fossils'

export const Route = createFileRoute('/minerals_fossils')({
  component: Fossils,
})
