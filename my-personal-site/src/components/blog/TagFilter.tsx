import { Badge } from '../../../@/components/ui/badge'

type Props = {
  tags: string[]
  active: string | null
  onChange: (tag: string | null) => void
}

export function TagFilter({ tags, active, onChange }: Props) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Badge
        variant={active === null ? 'default' : 'outline'}
        render={<button type="button" onClick={() => onChange(null)} />}
        className="cursor-pointer"
      >
        All
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={active === tag ? 'default' : 'outline'}
          render={<button type="button" onClick={() => onChange(tag)} />}
          className="cursor-pointer capitalize"
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
