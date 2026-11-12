import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, Lightbulb, Hammer, Rocket, Bot, Cpu } from 'lucide-react';
import { CONTACT_EMAIL } from '@/lib/site';
import { PROJECTS } from '@/data/projects';

const PROCESS = [
  { icon: Search, title: 'Find a real problem', body: 'Start with a business that is losing time or money to a clumsy process: a clinic, a restaurant, a factory floor.' },
  { icon: Lightbulb, title: 'Define the product', body: 'Cut it down to the one job the product must do well, and decide where AI helps and where a human must stay in charge.' },
  { icon: Hammer, title: 'Build it with AI', body: 'Design, engineer and test end to end, using AI agents to move faster without lowering the quality bar.' },
  { icon: Rocket, title: 'Ship and learn', body: 'Put it in front of real users, watch what they do, and keep improving it.' },
];

const CASES = [
  {
    tag: 'Healthcare',
    name: 'PhysioCare',
    problem: 'Physio clinics juggle paper cards, calendars and separate billing, so patients get double-booked and rehab packages go unbilled.',
    built: 'One clinic platform: clash-free scheduling, patient recovery tracking, GST invoices and WhatsApp reminders.',
    outcomes: ['Zero double-bookings', 'WhatsApp reminders'],
    href: '/projects/physiocare',
  },
  {
    tag: 'AI · Local business',
    name: 'TysonLabs Reviews',
    problem: 'Clinics and shops lose customers to unanswered Google reviews because replying is slow, repetitive work.',
    built: 'An inbox that drafts a reply to every review with AI. The owner approves before anything is posted.',
    outcomes: ['AI drafts', 'Owner approves every reply'],
    href: '/reviews',
  },
  {
    tag: 'Hospitality',
    name: 'DinePulse',
    problem: 'Busy Indian restaurants lose time on slow legacy billing machines and kitchen miscommunication.',
    built: 'A fast touch till with instant kitchen tickets, UPI QR payments and WhatsApp bills.',
    outcomes: ['3 clicks to bill', 'Real-time kitchen tickets'],
    href: '/projects/dinepulse',
  },
  {
    tag: 'Manufacturing',
    name: 'Silaa Atelier',
    problem: 'Garment factories lose expensive fabric to manual marker calculations and untracked remnants.',
    built: 'An ERP that tracks fabric rolls by dye lot and calculates cutting yield down to the millimetre.',
    outcomes: ['99.2% fabric yield', 'Zero remnant leakage'],
    href: '/projects/silaa-atelier',
  },
  {
    tag: 'AI · Consumer',
    name: 'Tyson Chess',
    problem: 'I hit a paywall solving more than 3 chess puzzles a day on the app I played on, so I built the version I wanted.',
    built: 'A free in-browser chess coach with a Stockfish engine, calibrated bots and plain-English move explanations.',
    outcomes: ['Free and unlimited', 'Runs in the browser'],
    href: '/projects/tysonchess',
  },
  {
    tag: 'AI · Builder tooling',
    name: 'Chief of Staff AI',
    problem: 'One person cannot research, plan, build, test and review everything fast enough.',
    built: 'A multi-agent framework where specialist AI agents plan, build, review and test work for me.',
    outcomes: ['Multi-agent workflow', 'Open source'],
    href: '/projects/agents-and-skills',
  },
];

const PRINCIPLES = [
  { title: 'Start from the pain', body: 'If I cannot name the person and the problem in one sentence, I do not build it.' },
  { title: 'Keep humans in charge', body: 'AI drafts, suggests and automates. People approve anything that matters.' },
  { title: 'Own the whole loop', body: 'Product, design, code, deploy and support, so nothing gets lost between handoffs.' },
  { title: 'Ship small, learn fast', body: 'A working version in front of real users beats a perfect plan.' },
];

export default function HomePage() {
  const total = PROJECTS.length;
  const live = PROJECTS.filter((p) => p.status === 'live').length;

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-10 sm:pt-20 space-y-7">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-300">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          Manoj Tyson · Product builder · Bangalore
        </div>
        <h1 className="font-display font-semibold text-4xl sm:text-6xl md:text-7xl text-zinc-950 dark:text-white tracking-tight leading-[1.05] [text-wrap:balance]">
          I turn real-world problems into AI-powered products.
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl [text-wrap:pretty]">
          I start with a real problem in a real business, define the product, and ship it end to end. I use AI to build faster, and to put intelligence inside the product where it genuinely helps.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="#products"
            className="btn-tactile px-6 py-3.5 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
          >
            <span>See what I have built</span>
          </a>
          <Link
            href="/contact"
            className="btn-tactile px-6 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-all active:scale-[0.98]"
          >
            <span>Get in touch</span>
          </Link>
        </div>
        <dl className="grid grid-cols-2 gap-4 max-w-sm pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div>
            <dt className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Projects built</dt>
            <dd className="font-display font-semibold text-3xl text-zinc-950 dark:text-white">{total}</dd>
          </div>
          <div>
            <dt className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Live today</dt>
            <dd className="font-display font-semibold text-3xl text-zinc-950 dark:text-white">{live}</dd>
          </div>
        </dl>
      </section>

      {/* Process */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 space-y-10">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">How I work</div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
            From problem to product, in four moves.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROCESS.map((s, i) => (
            <div key={s.title} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#111216] space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </span>
                <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">0{i + 1}</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-zinc-950 dark:text-white">{s.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Selected products */}
      <section id="products" className="max-w-5xl mx-auto px-6 sm:px-8 space-y-10 scroll-mt-24">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Selected products</div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
            Problems I picked, and what I shipped.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {CASES.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="group p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-300">{c.tag}</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
              </div>
              <h3 className="font-display font-semibold text-2xl text-zinc-950 dark:text-white">{c.name}</h3>
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">Problem. </span>
                  {c.problem}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">Built. </span>
                  {c.built}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto pt-1">
                {c.outcomes.map((o) => (
                  <span key={o} className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    {o}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-semibold underline">
          All {total} projects <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>

      {/* AI */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 space-y-10">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Building with AI</div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
            AI in two places: inside the product, and behind it.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="p-7 rounded-2xl border border-teal-200 dark:border-teal-900 bg-teal-50/40 dark:bg-teal-950/20 space-y-3">
            <Cpu className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="font-display font-semibold text-xl text-zinc-950 dark:text-white">Inside the product</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              AI does the tedious part, like drafting a review reply or explaining a chess move, and the person stays in control of the outcome.
            </p>
          </div>
          <div className="p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <Bot className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="font-display font-semibold text-xl text-zinc-950 dark:text-white">Behind the product</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              I run specialist AI agents for research, planning, building and review, so one person can ship at the pace of a small team.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 space-y-8">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">How I think about products</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="space-y-2 border-t border-zinc-300 dark:border-zinc-700 pt-4">
              <h3 className="font-semibold text-zinc-950 dark:text-white">{p.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 pb-16">
        <div className="p-8 sm:p-12 rounded-2xl bg-zinc-950 text-white dark:bg-[#111216] border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Let's talk</div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-white [text-wrap:balance]">
              Got a problem worth solving?
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Tell me about it. Write to {CONTACT_EMAIL} or use the contact form.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-black hover:bg-zinc-200 font-semibold text-sm transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <span>Get in touch</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
