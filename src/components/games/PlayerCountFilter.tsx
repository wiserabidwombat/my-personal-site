import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { PLAYER_COUNT_OPTIONS } from './shared'

type Props = {
  value: number | null
  onChange: (value: number | null) => void
}

function formatCount(count: number) {
  return `${count} ${count === 1 ? 'Player' : 'Players'}`
}

export function PlayerCountFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  function select(next: number | null) {
    onChange(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={`${buttonVariants({ variant: 'outline' })} gap-1.5`}>
        {value !== null ? formatCount(value) : 'Number of Players'}
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem data-checked={value === null} onSelect={() => select(null)}>
                Any
              </CommandItem>
              {PLAYER_COUNT_OPTIONS.map((count) => (
                <CommandItem key={count} data-checked={value === count} onSelect={() => select(count)}>
                  {formatCount(count)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
