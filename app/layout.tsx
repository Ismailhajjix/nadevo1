import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'جائزة نادِفو للتميز',
  description: 'صوت لمن يستحق جائزة نادِفو للتميز',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body 
        className="min-h-screen bg-[#0a0f1c] font-arabic antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}