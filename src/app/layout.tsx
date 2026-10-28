import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tysonlabs.dev'),
  title: {
    default: 'TysonLabs · Independent Technology Studio',
    template: '%s | TysonLabs',
  },
  description: 'Software built to run real businesses. From offline restaurant POS tills and garment factory ERPs to in-browser chess engines and creator checkout systems. Everything designed, engineered, and shipped end-to-end.',
  keywords: [
    'TysonLabs',
    'Independent Engineering Studio',
    'Restaurant POS',
    'DinePulse',
    'Apparel ERP',
    'Stockfish WASM',
    'Creator Commerce',
    'Full Stack Engineering',
    'Next.js 15',
    'Manoj Tyson',
    'Software Architecture'
  ],
  authors: [{ name: 'Manoj Tyson', url: 'https://tysonlabs.dev' }],
  creator: 'Manoj Tyson',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tysonlabs.dev',
    title: 'TysonLabs · Software built to run real businesses',
    description: 'From offline-first restaurant POS tills and garment factory ERPs to in-browser chess engines and creator checkout systems. Shipped end-to-end.',
    siteName: 'TysonLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TysonLabs · Software built to run real businesses',
    description: 'From offline restaurant POS tills and apparel ERPs to in-browser chess engines and checkout systems.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`} id="top">
      <body className="min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col font-sans selection:bg-white selection:text-black antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-3 focus:py-2 focus:bg-white focus:text-black focus:text-sm focus:font-semibold focus:rounded-md focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
