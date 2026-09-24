// Source credit under the Library heading, styled like the BoardGameGeek
// credit on the Games page.
export function HardcoverCredit() {
  return (
    <p className="mt-1 text-xs text-slate-500">
      Data from{' '}
      <a
        href="https://hardcover.app"
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-400 underline underline-offset-2 hover:text-[var(--laser-cyan)]"
      >
        Hardcover
      </a>
    </p>
  )
}
