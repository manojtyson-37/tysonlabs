import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy · TysonLabs',
  description: 'How TysonLabs handles contact inquiries and Google user data in Review Manager.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-black/[0.08] dark:border-[#30333B] pb-6">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-950 dark:text-[#F4F3F8]">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-zinc-500 dark:text-[#717684]">
          Last revised: 29 October 2026
        </p>
      </div>

      <div className="space-y-6 text-sm text-zinc-600 dark:text-[#A6A8B3] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]">
            1. Core Principles
          </h2>
          <p>
            TysonLabs is an independent technology studio operated by Manoj Tyson, Bangalore, India. We do not sell user data, track visitors across third-party networks, or run invasive marketing pixels.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]">
            2. Contact Inquiries
          </h2>
          <p>
            When you send a message through our contact form, we collect only the information you voluntarily submit (your name, email address, project focus, and message). This data is strictly used to communicate with you about your inquiry and is never shared with third parties. We keep contact messages for up to 24 months, then delete them.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]">
            3. Analytics & Telemetry
          </h2>
          <p>
            The marketing pages use privacy-first, cookie-free analytics (such as Vercel Web Analytics) that collect aggregated traffic metrics without storing personal identifiers or tracking you across sessions. Review Manager sets only the essential session cookie needed to keep you signed in.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]">
            4. External Links
          </h2>
          <p>
            Our site contains links to public GitHub repositories and external demo applications. We are not responsible for the privacy practices of external platforms.
          </p>
        </section>

        <section id="google-user-data" className="space-y-3 scroll-mt-24">
          <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]">
            5. Google User Data (Review Manager)
          </h2>
          <p>
            Review Manager, available at{' '}
            <Link href="/reviews" className="text-zinc-900 dark:text-white underline font-medium">{SITE_URL.replace('https://', '')}/reviews</Link>,
            lets a business connect its Google Business Profile so it can read its reviews and publish replies. This section describes how we handle the Google user data involved.
          </p>
          <h3 className="font-semibold text-zinc-900 dark:text-[#F4F3F8]">What we access</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your Google account name and email address (OAuth scopes <code>openid</code> and <code>email</code>), to identify the signed-in user.</li>
            <li>The names and identifiers of the Business Profile locations you choose to connect, and their reviews, via the scope <code>https://www.googleapis.com/auth/business.manage</code>. This scope is required both to read reviews and to post replies.</li>
            <li>Review details: reviewer display name, star rating, review text, timestamps, and any existing reply.</li>
            <li>An OAuth access and refresh token, so we can sync on your behalf until you disconnect.</li>
          </ul>
          <h3 className="font-semibold text-zinc-900 dark:text-[#F4F3F8]">How we use it</h3>
          <p>
            We use this data only to show your reviews to your own business inside Review Manager, to generate suggested replies for you to review, and to post the replies you approve to Google. We do not use it for any other purpose.
          </p>
          <h3 className="font-semibold text-zinc-900 dark:text-[#F4F3F8]">What we never do</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>We do not sell Google user data or share it with advertisers or data brokers.</li>
            <li>We do not use it for advertising, profiling, or to build any dataset unrelated to your account.</li>
            <li>We do not use it to train generative AI or machine learning models. Review text is sent to OpenAI (API) solely to draft a reply for you; under OpenAI&apos;s API terms, data submitted through the API is not used to train its models.</li>
            <li>We do not allow humans to read your Google data except where you ask for support, where needed for security or abuse investigation, or where the law requires it.</li>
          </ul>
          <h3 className="font-semibold text-zinc-900 dark:text-[#F4F3F8]">Google API Services User Data Policy</h3>
          <p>
            TysonLabs&apos; use and transfer of information received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 dark:text-white underline font-medium"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <h3 className="font-semibold text-zinc-900 dark:text-[#F4F3F8]">Storage, security and retention</h3>
          <p>
            Data is stored on managed cloud infrastructure, encrypted in transit, and OAuth tokens are stored encrypted. We keep synced reviews and tokens only while your account is connected. When you disconnect, we revoke our access at Google and immediately delete the stored tokens, synced reviews and reply drafts. If access is revoked on Google&apos;s side, we delete the stored tokens, and the synced reviews are deleted when you disconnect in Review Manager or ask us to.
          </p>
          <h3 className="font-semibold text-zinc-900 dark:text-[#F4F3F8]">Disconnecting and deleting your data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Disconnect from within Review Manager, or revoke access at any time at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-zinc-900 dark:text-white underline font-medium">myaccount.google.com/permissions</a>.</li>
            <li>To request deletion of all data we hold, email <a href={`mailto:${CONTACT_EMAIL}`} className="text-zinc-900 dark:text-white underline font-medium">{CONTACT_EMAIL}</a> from the connected account&apos;s address. We confirm and complete deletion within 30 days.</li>
            <li>Replies already posted on Google remain on Google; you can edit or delete them in your Business Profile.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-4 border-t border-black/[0.08] dark:border-[#30333B]">
          <p className="text-xs text-zinc-500 dark:text-[#717684]">
            For questions regarding this policy, please email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-zinc-900 dark:text-white underline font-medium">
              {CONTACT_EMAIL}
            </a>{' '}
            or use our{' '}
            <Link href="/contact" className="text-zinc-900 dark:text-white underline font-medium">
              contact form
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
