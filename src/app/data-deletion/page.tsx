import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PRIVACY_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions · TysonLabs',
  description: 'How to delete your user data from TysonLabs applications, Facebook, and Instagram.',
};

type SP = Promise<{ id?: string; code?: string; user?: string }>;

export default function DataDeletionPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-6 py-10 text-sm text-zinc-500">Loading deletion info…</div>}>
      <DataDeletionContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DataDeletionContent({ searchParams }: { searchParams: SP }) {
  const params = await searchParams;
  const requestId = params.id || params.code;

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-black/[0.08] dark:border-[#30333B] pb-6">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-950 dark:text-[#F4F3F8]">
          User Data Deletion Instructions
        </h1>
        <p className="text-xs font-mono text-zinc-500 dark:text-[#717684]">
          Meta Platform Policy & Data Deletion Compliance
        </p>
      </div>

      {requestId && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-semibold text-sm">Deletion Request Acknowledged</h3>
          </div>
          <p className="text-xs font-mono">
            Confirmation Reference: <span className="font-bold">{requestId}</span>
          </p>
          <p className="text-xs opacity-90">
            Your request has been registered in our database. All associated access tokens, cached media URLs, and account identifiers will be purged within 48 hours in accordance with Meta Platform Policy.
          </p>
        </div>
      )}

      <div className="space-y-6 text-sm text-zinc-600 dark:text-[#A6A8B3] leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]">
            1. Overview
          </h2>
          <p>
            TysonLabs respects your privacy and gives you full control over the personal data accessed through our applications and integrations (including Meta Facebook, Instagram Graph API, and Google).
          </p>
          <p>
            When you disconnect our applications or request deletion of your account data, we permanently purge all stored access tokens, account profile metadata, and cached interaction records.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]">
            2. How to remove TysonLabs from your Meta / Facebook Account
          </h2>
          <p>
            You can revoke access and remove the app from your Facebook or Instagram profile at any time:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Log in to your Facebook profile or Meta Business Suite.</li>
            <li>
              Go to{' '}
              <a
                href="https://www.facebook.com/settings?tab=applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 dark:text-white underline font-medium"
              >
                Settings & Privacy &gt; Settings &gt; Apps and Websites
              </a>
              .
            </li>
            <li>Find <strong>TysonLabs</strong>, <strong>WA Automation</strong>, or <strong>Instagram Manager</strong> in the active apps list.</li>
            <li>Click <strong>Remove</strong> to disconnect the application.</li>
            <li>
              Optionally check the box to request that Facebook notify us to delete all platform data associated with your user ID. When selected, Meta calls our automated Data Deletion Callback URL.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]">
            3. Manual Deletion Request
          </h2>
          <p>
            If you would like us to immediately delete any and all records associated with your account, email our privacy team directly:
          </p>
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08]">
            <p className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
              Email:{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="underline font-semibold">
                {PRIVACY_EMAIL}
              </a>
              <br />
              Subject: Data Deletion Request - [Your App / Account Name]
            </p>
          </div>
          <p>
            Please send the email from the email address linked to your connected account or provide your Instagram username / Facebook Page ID. We will confirm receipt within 24 hours and finalize deletion within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]">
            4. What happens when data is deleted
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All OAuth access and refresh tokens stored in our encrypted database are destroyed immediately.</li>
            <li>Scheduled post drafts, video specs, and cached media assets are removed from active queues.</li>
            <li>Insights and analytical metrics tied to your Instagram account ID are permanently deleted.</li>
            <li>Content that was already published to your live Instagram profile remains on Instagram under your own management.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-4 border-t border-black/[0.08] dark:border-[#30333B]">
          <p className="text-xs text-zinc-500 dark:text-[#717684]">
            For further information on our data practices, please review our{' '}
            <Link href="/privacy" className="text-zinc-900 dark:text-white underline font-medium">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="text-zinc-900 dark:text-white underline font-medium">
              Terms of Service
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
