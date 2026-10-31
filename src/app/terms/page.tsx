import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Service · TysonLabs',
  description: 'Terms governing use of the TysonLabs website and Review Manager.',
};

const h2 = 'font-display font-bold text-lg text-zinc-950 dark:text-[#F4F3F8]';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-black/[0.08] dark:border-[#30333B] pb-6">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-950 dark:text-[#F4F3F8]">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-zinc-500 dark:text-[#717684]">Last revised: 29 October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-zinc-600 dark:text-[#A6A8B3] leading-relaxed">
        <section className="space-y-2">
          <h2 className={h2}>1. Who we are</h2>
          <p>
            These terms apply to the TysonLabs website (tysonlabs.in) and to Review Manager, operated by Manoj Tyson, trading as TysonLabs, an independent technology studio based in Bangalore, India (&ldquo;TysonLabs&rdquo;, &ldquo;we&rdquo;). By using either, you agree to these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>2. Review Manager</h2>
          <p>
            Review Manager reads reviews from a Google Business Profile you are authorised to manage, suggests replies, and publishes replies that you approve. You are responsible for confirming that you have authority over the connected business and for every reply published under your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>3. Your responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Review suggested replies before approving them. They are generic and may not fit every review.</li>
            <li>Do not include confidential patient or customer health information in replies. Do not confirm in a reply that a reviewer is a patient.</li>
            <li>Follow Google&apos;s Business Profile policies, and do not use the service to post fake, incentivised, or misleading content.</li>
            <li>Do not misuse, attempt to disrupt, or reverse-engineer the service.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>4. Google data</h2>
          <p>
            How we handle data received from Google is described in our{' '}
            <Link href="/privacy#google-user-data" className="text-zinc-900 dark:text-white underline font-medium">
              Privacy Policy
            </Link>
            . You may revoke our access at any time through your Google Account or within Review Manager.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>5. Availability and changes</h2>
          <p>
            The service depends on Google&apos;s APIs and may change or be interrupted. We may update the service or these terms; material changes will be reflected by the revision date above.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>6. Disclaimer and liability</h2>
          <p>
            The service is provided &ldquo;as is&rdquo; without warranties of any kind. To the extent permitted by law, TysonLabs is not liable for indirect or consequential loss, or for content you publish. Nothing here limits liability that cannot be limited by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>7. Termination</h2>
          <p>
            You can stop using the service and disconnect at any time. We may suspend access for misuse or breach of these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>8. Governing law and contact</h2>
          <p>
            These terms are governed by the laws of India. Questions:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-zinc-900 dark:text-white underline font-medium">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
