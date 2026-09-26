// Current Status grid classes for the number of cards actually shown (live
// cards can hide), so no row is ragged and no lone card stretches across a
// whole row. Mobile is always one column.
//   2 -> one row of 2        3 -> one row of 3
//   4 -> 2 x 2 on tablet, one row of 4 on desktop
//   5 -> 3 + 2 from tablet up, on a 6-column grid: the first three cards
//        span 2 columns and the last two span 3, so both rows fill evenly.
export function statusGridClass(count: number): string {
  switch (count) {
    case 2:
      return 'sm:grid-cols-2'
    case 3:
      return 'sm:grid-cols-3'
    case 4:
      return 'sm:grid-cols-2 lg:grid-cols-4'
    case 5:
      return 'sm:grid-cols-6'
    default:
      return 'sm:grid-cols-2 lg:grid-cols-3'
  }
}

export function statusCardClass(count: number, index: number): string {
  if (count !== 5) return ''
  return index < 3 ? 'sm:col-span-2' : 'sm:col-span-3'
}
