'use client'

import { useEffect, useRef } from 'react'
import { Frown, Trophy } from 'lucide-react'

type ResultOverlayProps = {
  result: 'win' | 'lose'
  title: string
  detail: string
  onPlayAgain: () => void
  onClose: () => void
}

const CONFETTI_COLORS = ['var(--neon-green)', 'var(--neon-cyan)', 'var(--neon-yellow)', 'var(--neon-purple)', 'var(--neon-pink)']
const CONFETTI = Array.from({ length: 48 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 20) / 10,
  duration: 2.4 + ((i * 7) % 15) / 10,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + (i % 4) * 2,
}))

export function ResultOverlay({ result, title, detail, onPlayAgain, onClose }: ResultOverlayProps) {
  const playRef = useRef<HTMLButtonElement>(null)
  const won = result === 'win'
  const accent = won ? 'var(--neon-green)' : 'var(--neon-pink)'

  useEffect(() => {
    playRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/80 p-4 backdrop-blur-sm"
    >
      {won ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="confetti absolute -top-4 rounded-sm"
              style={{
                left: `${c.left}%`,
                width: c.size,
                height: c.size * 1.6,
                background: c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
              }}
            />
          ))}
        </div>
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {CONFETTI.slice(0, 24).map((c, i) => (
            <span
              key={i}
              className="rain absolute -top-8 w-px"
              style={{
                left: `${c.left}%`,
                height: 28 + (i % 3) * 12,
                background: 'linear-gradient(transparent, var(--neon-cyan))',
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration / 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="pop-in relative flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-8 text-center shadow-2xl"
        style={{ borderColor: `color-mix(in oklch, ${accent} 40%, var(--border))` }}
      >
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full ${won ? 'trophy-bounce' : 'sad-sway'}`}
          style={{ background: `color-mix(in oklch, ${accent} 15%, transparent)` }}
        >
          {won ? (
            <Trophy className="h-10 w-10 text-neon-green" aria-hidden="true" />
          ) : (
            <Frown className="h-10 w-10 text-neon-pink" aria-hidden="true" />
          )}
        </div>
        <h2
          id="result-title"
          className="font-display text-2xl font-black tracking-wider text-balance md:text-3xl"
        >
          {won ? 'Congratulations!' : 'Better luck next time'}
        </h2>
        <p className="text-base font-semibold" style={{ color: accent }}>
          {title}
        </p>
        <p className="text-sm text-muted-foreground text-pretty">{detail}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <button
            ref={playRef}
            type="button"
            onClick={onPlayAgain}
            className="h-10 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Play again
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border bg-background px-6 text-sm font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
