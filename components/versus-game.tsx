'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SortBars } from '@/components/sort-bars'
import { ResultOverlay } from '@/components/result-overlay'
import { beep, isSorted, lockAfterSwap, makeArr, type Diff } from '@/lib/sorting'
import {
  AppHeader,
  BoardPanel,
  DifficultyPicker,
  Hero,
  Legend,
  NameField,
  StartButton,
  Stat,
  StatusPill,
  TimerStat,
} from '@/components/game-ui'

const TIME = 60

type Player = { arr: number[]; lock: boolean[]; cursor: number; moves: number }
type Controls = { left: string; right: string; select: string }

const CONTROLS: [Controls, Controls] = [
  { left: 'a', right: 's', select: 'd' },
  { left: 'k', right: 'l', select: 'j' },
]
const COLORS = ['var(--neon-green)', 'var(--neon-pink)']

const emptyPlayer: Player = { arr: [], lock: [], cursor: 0, moves: 0 }

function firstUnlocked(lock: boolean[], from = 0) {
  for (let k = 0; k < lock.length; k++) {
    const i = (from + k) % lock.length
    if (!lock[i]) return i
  }
  return -1
}

function Keycap({ k, label }: { k: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="flex h-7 min-w-7 items-center justify-center rounded-md border border-b-2 bg-background px-1.5 text-xs font-semibold uppercase text-foreground">
        {k}
      </kbd>
      <span className="text-xs text-muted-foreground">{label}</span>
    </span>
  )
}

export function VersusGame() {
  const [names, setNames] = useState(['Player 1', 'Player 2'])
  const [muted, setMuted] = useState(false)
  const [diff, setDiff] = useState<Diff>('easy')
  const [count, setCount] = useState(0)
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(TIME)
  const [wins, setWins] = useState([0, 0, 0])
  const [players, setPlayers] = useState<[Player, Player]>([emptyPlayer, emptyPlayer])
  const [bump, setBump] = useState<[number, number]>([0, 0])
  const [result, setResult] = useState<{ kind: 'win' | 'lose'; title: string; detail: string } | null>(null)

  const playersRef = useRef(players)
  playersRef.current = players
  const sortedRef = useRef<number[]>([])
  const runningRef = useRef(running)
  runningRef.current = running
  const namesRef = useRef(names)
  namesRef.current = names
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  const finish = useCallback((winner: 0 | 1 | null) => {
    setRunning(false)
    runningRef.current = false
    setWins((w) => w.map((v, i) => (i === (winner ?? 2) ? v + 1 : v)))
    beep(winner === null ? 220 : 880, mutedRef.current)
    const n = namesRef.current
    setResult(
      winner === null
        ? { kind: 'lose', title: 'Time expired!', detail: 'Neither player finished sorting in time.' }
        : {
            kind: 'win',
            title: `${n[winner]} wins!`,
            detail: `Better luck next time, ${n[winner === 0 ? 1 : 0]}.`,
          },
    )
  }, [])

  const start = () => {
    setResult(null)
    const a = makeArr(diff)
    sortedRef.current = [...a].sort((x, y) => x - y)
    const fresh = (): Player => ({ arr: [...a], lock: a.map(() => false), cursor: 0, moves: 0 })
    setPlayers([fresh(), fresh()])
    setTime(TIME)
    setCount(3)
  }

  const closeResult = useCallback(() => setResult(null), [])

  useEffect(() => {
    if (count <= 0) return
    beep(count === 1 ? 660 : 440, mutedRef.current)
    const t = setTimeout(() => {
      setCount((c) => c - 1)
      if (count === 1) setRunning(true)
    }, 800)
    return () => clearTimeout(t)
  }, [count])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setTime((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => {
    if (running && time <= 0) finish(null)
  }, [time, running, finish])

  useEffect(() => {
    const act = (pi: 0 | 1, action: 'left' | 'right' | 'select') => {
      const p = playersRef.current[pi]
      const n = p.arr.length
      if (action === 'select') {
        const next = firstUnlocked(p.lock, p.cursor + 1)
        if (next === -1) return
        const updated: [Player, Player] = [...playersRef.current]
        updated[pi] = { ...p, cursor: next }
        playersRef.current = updated
        setPlayers(updated)
        beep(500, mutedRef.current)
        return
      }
      const from = p.cursor
      const to = from + (action === 'left' ? -1 : 1)
      if (to < 0 || to >= n || p.lock[to] || p.lock[from]) {
        setBump((b) => (pi === 0 ? [b[0] + 1, b[1]] : [b[0], b[1] + 1]))
        beep(160, mutedRef.current)
        return
      }
      const arr = [...p.arr]
      ;[arr[from], arr[to]] = [arr[to], arr[from]]
      const lock = lockAfterSwap(arr, p.lock, sortedRef.current, [from, to])
      const cursor = lock[to] ? firstUnlocked(lock) : to
      const updated: [Player, Player] = [...playersRef.current]
      updated[pi] = { arr, lock, cursor: cursor === -1 ? to : cursor, moves: p.moves + 1 }
      playersRef.current = updated
      setPlayers(updated)
      beep(pi === 0 ? 660 : 740, mutedRef.current)
      if (isSorted(arr)) finish(pi)
    }

    const onKey = (e: KeyboardEvent) => {
      if (!runningRef.current || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.isContentEditable)) return
      const key = e.key.toLowerCase()
      for (const pi of [0, 1] as const) {
        const c = CONTROLS[pi]
        const action = key === c.left ? 'left' : key === c.right ? 'right' : key === c.select ? 'select' : null
        if (action) {
          e.preventDefault()
          act(pi, action)
          return
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish])

  const busy = running || count > 0
  const remaining = (p: Player) => p.lock.filter((l) => !l).length

  const status =
    count > 0
      ? `Get ready… ${count}`
      : running
        ? 'Go! Move your cyan bar with your keys.'
        : 'Enter names, pick a difficulty, then start the duel.'

  return (
    <main className="relative mx-auto min-h-screen max-w-6xl px-4 py-6">
      <AppHeader mode="versus" muted={muted} onToggleMute={() => setMuted(!muted)} />

      <Hero eyebrow="Local multiplayer" title="Sorting Duel">
        {'Two players, one keyboard, the same bars. First to sort smallest to largest wins.'}
      </Hero>

      <section aria-label="Duel setup" className="mt-8 flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            {[0, 1].map((pi) => (
              <NameField
                key={pi}
                id={`pn${pi}`}
                label={`Player ${pi + 1}`}
                value={names[pi]}
                disabled={busy}
                onChange={(v) => setNames((n) => n.map((x, i) => (i === pi ? v : x)))}
              />
            ))}
            <DifficultyPicker value={diff} onChange={setDiff} disabled={busy} />
          </div>
          <StartButton onClick={start} disabled={busy}>
            {count > 0 ? `GET READY… ${count}` : running ? 'RACING…' : 'START DUEL'}
          </StartButton>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-1">
            <TimerStat time={time} total={TIME} />
          </div>
          <Stat
            label="Moves"
            value={
              <>
                {players[0].moves}
                <span className="text-muted-foreground">{' : '}</span>
                {players[1].moves}
              </>
            }
          />
          <Stat label={`${names[0] || 'P1'} wins`} value={wins[0]} dot={COLORS[0]} />
          <Stat label={`${names[1] || 'P2'} wins`} value={wins[1]} dot={COLORS[1]} />
          <Stat label="Timeouts" value={wins[2]} dot="var(--neon-yellow)" />
        </div>
      </section>

      <div className="mt-6">
        <StatusPill>{status}</StatusPill>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {([0, 1] as const).map((pi) => {
          const p = players[pi]
          const c = CONTROLS[pi]
          return (
            <BoardPanel
              key={pi}
              title={`${names[pi] || `Player ${pi + 1}`}`}
              dot={COLORS[pi]}
              subtitle={p.arr.length > 0 ? `${remaining(p)} bars left to lock` : `Player ${pi + 1}`}
              aside={
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  <Keycap k={c.left} label="Left" />
                  <Keycap k={c.right} label="Right" />
                  <Keycap k={c.select} label="Next" />
                </div>
              }
            >
              <div key={bump[pi]} className={bump[pi] ? 'bump' : undefined}>
                {p.arr.length > 0 ? (
                  <SortBars arr={p.arr} sel={busy ? p.cursor : null} locked={p.lock} color={COLORS[pi]} />
                ) : (
                  <div className="mt-5 flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                    Bars appear when the duel starts
                  </div>
                )}
              </div>
              {count > 0 && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70 font-display text-7xl font-black text-foreground backdrop-blur-[2px]"
                >
                  {count}
                </div>
              )}
            </BoardPanel>
          )
        })}
      </div>

      <div className="mt-5">
        <Legend
          items={[
            { color: 'var(--neon-cyan)', label: 'Selected bar' },
            { color: 'var(--neon-green)', label: 'Locked in place' },
            { color: 'var(--neon-pink)', label: 'Player 2 bars' },
          ]}
        />
      </div>

      {result && (
        <ResultOverlay
          result={result.kind}
          title={result.title}
          detail={result.detail}
          onPlayAgain={start}
          onClose={closeResult}
        />
      )}
    </main>
  )
}
