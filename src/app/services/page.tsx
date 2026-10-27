import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Code2,
  Cpu,
  Layers,
  CreditCard,
  MessageSquareCode,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Hammer,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Studio Services & Engineering Capabilities',
  description: 'Full-stack web engineering, custom SaaS operating systems, AI agent workflows, and Razorpay fintech integrations.',
};

export default function ServicesPage() {
  const capabilities = [
    {
      id: 'web-apps',
      icon: Code2,
      title: 'Full-Stack Web & SaaS Applications',
      tagline: 'High-performance, zero-slop web applications tailored to operational realities.',
      description: 'End-to-end frontend and backend development using modern frameworks (Next.js, React 19, TypeScript, FastAPI, PostgreSQL). Designed with high contrast, tactile keyboard shortcuts, and zero layout shift.',
      deliverables: [
        'Production Next.js App Router architectures',
        'TypeScript strict typing & clean API route handlers',
        'Relational database modeling with Prisma or SQLAlchemy',
        'Serverless or containerized deployment on Vercel/Docker',
      ],
      sampleBuilds: 'DinePulse, Silaa Atelier, PhysioCare',
    },
    {
      id: 'fintech-gst',
      icon: CreditCard,
      title: 'Indian Fintech & GST Invoicing Engines',
      tagline: 'Flawless Razorpay payment gateways, UPI intent, and compliant tax calculations.',
      description: 'Complete integration of payment providers with idempotent server-side webhooks, HMAC signature verification, place-of-supply tax splits (CGST + SGST vs IGST), and browser-native A4 printable tax invoices.',
      deliverables: [
        'Razorpay Orders API, Checkout.js, and Payment Links',
        'Idempotent webhook deduplication & HMAC-SHA256 validation',
        'Automated GST tax breakdown with HSN/SAC codes',
        'Clean, print-ready A4 PDF invoicing without external bloat',
      ],
      sampleBuilds: 'DinePulse Till, Tysonpe, KBD Books',
    },
    {
      id: 'ai-agents',
      icon: Cpu,
      title: 'AI Agent Coordination & Copilots',
      tagline: 'Multi-agent frameworks, specialized LLM copilots, and autonomous pipelines.',
      description: 'Engineering intelligent tools that go beyond simple chat interfaces. We design multi-agent systems with strict separation of roles (planning, coding, testing, review) and integrate low-latency voice-to-JSON order entry.',
      deliverables: [
        'Multi-agent role architectures with task verification gates',
        'Speech-to-structured-data NLP parsers (Gemini / Claude)',
        'Headroom token compression strategies for 70%+ token savings',
        'Automated research, script, and visual pipeline generation',
      ],
      sampleBuilds: 'Chief of Staff AI, Gemini Hospitality Copilot, YouTube Pipeline',
    },
    {
      id: 'whatsapp-automation',
      icon: MessageSquareCode,
      title: 'WhatsApp Business API & Conversational Bots',
      tagline: 'Transactional messaging, digital bills, and automated customer engagement.',
      description: 'Connecting software backends to WhatsApp via official Business APIs (Interakt). Automate instant invoice dispatches, order preparation status updates, table reservations, and 5-star review collection without spam.',
      deliverables: [
        'Automated outbound template campaigns triggered by server events',
        'Delivery webhook monitoring (Sent, Delivered, Read receipt state)',
        'Shared inbox routing for seamless human agent handoff',
        'Automated customer feedback & review booster sequences',
      ],
      sampleBuilds: 'DinePulse WhatsApp Engine, Interakt Gateway',
    },
    {
      id: 'erp-operations',
      icon: Layers,
      title: 'Industry Cloud OS & Internal Tooling',
      tagline: 'Custom ERPs, POS tills, and telemetry dashboards replacing messy spreadsheets.',
      description: 'Custom software engineered specifically for vertical industries: restaurant dining rooms, garment manufacturing floors, physical therapy clinics, and IT agencies. Designed to be operated quickly under real working conditions.',
      deliverables: [
        'Touch-optimized daylight point-of-sale interfaces',
        'Multi-stage production order tracking (Cut-Make-Trim)',
        'Inventory tracking with wastage & yield converters',
        'Normalized operational cash flow and burn rate analytics',
      ],
      sampleBuilds: 'Silaa ERP, DinePulse, Nexify Dashboard',
    },
  ];

  const processSteps = [
    {
      step: '01',
      icon: Compass,
      title: 'Problem Framing & Architecture Spec',
      description: 'We diagnose the actual operational bottleneck, define exact database schemas, establish API contracts, and verify edge cases before writing a line of code.',
    },
    {
      step: '02',
      icon: Hammer,
      title: 'Tactile Sprint Build',
      description: 'Rapid, test-driven implementation. Working prototypes delivered in days, with daylight UI tokens, verified API endpoints, and clean git history.',
    },
    {
      step: '03',
      icon: ShieldCheck,
      title: 'Hardening & Edge Verification',
      description: 'Stress-testing payment webhooks, database connection pool limits, mobile responsive viewports, and WCAG accessibility standards.',
    },
    {
      step: '04',
      icon: Send,
      title: 'Production Handover & Launch',
      description: 'Automated CI/CD deployment on Vercel or cloud infra, complete documentation, and seamless handover with zero vendor lock-in.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-20">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-[#64748B] font-mono">
          STUDIO DISCIPLINES & ENGAGEMENTS
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight">
          How TysonLabs works with you.
        </h1>
        <p className="text-base text-[#94A3B8] leading-relaxed">
          We partner with founders, operational businesses, and technical teams to design and build durable software systems. No boilerplate templates, no outsourced layers — direct senior craftsmanship.
        </p>
      </div>

      {/* Capabilities Grid */}
      <section className="space-y-8">
        <div className="pb-3 border-b border-white/[0.08]">
          <h2 className="font-display font-bold text-2xl text-white">
            Core Disciplines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                className="p-7 rounded-2xl bg-[#0F1116] border border-white/[0.08] hover:border-white/[0.2] transition-all space-y-6 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#090A0D] border border-white/[0.08] flex items-center justify-center text-white">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-xl text-white">
                      {cap.title}
                    </h3>
                    <p className="text-xs font-mono text-[#94A3B8] mt-1">
                      {cap.tagline}
                    </p>
                  </div>

                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {cap.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
                      Concrete Deliverables:
                    </div>
                    {cap.deliverables.map((deliv, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <span>Proven In: <span className="text-[#94A3B8] font-medium">{cap.sampleBuilds}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 4-Step Studio Process */}
      <section className="space-y-8">
        <div className="pb-3 border-b border-white/[0.08]">
          <h2 className="font-display font-bold text-2xl text-white">
            The Engineering Process
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Predictable sprints, clear milestone gates, and transparent communication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {processSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="p-6 rounded-2xl bg-[#0F1116] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-white">{step.step}</span>
                  <Icon className="w-5 h-5 text-[#64748B]" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Callout */}
      <section className="p-8 sm:p-12 rounded-2xl bg-[#0F1116] border border-white/[0.08] text-center space-y-6 max-w-3xl mx-auto shadow-2xl">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Ready to engineer your product?
        </h2>
        <p className="text-sm text-[#94A3B8] leading-relaxed max-w-xl mx-auto">
          We take on a limited number of high-conviction client and partner builds to ensure undivided attention and uncompromising quality.
        </p>
        <div>
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors active:scale-[0.98]"
          >
            <span>Start an inquiry</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
