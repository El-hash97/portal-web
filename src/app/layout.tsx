import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { RatingsProvider } from '@/context/RatingsContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Casting Tools Hub — TMMIN Casting Division',
  description: 'Portal akses terpusat aplikasi internal Casting Division, EPSD Sunter 2.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <AppProvider>
          <RatingsProvider>
            <Header />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <Footer />
          </RatingsProvider>
        </AppProvider>
      </body>
    </html>
  );
}
