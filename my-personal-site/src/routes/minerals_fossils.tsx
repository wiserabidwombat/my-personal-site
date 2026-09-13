import { createFileRoute } from '@tanstack/react-router'
import { Fossils } from '../components/Fossils'
import { pageTitle } from '../lib/title'

export const Route = createFileRoute('/minerals_fossils')({
  head: () => ({
    meta: [{ title: pageTitle('Minerals & Fossils') }],
  }),
  component: Fossils,
})
