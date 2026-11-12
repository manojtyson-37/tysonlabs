import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

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
  alternates: { canonical: '/' },
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TysonLabs · Manoj Tyson, AI product builder',
    template: '%s | TysonLabs',
  },
  description: 'Manoj Tyson turns real-world problems into AI-powered products, from clinic and restaurant software to factory ERPs. Built in Bangalore.',
  keywords: [
    'TysonLabs',
    'Manoj Tyson',
    'AI product builder',
    'product manager portfolio',
    'AI-powered products',
    'clinic software',
    'restaurant billing',
    'Bangalore',
  ],


  authors: [{ name: 'Manoj Tyson', url: 'https://tysonlabs.in' }],
  creator: 'Manoj Tyson',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tysonlabs.in',
    title: 'TysonLabs · Manoj Tyson, AI product builder',
    description: 'Manoj Tyson turns real-world problems into AI-powered products, from clinic and restaurant software to factory ERPs. Built in Bangalore.',
    siteName: 'TysonLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TysonLabs · Manoj Tyson, AI product builder',
    description: 'Real-world problems turned into AI-powered products, by Manoj Tyson.',
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      id="top"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('tysonlabs-theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDark) || (theme === 'system' && supportDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black antialiased transition-colors duration-200">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-3 focus:py-2 focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black focus:text-sm focus:font-semibold focus:rounded-md focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1 pt-24">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
