export function uniqueSorted(values: string[][]) {
  return [...new Set(values.flat())].sort((a, b) => a.localeCompare(b))
}
