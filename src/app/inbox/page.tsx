import { Suspense } from 'react';
import type { Metadata } from 'next';
import { InboxClient } from './InboxClient';

export const metadata: Metadata = {
  title: 'Direct Inquiries & Comments Inbox · TysonLabs',
  description: 'Manage Instagram DMs, comments, and WhatsApp inquiries in a unified high-speed dashboard.',
  robots: { index: false, follow: false },
};

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-xs text-zinc-500">
          Loading inbox…
        </div>
      }
    >
      <InboxClient />
    </Suspense>
  );
}
