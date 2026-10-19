export type Diff = 'easy' | 'medium' | 'hard'
export const RANGES: Record<Diff, [number, number]> = { easy: [5, 7], medium: [10, 12], hard: [13, 15] }

export const isSorted = (a: number[]) => a.every((v, i) => i === 0 || a[i - 1] <= v)

export function makeArr(d: Diff) {
  const [a, b] = RANGES[d]
  const n = a + Math.floor(Math.random() * (b - a + 1))
  let arr: number[]
  do arr = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 20))
  while (isSorted(arr))
  return arr
}

// Lock a bar only when a swap moves it into the outermost unlocked slot that it
// belongs in: the largest remaining value at the right edge, or the smallest at the left.
export function lockAfterSwap(a: number[], lock: boolean[], sorted: number[], moved: number[]) {
  const next = [...lock]
  let l = 0
  while (l < a.length && next[l]) l++
  let r = a.length - 1
  while (r >= 0 && next[r]) r--
  for (const p of moved) {
    if (next[p] || a[p] !== sorted[p]) continue
    if (p === r) {
      next[p] = true
      r--
    } else if (p === l) {
      next[p] = true
      l++
    }
  }
  return next
}

let audioCtx: AudioContext | null = null
export function beep(f: number, muted: boolean) {
  if (muted || typeof window === 'undefined') return
  audioCtx ??= new AudioContext()
  const o = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  o.frequency.value = f
  o.type = 'square'
  g.gain.value = 0.04
  o.connect(g).connect(audioCtx.destination)
  o.start()
  o.stop(audioCtx.currentTime + 0.08)
}
