import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PayClient } from './PayClient';

export const metadata: Metadata = {
  title: 'Unlock Bengaluru Travel Guide · Travel Kathegalu',
  description: 'Instant access to the curated 3-Day Bengaluru Heritage & Food Crawl Itinerary.',
};

export async function generateStaticParams() {
  return [
    { slug: 'travel-kathegalu-guide' },
    { slug: 'travel-kathegalu' },
    { slug: 'bengaluru-itinerary' },
  ];
}

export default function PayProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-xs text-zinc-500">
          Loading checkout…
        </div>
      }
    >
      <PayClient />
    </Suspense>
  );
}
