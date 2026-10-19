import type { Metadata } from 'next'
import { VersusGame } from '@/components/versus-game'

export const metadata: Metadata = {
  title: 'Sorting Duel · 2 Player Mode',
  description: 'Race a friend on one keyboard to sort the bars first. Player 1 uses A/S, Player 2 uses K/L.',
}

export default function VersusPage() {
  return <VersusGame />
}
