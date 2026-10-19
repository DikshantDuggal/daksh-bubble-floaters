import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Orbitron, Space_Grotesk } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '900'], variable: '--font-orbitron' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'The Sorting Race — Learn Bubble Sort by Racing an AI',
  description: 'A neon cyberpunk game that teaches DSA: sort bars faster than the Bubble Sort bot.',
  generator: 'v0.app',
  openGraph: {
    title: 'The Sorting Race',
    description: 'Race a Bubble Sort bot and learn sorting algorithms interactively.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#14102a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
