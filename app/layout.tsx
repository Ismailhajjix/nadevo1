import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Nadevo Vote',
  description: 'Vote for your favorite candidate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'rtl',
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
