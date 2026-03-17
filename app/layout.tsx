import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SplashScreen } from '@/components/SplashScreen'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FoodTruck Park - Order from your table',
  description: 'Order from multiple food trucks in one place. Pick up or table service.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FoodTruck Park',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: 'FoodTruck Park',
    description: 'Order from multiple food trucks in one place.',
    siteName: 'FoodTruck Park',
  },
  icons: {
    shortcut: '/icons/icon-96x96.png',
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SplashScreen />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

