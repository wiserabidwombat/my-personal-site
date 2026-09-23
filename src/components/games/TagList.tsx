import { useState } from 'react'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Props = {
  tags: string[]
  onTagClick: (tag: string) => void
  maxVisible?: number
}

export function TagList({ tags, onTagClick, maxVisible = 2 }: Props) {
  const [open, setOpen] = useState(false)

  if (tags.length === 0) {
    return <span className="text-slate-500">—</span>
  }

  const visible = tags.slice(0, maxVisible)
  const rest = tags.slice(maxVisible)

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          onClick={() => onTagClick(tag)}
          className="cursor-pointer text-[10px] select-none"
        >
          {tag}
        </Badge>
      ))}
      {rest.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={`${badgeVariants({ variant: 'outline' })} cursor-pointer text-[10px] select-none`}
          >
            +{rest.length} more
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 flex-row flex-wrap gap-1.5 p-3">
            {rest.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                onClick={() => {
                  onTagClick(tag)
                  setOpen(false)
                }}
                className="cursor-pointer text-[10px] select-none"
              >
                {tag}
              </Badge>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
