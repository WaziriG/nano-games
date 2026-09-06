import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const GA_MEASUREMENT_ID = 'G-ZG78CHJZE5'

export const metadata: Metadata = {
  title: { default: 'Nano Games', template: '%s · Nano Games' },
  description: 'Nano Games Arcade — original games built from scratch',
  icons: { icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text y="32" font-size="32">🎮</text></svg>' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body>
        <div className="scanlines" aria-hidden />
        <div className="vignette" aria-hidden />
        {children}
      </body>
    </html>
  )
}
