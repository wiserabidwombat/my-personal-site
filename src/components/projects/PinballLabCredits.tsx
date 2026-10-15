import { cn } from 'cn'
import { policyLink, policyList } from './privacy/PolicySection'

type Props = {
  className?: string
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={policyLink}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

// Pinball Lab's credits: who built it, and the third-party art, sounds
// and fonts with their licenses.
export function PinballLabCredits({ className }: Props) {
  return (
    <ul className={cn(policyList, className)}>
      <li>Built by Aaron Tilley with Claude.</li>
      <li>
        Art and sounds by <ExternalLink href="https://kenney.nl">Kenney (kenney.nl)</ExternalLink>, released under CC0.
      </li>
      <li>
        Orbitron and Cinzel fonts, under the{' '}
        <ExternalLink href="https://openfontlicense.org">SIL Open Font License 1.1</ExternalLink>.
      </li>
    </ul>
  )
}
