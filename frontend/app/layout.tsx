import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/contexts/language-context'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AnimeVista - Stream Your Favorite Anime',
  description: 'Discover and stream the best anime titles. Watch latest episodes, trending series, and top-rated anime all in one place.',
  keywords: ['anime', 'streaming', 'watch anime', 'anime catalog', 'latest episodes'],
}

export const viewport: Viewport = {
  themeColor: '#040D1F',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
