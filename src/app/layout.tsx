import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tysonlabs.dev'),
  title: {
    default: 'TysonLabs · Independent Technology Studio',
    template: '%s | TysonLabs',
  },
  description: 'Independent engineering studio architecting and shipping sovereign vertical SaaS, offline-first POS systems, client-side WebAssembly engines, and autonomous AI infrastructure. Zero boilerplate.',
  keywords: [
    'TysonLabs',
    'Independent Engineering Studio',
    'Vertical SaaS',
    'Restaurant POS',
    'Offline-First Till',
    'Stockfish WASM',
    'Apparel ERP',
    'AI Agents',
    'Full Stack Engineering',
    'Next.js 15',
    'Manoj Tyson',
    'Creator Commerce',
    'Software Architecture'
  ],
  authors: [{ name: 'Manoj Tyson', url: 'https://tysonlabs.dev' }],
  creator: 'Manoj Tyson',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tysonlabs.dev',
    title: 'TysonLabs · Independent Engineering Studio',
    description: 'High-throughput vertical SaaS, client-side WebAssembly engines, and autonomous AI infrastructure. Zero boilerplate.',
    siteName: 'TysonLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TysonLabs · Independent Engineering Studio',
    description: 'High-throughput vertical SaaS, client-side WebAssembly engines, and autonomous AI infrastructure.',
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
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} dark`} id="top">
      <body className="min-h-screen bg-[#090A0D] text-[#F8FAFC] flex flex-col font-sans selection:bg-white selection:text-black antialiased">
        <Navbar />
        <main className="flex-1 pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
