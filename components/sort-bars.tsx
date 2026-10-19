type SortBarsProps = {
  arr: number[]
  hl?: number[]
  swap?: boolean
  sel?: number | null
  locked?: boolean[]
  onClick?: (i: number) => void
  color: string
}

export function SortBars({ arr, hl, swap, sel, locked, onClick, color }: SortBarsProps) {
  const max = Math.max(20, ...arr)
  return (
    <div className="mt-5 flex h-64 items-end justify-center gap-1 px-1 sm:gap-2">
      {arr.map((v, i) => {
        const on = hl?.includes(i)
        const isLocked = locked?.[i] ?? false
        const bg =
          sel === i
            ? 'var(--neon-cyan)'
            : on
              ? swap
                ? 'var(--neon-purple)'
                : 'var(--neon-yellow)'
              : isLocked
                ? 'var(--neon-green)'
                : color
        return (
          <button
            key={i}
            type="button"
            disabled={!onClick || isLocked}
            onClick={() => onClick?.(i)}
            aria-label={`Bar ${i + 1}, value ${v}${isLocked ? ', locked in final position' : ''}`}
            aria-pressed={sel === i}
            title={isLocked ? 'Already in its final position' : undefined}
            className={`flex max-w-10 flex-1 items-start justify-center rounded-t-md pt-1 text-xs font-semibold tabular-nums text-primary-foreground transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default ${
              onClick && !isLocked ? 'cursor-pointer hover:brightness-110' : ''
            } ${sel === i ? '-translate-y-1' : ''}`}
            style={{
              height: `${(v / max) * 100}%`,
              background: bg,
              boxShadow: `0 0 8px color-mix(in oklch, ${bg} 45%, transparent)`,
            }}
          >
            {v}
          </button>
        )
      })}
    </div>
  )
}
