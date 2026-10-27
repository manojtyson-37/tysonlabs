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
  description: 'Independent technology studio building digital products, SaaS applications, AI-powered systems, and useful software. Ideas into products.',
  keywords: [
    'TysonLabs',
    'Independent Technology Studio',
    'SaaS Development',
    'AI Agents',
    'Full Stack Engineering',
    'Next.js',
    'Manoj Tyson',
    'Restaurant POS',
    'Creator Commerce',
    'FastAPI ERP',
    'Software Architecture'
  ],
  authors: [{ name: 'Manoj Tyson', url: 'https://tysonlabs.dev' }],
  creator: 'Manoj Tyson',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tysonlabs.dev',
    title: 'TysonLabs · Independent Technology Studio',
    description: 'Digital products, AI-powered tools, and software experiences built to solve real problems. Ideas into products.',
    siteName: 'TysonLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TysonLabs · Independent Technology Studio',
    description: 'Ideas into products. Sovereign software engineering & design.',
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
