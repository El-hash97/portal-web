import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { RatingsProvider } from '@/context/RatingsContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GradientBarsBackground } from '@/components/ui/gradient-bars-background';

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

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Casting Tools Hub — TMMIN Casting Division',
  description: 'Portal akses terpusat aplikasi internal Casting Division, EPSD Sunter 2.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col lg:flex-row antialiased relative">
        <GradientBarsBackground
          numBars={15}
          gradientFrom="rgb(12, 1, 60)"
          gradientTo="transparent"
          backgroundColor="#01010a"
          animationDuration={3}
        >
          <AppProvider>
            <RatingsProvider>
              <Suspense fallback={null}>
                <Sidebar />
              </Suspense>
              <div className="flex-1 flex flex-col min-w-0 z-10 relative">
                <Navbar />
                <div className="flex-1 flex flex-col">
                  {children}
                </div>
                <Footer />
              </div>
            </RatingsProvider>
          </AppProvider>
        </GradientBarsBackground>
      </body>
    </html>
  );
}
