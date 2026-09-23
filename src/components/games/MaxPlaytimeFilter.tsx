import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { PLAYTIME_THRESHOLDS } from './shared'

type Props = {
  value: number | null
  onChange: (value: number | null) => void
}

export function MaxPlaytimeFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  function select(next: number | null) {
    onChange(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={`${buttonVariants({ variant: 'outline' })} gap-1.5`}>
        {value ? `Up to ${value} min` : 'Max Playtime'}
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem data-checked={value === null} onSelect={() => select(null)}>
                Any
              </CommandItem>
              {PLAYTIME_THRESHOLDS.map((threshold) => (
                <CommandItem
                  key={threshold}
                  data-checked={value === threshold}
                  onSelect={() => select(threshold)}
                >
                  Up to {threshold} min
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
