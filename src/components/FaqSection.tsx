import React from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'What kind of systems does TysonLabs engineer?',
    answer: 'We build mission critical operational software: local first restaurant billing tills, garment factory inventory ERPs, in browser WebAssembly engines, and autonomous multi agent workflows. Every build is designed for production operators who cannot afford system downtime.',
  },
  {
    question: 'Who owns the code and infrastructure after launch?',
    answer: 'You retain complete, 100% sovereign ownership. All repositories, database schemas, deployment pipelines, and environment keys transfer directly to your team upon delivery. No recurring vendor rent, no proprietary lock in.',
  },
  {
    question: 'How fast can a production build be shipped?',
    answer: 'Targeted operational engines and vertical SaaS MVPs typically ship in two to four weeks. Full enterprise factory ERPs or complex multi agent suites take four to eight weeks, delivered in continuous weekly deployments.',
  },
  {
    question: 'How do local first and offline tills handle sync?',
    answer: 'Systems like DinePulse run local SQLite or IndexedDB storage on the device, allowing uninterrupted billing even during complete internet dropouts. Changes queue and merge deterministically when network connectivity restores.',
  },
  {
    question: 'Can TysonLabs integrate with existing legacy ERPs and hardware?',
    answer: 'Yes. We have built integrations for thermal ESC POS receipt printers, weighing scales, Indian GST portals, Razorpay payment webhooks, and custom REST APIs.',
  },
  {
    question: 'What is the commercial model and engagement structure?',
    answer: 'We work on fixed scope architectural sprints with clear milestones. Scoping and technical architectural review carry zero upfront commitment until both sides agree on execution specifications.',
  },
  {
    question: 'Who directly engineers the software?',
    answer: 'Work is led directly by founding engineer Manoj Tyson. You get direct architectural communication with zero account manager telephone game.',
  },
  {
    question: 'How do you handle maintenance and production support?',
    answer: 'Every deployment includes a 30 day dedicated post launch warranty with monitoring, error telemetry, and performance tuning, followed by optional ongoing retainer support.',
  },
];

export function FaqSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16" aria-label="Frequently Asked Questions">
      <div className="mb-10 max-w-2xl">
        <div className="text-xs uppercase tracking-wider font-mono text-zinc-500 mb-2">
          Clear Answers & Terms
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
          Frequently asked questions.
        </h2>
        <p className="text-sm text-zinc-600 dark:text-[#9B9B9B] mt-2 [text-wrap:pretty]">
          Everything you need to know about commissioning software, code ownership, and deployment timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {FAQS.map((faq, index) => (
          <article
            key={index}
            className="p-6 rounded-2xl bg-white dark:bg-[#181818] border border-black/[0.08] dark:border-white/[0.08] flex flex-col justify-between hover:border-black/[0.2] dark:hover:border-white/[0.18] shadow-xs hover:shadow-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <div>
              <h3 className="text-base font-semibold text-zinc-950 dark:text-white tracking-tight leading-snug mb-2.5 [text-wrap:balance]">
                {faq.question}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-[#9B9B9B] leading-relaxed [text-wrap:pretty]">
                {faq.answer}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.04] text-[11px] font-mono text-zinc-400 dark:text-[#666666]">
              Verified Studio Policy
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

