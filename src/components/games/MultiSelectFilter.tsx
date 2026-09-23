import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

type Props = {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}

export function MultiSelectFilter({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)

  function toggle(option: string) {
    onChange(
      selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option]
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={`${buttonVariants({ variant: 'outline' })} gap-1.5`}>
        {label}
        {selected.length > 0 && (
          <Badge variant="secondary" className="text-[10px]">
            {selected.length}
          </Badge>
        )}
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  data-checked={selected.includes(option)}
                  onSelect={() => toggle(option)}
                >
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
