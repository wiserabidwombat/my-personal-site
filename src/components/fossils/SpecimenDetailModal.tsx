import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Specimen } from '../../types/specimen'
import { SpecimenDetailContent } from './SpecimenDetailContent'

type Props = {
  specimen: Specimen
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Reuses the board games detail modal's Dialog pattern (glow border, dark
// background, accent typography) via the same DialogContent styling, close
// behavior (X button / click-outside / Escape are all handled by the
// shared Dialog primitive already). No p-6/scrollbar-gutter padding on the
// scrolling wrapper here -- the hero image needs to sit flush against the
// rounded corners; SpecimenDetailContent adds its own padding below it.
export function SpecimenDetailModal({ specimen, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full overflow-visible border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)] p-0 shadow-glow-purple sm:max-w-lg">
        <div className="max-h-[85vh] overflow-y-auto rounded-4xl">
          <DialogHeader>
            <DialogTitle className="sr-only">{specimen.name}</DialogTitle>
          </DialogHeader>
          <SpecimenDetailContent specimen={specimen} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
