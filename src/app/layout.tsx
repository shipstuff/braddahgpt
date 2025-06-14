import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BraddahGPT',
  description: 'Your Hawaiian pidgin AI assistant, brah!',
  
  // Open Graph (Facebook, LinkedIn, Discord, etc.)
  openGraph: {
    title: 'BraddahGPT - Hawaiian Pidgin AI Assistant',
    description: 'Ho, howzit! Chat with your Hawaiian pidgin AI assistant, brah!',
    url: 'https://braddahgpt.com',
    siteName: 'BraddahGPT',
    images: [
      {
        url: '/howzit.png',
        width: 1200,
        height: 630,
        alt: 'BraddahGPT - Hawaiian Pidgin AI Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'BraddahGPT - Hawaiian Pidgin AI Assistant',
    description: 'Ho, howzit! Chat with your Hawaiian pidgin AI assistant, brah!',
    images: ['/howzit.png'],
  },
  
  // Additional meta tags
  keywords: ['AI', 'ChatGPT', 'Hawaiian', 'Pidgin', 'Assistant', 'Hawaii'],
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-B79825SJ06`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B79825SJ06');
          `}
        </Script>
        
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 