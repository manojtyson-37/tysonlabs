import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Star, Check, Link2, Sparkles, SendHorizontal, BellRing, ShieldCheck, Download } from 'lucide-react';
import { CONTACT_EMAIL } from '@/lib/site';

const STEPS = [
  {
    icon: Link2,
    title: 'Connect your Google Business Profile',
    body: 'Sign in with Google and pick the locations to manage. We read reviews and post replies, nothing else.',
  },
  {
    icon: Sparkles,
    title: 'A reply is drafted for every review',
    body: 'Each draft is specific to what the patient or customer wrote, in a tone you set. New reviews trigger an alert on your phone.',
  },
  {
    icon: SendHorizontal,
    title: 'You approve, we post',
    body: 'Edit if you like, then approve. Nothing goes to Google without your say. Disconnect any time.',
  },
];

const CONTROL = [
  { icon: Check, title: 'Owner approves every reply', body: 'Drafts wait in your inbox. Posting needs an explicit approval.' },
  { icon: BellRing, title: 'Alerts for new reviews', body: 'Web push alerts so a bad review never sits unanswered for a week.' },
  { icon: Download, title: 'Your data, your call', body: 'Export your data, or erase it with a two-step confirmation.' },
  { icon: ShieldCheck, title: 'Minimal Google access', body: 'Only the Business Profile permission. Revoke it from your Google account any time.' },
];

const BUILT = [
  { name: 'DinePulse', what: 'Restaurant billing and kitchen tickets', slug: 'dinepulse' },
  { name: 'Silaa Atelier', what: 'Garment factory roll inventory ERP', slug: 'silaa-atelier' },
  { name: 'Tysonpe', what: 'Creator storefront with UPI checkout', slug: 'tysonpe' },
];

function ReviewMock() {
  return (
    <div
      role="img"
      aria-label="Illustrative example of the review inbox: a five-star review with a drafted reply awaiting approval"
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111216] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500">
        <span>Review inbox</span>
        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">1 awaiting approval</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-0.5 text-amber-500">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
            &ldquo;Doctor explained everything clearly and the front desk was quick. My knee already feels better.&rdquo;
          </p>
        </div>
        <div className="rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-900 p-4 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-teal-700 dark:text-teal-300">Draft reply</div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
            Thank you for the kind words. We are glad the treatment is helping your knee. Do keep up the exercises and see you at your next visit.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-semibold">Approve &amp; post</span>
            <span className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Edit</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">Illustrative example</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-20 sm:space-y-28">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 pt-10 sm:pt-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            TysonLabs Reviews · for clinics and local businesses
          </div>
          <h1 className="font-display font-semibold text-4xl sm:text-6xl text-zinc-950 dark:text-white tracking-tight leading-[1.05] [text-wrap:balance]">
            Answer every Google review in seconds, not weeks.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-500 leading-relaxed max-w-xl [text-wrap:pretty]">
            Your reviews decide who walks in. We draft a reply to each one, you approve it, and it goes live on Google. Built in Bangalore for clinics and local businesses.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/contact"
              className="btn-tactile px-6 py-3.5 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
            >
              <span>Get early access</span>
            </Link>
            <Link
              href="/reviews"
              className="btn-tactile px-6 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-all active:scale-[0.98]"
            >
              <span>How it works</span>
            </Link>
          </div>
        </div>
        <ReviewMock />
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 space-y-10">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">How it works</div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
            Three steps. You stay in control.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#111216] space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center">
                  <s.icon className="w-4.5 h-4.5" />
                </span>
                <span className="font-mono text-xs text-zinc-500">0{i + 1}</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-zinc-950 dark:text-white">{s.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Control and trust */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 space-y-10">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">Trust</div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
            Your reputation, your approval.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTROL.map((c) => (
            <div key={c.title} className="space-y-2">
              <c.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-semibold text-zinc-950 dark:text-white">{c.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          Read the <Link href="/privacy#google-user-data" className="underline">privacy policy</Link> for exactly what we read and keep.
        </p>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 space-y-10">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">Products</div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
            Software for the front desk of a small business.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="p-7 rounded-2xl border border-teal-200 dark:border-teal-900 bg-teal-50/40 dark:bg-teal-950/20 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-300">Early access</div>
            <h3 className="font-display font-semibold text-2xl text-zinc-950 dark:text-white">TysonLabs Reviews</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">
              One inbox for your Google reviews, with a drafted reply for each and alerts when new ones land.
            </p>
            <Link href="/reviews" className="inline-flex items-center gap-1 text-sm font-semibold underline">
              See how it works <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">Live</div>
            <h3 className="font-display font-semibold text-2xl text-zinc-950 dark:text-white">PhysioCare clinic system</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">
              Appointments without double bookings, patient records, GST invoices and WhatsApp reminders for physiotherapy and other clinics.
            </p>
            <Link href="/projects/physiocare" className="inline-flex items-center gap-1 text-sm font-semibold underline">
              View the system <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Custom builds */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 space-y-8">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">Custom builds</div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
            Need something made for your business?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-500 leading-relaxed [text-wrap:pretty]">
            I also build custom software end to end, and you own the code. Recent work:
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {BUILT.map((b) => (
            <Link
              key={b.slug}
              href={`/projects/${b.slug}`}
              className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors space-y-1"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-950 dark:text-white">{b.name}</h3>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-black dark:group-hover:text-white" />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-500">{b.what}</p>
            </Link>
          ))}
        </div>
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-semibold underline">
          All projects <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-16">
        <div className="p-8 sm:p-12 rounded-2xl bg-zinc-950 text-white dark:bg-[#111216] border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Founder-led · Manoj Tyson, Bangalore</div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-white [text-wrap:balance]">
              Start answering reviews this week.
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Tell us about your clinic or business and we will set it up with you. Or write to {CONTACT_EMAIL}.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-black hover:bg-zinc-200 font-semibold text-sm transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <span>Get early access</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
