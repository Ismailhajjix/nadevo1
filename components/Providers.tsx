'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
    >
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
  );
} 