import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy · TysonLabs',
  description: 'TysonLabs privacy principles and minimal data practices.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-[#30333B] pb-6">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#F4F3F8]">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-[#717684]">
          Last revised: October 2026
        </p>
      </div>

      <div className="space-y-6 text-sm text-[#A6A8B3] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-[#F4F3F8]">
            1. Core Principles
          </h2>
          <p>
            TysonLabs is an independent technology studio. We do not sell user data, track visitors across third-party networks, or run invasive marketing pixels.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-[#F4F3F8]">
            2. Contact Inquiries
          </h2>
          <p>
            When you send a message through our contact form, we collect only the information you voluntarily submit (your name, email address, project focus, and message). This data is strictly used to communicate with you about your inquiry and is never shared with third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-[#F4F3F8]">
            3. Analytics & Telemetry
          </h2>
          <p>
            We may use privacy-first, cookie-free analytics (such as Vercel Web Analytics) that collect aggregated traffic metrics without storing personal identifiers or tracking you across sessions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-[#F4F3F8]">
            4. External Links
          </h2>
          <p>
            Our site contains links to public GitHub repositories and external demo applications. We are not responsible for the privacy practices of external platforms.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-[#30333B]">
          <p className="text-xs text-[#717684]">
            For questions regarding this policy, please reach out via our{' '}
            <Link href="/contact" className="text-[#B99AFF] hover:underline">
              contact form
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
