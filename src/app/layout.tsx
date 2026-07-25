import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { RatingsProvider } from '@/context/RatingsContext';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Casting Tools Hub — TMMIN Casting Division',
  description: 'Portal akses terpusat aplikasi internal Casting Division, EPSD Sunter 2.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex antialiased">
        <AppProvider>
          <RatingsProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
              <div className="flex-1 flex flex-col">
                {children}
              </div>
              <Footer />
            </div>
          </RatingsProvider>
        </AppProvider>
      </body>
    </html>
  );
}
