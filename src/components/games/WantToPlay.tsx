import { Bookmark01Icon } from '@hugeicons/core-free-icons'
import type { BoardGame } from '../../types/board-game'
import { GameArt } from './GameArt'
import { GameDetailTrigger } from './GameDetailTrigger'
import { GameSection } from './GameSection'
import { findGameByName, formatPlaytime, formatRange } from './shared'

const wantToPlay = [
  'Ark Nova',
  'Perseverance: Castaway Chronicles – Episodes 1 & 2',
  'The Crew: Mission Deep Sea',
  'The Lord of the Rings: The Fellowship of the Ring – Trick-Taking Game',
]

type Props = {
  games: BoardGame[]
}

// Small horizontal cards (thumbnail + name), replacing the old
// slash-separated list whose wrapped line started with a stray slash.
export function WantToPlay({ games }: Props) {
  return (
    <GameSection icon={Bookmark01Icon} title="Want to Play" description="On my immediate radar.">
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {wantToPlay.map((name) => {
          const game = findGameByName(games, name)
          return (
            <li key={name}>
              <GameDetailTrigger game={game} className="items-center gap-3 p-2">
                <GameArt
                  name={name}
                  src={game?.thumbnailUrl ?? game?.imageUrl}
                  padded={false}
                  className="w-24 shrink-0 rounded-lg"
                />
                <div className="min-w-0 py-1 pr-2">
                  <p className="text-sm font-semibold text-slate-50">{name}</p>
                  {game && (
                    <p className="mt-1 text-xs text-slate-400">
                      {formatRange(game.playersMin, game.playersMax)} players · {formatPlaytime(game)}
                    </p>
                  )}
                </div>
              </GameDetailTrigger>
            </li>
          )
        })}
      </ul>
    </GameSection>
  )
}
