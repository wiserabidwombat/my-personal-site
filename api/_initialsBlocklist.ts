// Three-letter combinations not allowed as leaderboard initials. A small,
// proportionate list for a friendly board, not an exhaustive filter: slurs
// and the most common crude words and their usual letter swaps. Words that
// only sometimes read as crude (or are ordinary initials) stay allowed. Kept
// server-only so the list never ships in the game bundle.
//
// The underscore prefix keeps Vercel from treating this file as a function.
const BLOCKED = new Set([
  'ASS', 'AZZ', 'CUM', 'CUN', 'COC', 'COK', 'DIC', 'DIK', 'DIX', 'FAG', 'FAP', 'FCK', 'FUC', 'FUK', 'FUQ', 'FKU',
  'FXK', 'JAP', 'JIZ', 'KKK', 'KYS', 'NAZ', 'NGR', 'NIG', 'NGA', 'PIS', 'PUS', 'SEX', 'SHT', 'SLT', 'SUK', 'TIT',
  'TWT', 'VAG', 'WOP', 'XXX',
])

export function isBlockedInitials(initials: string): boolean {
  return BLOCKED.has(initials.toUpperCase())
}
