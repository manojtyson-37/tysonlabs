import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Review Manager · TysonLabs',
  description:
    'TysonLabs Review Manager helps clinics and local businesses read their Google Business Profile reviews and publish owner-approved replies, with suggested wording to start from.',
};

const h2 = 'font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]';

export default function ReviewsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 space-y-8">
      <div className="space-y-3 border-b border-black/[0.08] dark:border-[#30333B] pb-6">
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-[#717684]">
          TysonLabs · Review Manager
        </p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-950 dark:text-[#F4F3F8]">
          Answer every Google review, without the busywork.
        </h1>
        <p className="text-base text-zinc-600 dark:text-[#A6A8B3] leading-relaxed">
          Review Manager is a web application for clinics and local businesses. It connects to a
          business&apos;s own Google Business Profile, shows its reviews in one inbox, suggests a
          reply, and posts the reply to Google once the owner or staff approves it.
        </p>
      </div>

      <div className="space-y-6 text-sm text-zinc-600 dark:text-[#A6A8B3] leading-relaxed">
        <section className="space-y-2">
          <h2 className={h2}>What it does</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Syncs the reviews of the locations the client chooses into a single dashboard.</li>
            <li>Suggests a polite reply to each review from a library of pre-written replies, matched to the star rating and the topics the review mentions. Review text is not sent to an AI provider.</li>
            <li>Lets the client edit and approve each reply. Nothing is posted without approval.</li>
            <li>Publishes the approved reply to the review on Google.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>Why we ask for Google Business Profile access</h2>
          <p>
            Reviews and replies live in the client&apos;s Google Business Profile. The only way to read
            them, and to publish a reply as the business, is for the account owner to grant access
            through Google sign-in. We request the Business Profile permission and use it for two
            things only: reading the client&apos;s locations and reviews, and posting replies the client
            has approved. We do not request access to any other Google service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>Your control</h2>
          <p>
            Access is granted by the business owner and can be revoked at any time, either from
            inside Review Manager or from your Google Account&apos;s third-party access page. Disconnecting
            stops all syncing, and you can ask us to delete the data we hold. See our{' '}
            <Link href="/privacy#google-user-data" className="text-zinc-900 dark:text-white underline font-medium">
              privacy policy
            </Link>{' '}
            for exactly what we read, how long we keep it, and how deletion works.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>Get access</h2>
          <p>
            Review Manager is currently onboarded by invitation. To set it up for your clinic, write
            to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-zinc-900 dark:text-white underline font-medium">
              {CONTACT_EMAIL}
            </a>{' '}
            or use the{' '}
            <Link href="/contact" className="text-zinc-900 dark:text-white underline font-medium">
              contact form
            </Link>
            .
          </p>
        </section>

        <p className="pt-4 border-t border-black/[0.08] dark:border-[#30333B] text-xs text-zinc-500 dark:text-[#717684]">
          <Link href="/privacy" className="underline">Privacy Policy</Link> ·{' '}
          <Link href="/terms" className="underline">Terms of Service</Link>
        </p>
      </div>
    </div>
  );
}
