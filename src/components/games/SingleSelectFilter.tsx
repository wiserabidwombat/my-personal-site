import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '../../../@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../../../@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../@/components/ui/command'

type Props = {
  label: string
  options: string[]
  value: string | null
  onChange: (value: string | null) => void
}

export function SingleSelectFilter({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  function select(next: string | null) {
    onChange(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={`${buttonVariants({ variant: 'outline' })} gap-1.5`}>
        {value ?? label}
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              <CommandItem data-checked={value === null} onSelect={() => select(null)}>
                Any {label}
              </CommandItem>
              {options.map((option) => (
                <CommandItem key={option} data-checked={value === option} onSelect={() => select(option)}>
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
