'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { beep, isSorted, lockAfterSwap, makeArr, type Diff } from '@/lib/sorting'
import { SortBars } from '@/components/sort-bars'
import { ResultOverlay } from '@/components/result-overlay'
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

const TIME = 45

export function SortingRaceGame() {
  const [name, setName] = useState('Player 1')
  const [muted, setMuted] = useState(false)
  const [diff, setDiff] = useState<Diff>('easy')
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(TIME)
  const [score, setScore] = useState(0)
  const [wins, setWins] = useState({ p: 0, ai: 0, t: 0 })
  const [pArr, setPArr] = useState<number[]>([])
  const [aArr, setAArr] = useState<number[]>([])
  const [sel, setSel] = useState<number | null>(null)
  const [status, setStatus] = useState('Press Start Race')
  const [aiHl, setAiHl] = useState<{ i: number[]; swap: boolean }>({ i: [], swap: false })
  const [pLock, setPLock] = useState<boolean[]>([])
  const [aLock, setALock] = useState<boolean[]>([])
  const [result, setResult] = useState<{ kind: 'win' | 'lose'; title: string; detail: string } | null>(null)
  const sortedRef = useRef<number[]>([])
  const aLockRef = useRef<boolean[]>([])
  const bot = useRef({ i: 0, j: 0, swapped: false })
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  const end = (who: 'p' | 'ai' | 't', msg: string) => {
    setRunning(false)
    setStatus(msg)
    setWins((w) => ({ ...w, [who]: w[who] + 1 }))
    beep(who === 'p' ? 880 : 220, mutedRef.current)
    setResult(
      who === 'p'
        ? { kind: 'win', title: msg, detail: 'You sorted the bars before the Bubble Bot.' }
        : who === 'ai'
          ? { kind: 'lose', title: msg, detail: 'The Bubble Bot finished sorting first.' }
          : { kind: 'lose', title: msg, detail: 'The clock ran out before the bars were sorted.' },
    )
  }

  const closeResult = useCallback(() => setResult(null), [])

  const start = () => {
    setResult(null)
    const a = makeArr(diff)
    sortedRef.current = [...a].sort((x, y) => x - y)
    const noLocks = a.map(() => false)
    aLockRef.current = noLocks
    setPLock(noLocks)
    setALock(noLocks)
    setPArr([...a])
    setAArr([...a])
    setSel(null)
    setTime(TIME)
    setScore(0)
    bot.current = { i: 0, j: 0, swapped: false }
    setAiHl({ i: [], swap: false })
    setStatus('Click two bars to swap them')
    setRunning(true)
  }

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setTime((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => {
    if (running && time <= 0) end('t', 'Time expired!')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, running])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setAArr((arr) => {
        const a = [...arr]
        const b = bot.current
        const n = a.length
        if (n < 2) return a
        if (b.j >= n - 1 - b.i) {
          if (!b.swapped || b.i >= n - 2) return a
          b.i++
          b.j = 0
          b.swapped = false
        }
        const x = b.j
        const y = b.j + 1
        const sw = a[x] > a[y]
        if (sw) {
          ;[a[x], a[y]] = [a[y], a[x]]
          b.swapped = true
          aLockRef.current = lockAfterSwap(a, aLockRef.current, sortedRef.current, [x, y])
          setALock(aLockRef.current)
        }
        setAiHl({ i: [x, y], swap: sw })
        b.j++
        if (isSorted(a)) setTimeout(() => end('ai', 'Bubble Bot wins!'), 0)
        return a
      })
    }, 3500)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const click = (i: number) => {
    if (!running || pLock[i]) return
    if (sel === null) {
      setSel(i)
      beep(500, muted)
      return
    }
    if (sel === i) {
      setSel(null)
      return
    }
    const a = [...pArr]
    ;[a[sel], a[i]] = [a[i], a[sel]]
    setPArr(a)
    setPLock(lockAfterSwap(a, pLock, sortedRef.current, [sel, i]))
    setSel(null)
    setScore((s) => s + 10)
    beep(660, muted)
    if (isSorted(a)) {
      setScore((s) => s + time * 5)
      end('p', `${name} wins!`)
    }
  }

  const empty = (
    <div className="mt-5 flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      Bars appear when the race starts
    </div>
  )

  return (
    <main className="relative mx-auto min-h-screen max-w-6xl px-4 py-6">
      <AppHeader mode="bot" muted={muted} onToggleMute={() => setMuted(!muted)} />

      <Hero eyebrow="Bubble sort trainer" title="The Sorting Race">
        {'Swap bars until they run smallest to largest — and beat the Bubble Sort Bot to the finish.'}
      </Hero>

      <section aria-label="Race setup" className="mt-8 flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <NameField id="pn" label="Player name" value={name} onChange={setName} disabled={running} />
            <DifficultyPicker value={diff} onChange={setDiff} disabled={running} />
          </div>
          <StartButton onClick={start} disabled={running}>
            {running ? 'RACING…' : 'START RACE'}
          </StartButton>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-1">
            <TimerStat time={time} total={TIME} />
          </div>
          <Stat label="Score" value={score} />
          <Stat label="Your wins" value={wins.p} dot="var(--neon-green)" />
          <Stat label="Bot wins" value={wins.ai} dot="var(--neon-pink)" />
          <Stat label="Timeouts" value={wins.t} dot="var(--neon-yellow)" />
        </div>
      </section>

      <div className="mt-6">
        <StatusPill>{status}</StatusPill>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <BoardPanel
          title={name || 'Player'}
          dot="var(--neon-green)"
          subtitle="Click one bar, then another, to swap them."
        >
          {pArr.length ? (
            <SortBars
              arr={pArr}
              sel={sel}
              locked={pLock}
              onClick={running ? click : undefined}
              color="var(--neon-green)"
            />
          ) : (
            empty
          )}
        </BoardPanel>
        <BoardPanel title="Bubble Sort Bot" dot="var(--neon-pink)" subtitle="Takes one step every 3.5 seconds.">
          {aArr.length ? (
            <SortBars arr={aArr} hl={aiHl.i} swap={aiHl.swap} locked={aLock} color="var(--neon-pink)" />
          ) : (
            empty
          )}
        </BoardPanel>
      </div>

      <div className="mt-5">
        <Legend
          items={[
            { color: 'var(--neon-cyan)', label: 'Selected' },
            { color: 'var(--neon-green)', label: 'Your bars / locked' },
            { color: 'var(--neon-yellow)', label: 'Bot comparing' },
            { color: 'var(--neon-purple)', label: 'Bot swapping' },
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
