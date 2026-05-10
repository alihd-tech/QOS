import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = { 
  title:'QOS - Quantum Operating System',
  description: 'QOS - A web-based desktop operating system',
  applicationName: 'QOS',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'QOS',
    'web operating system',
    'desktop OS',
    'macOS inspired',
    'PWA',
  ],
  authors: [{ name: 'QOS Team' }],
  creator: 'QOS Team',
  publisher: 'QOS Team',
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-dark.svg',
        color: '#0071e3',
      },
    ],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Q Operating System',
    description: 'QOS - A web-based desktop operating system',
    siteName: 'QOS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Q Operating System',
    description: 'QOS - A web-based desktop operating system',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1d1f' },
  ],
  userScalable: false,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
