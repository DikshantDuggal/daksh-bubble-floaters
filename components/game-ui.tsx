import type { ReactNode } from 'react'
import Link from 'next/link'
import { Bot, ChartColumnIncreasing, Users, Volume2, VolumeX } from 'lucide-react'
import { RANGES, type Diff } from '@/lib/sorting'

export function AppHeader({
  mode,
  muted,
  onToggleMute,
}: {
  mode: 'bot' | 'versus'
  muted: boolean
  onToggleMute: () => void
}) {
  const tabs = [
    { href: '/', id: 'bot', label: 'Vs Bot', icon: Bot },
    { href: '/versus', id: 'versus', label: '2 Players', icon: Users },
  ] as const
  return (
    <header className="flex items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-ring">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
          <ChartColumnIncreasing className="h-4 w-4 text-neon-green" aria-hidden="true" />
        </span>
        <span className="hidden font-display text-sm font-semibold tracking-wider sm:inline">SORTING RACE</span>
      </Link>
      <div className="flex items-center gap-2">
        <nav aria-label="Game mode" className="flex rounded-lg border bg-card p-1">
          {tabs.map((t) => {
            const active = t.id === mode
            return (
              <Link
                key={t.id}
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors ${
                  active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <t.icon className="h-4 w-4" aria-hidden="true" />
                {t.label}
              </Link>
            )
          })}
        </nav>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          aria-pressed={muted}
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}

export function Hero({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neon-cyan">{eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-black tracking-wider text-balance md:text-5xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
        {children}
      </p>
    </section>
  )
}

export function DifficultyPicker({
  value,
  onChange,
  disabled,
}: {
  value: Diff
  onChange: (d: Diff) => void
  disabled?: boolean
}) {
  return (
    <div>
      <p id="difficulty-label" className="mb-1.5 text-xs font-medium text-muted-foreground">
        Difficulty
      </p>
      <div role="group" aria-labelledby="difficulty-label" className="flex rounded-lg border bg-background p-1">
        {(Object.keys(RANGES) as Diff[]).map((d) => (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onChange(d)}
            aria-pressed={value === d}
            className={`h-8 flex-1 rounded-md px-3 text-sm font-semibold capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              value === d ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {d}
            <span className="ml-1 hidden text-xs font-normal text-muted-foreground sm:inline">
              {RANGES[d][0]}–{RANGES[d][1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function NameField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="min-w-0 flex-1 sm:max-w-56">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        maxLength={24}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
      />
    </div>
  )
}

export function StartButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-11 rounded-lg bg-primary px-8 font-display text-sm font-black tracking-wider text-primary-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function TimerStat({ time, total }: { time: number; total: number }) {
  const low = time <= 10
  const pct = Math.max(0, Math.min(100, (time / total) * 100))
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs font-medium text-muted-foreground">Time left</p>
      <p className={`mt-1 font-display text-2xl font-black tabular-nums ${low ? 'text-neon-pink' : 'text-foreground'}`}>
        {time}
        <span className="text-sm text-muted-foreground">s</span>
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent"
        role="progressbar"
        aria-label="Time remaining"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={time}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%`, background: low ? 'var(--neon-pink)' : 'var(--neon-yellow)' }}
        />
      </div>
    </div>
  )
}

export function Stat({ label, value, dot }: { label: string; value: ReactNode; dot?: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="flex items-center gap-1.5 truncate text-xs font-medium text-muted-foreground">
        {dot && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} aria-hidden="true" />}
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-black tabular-nums">{value}</p>
    </div>
  )
}

export function BoardPanel({
  title,
  subtitle,
  dot,
  aside,
  children,
}: {
  title: string
  subtitle?: ReactNode
  dot: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="relative flex flex-col rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-wide">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dot }} aria-hidden="true" />
            <span className="truncate">{title}</span>
          </h2>
          {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        {aside}
      </div>
      {children}
      <div className="belt mt-1 h-3 rounded border" aria-hidden="true" />
    </section>
  )
}

export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="Bar color legend">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ background: it.color }} aria-hidden="true" />
          {it.label}
        </li>
      ))}
    </ul>
  )
}

export function StatusPill({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center">
      <p
        role="status"
        aria-live="polite"
        className="rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground"
      >
        {children}
      </p>
    </div>
  )
}
