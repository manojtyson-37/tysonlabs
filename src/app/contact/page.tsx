'use client';

import React, { useState } from 'react';
import { Mail, ArrowUpRight, CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Full-Stack Web / SaaS App',
    budget: '',
    message: '',
    honeypot: '', // spam prevention
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    // Client-side quick check
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill out all required fields before submitting.');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setStatus('error');
        setErrorMessage(json.error || 'Failed to submit form. Please try again.');
      } else {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          projectType: 'Full-Stack Web / SaaS App',
          budget: '',
          message: '',
          honeypot: '',
        });
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('A network error occurred. Please try again or reach out directly.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-[#64748B] font-mono">
          DIRECT STUDIO INQUIRY
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight">
          Let&apos;s build something real.
        </h1>
        <p className="text-base text-[#94A3B8] leading-relaxed">
          Have an engineering challenge, a vertical SaaS idea, or an operations system to build? Send a note below with the scope and we&apos;ll get back to you with architectural clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-2xl bg-[#0F1116] border border-white/[0.08] shadow-xl shadow-black/40">
            {status === 'success' ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white">
                  Inquiry Received
                </h3>
                <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to TysonLabs. We have logged your project details and will follow up with direct technical feedback.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="btn-tactile px-5 py-2.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field (hidden) */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {status === 'error' && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                    Your Name <span className="text-white">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Manoj Kumar"
                    className="w-full px-4 py-3 rounded-xl bg-[#090A0D] border border-white/[0.08] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                    Email Address <span className="text-white">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#090A0D] border border-white/[0.08] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Project Type */}
                <div className="space-y-2">
                  <label htmlFor="projectType" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                    Project Focus
                  </label>
                  <select
                    id="projectType"
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#090A0D] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="Full-Stack Web / SaaS App">Full-Stack Web / SaaS App</option>
                    <option value="AI Agents & Workflow Automation">AI Agents & Workflow Automation</option>
                    <option value="Point-of-Sale / ERP / Operations">Point-of-Sale / ERP / Operations</option>
                    <option value="Fintech & Payment Gateway Integration">Fintech & Payment Gateway Integration</option>
                    <option value="Architecture Consulting / Code Audit">Architecture Consulting / Code Audit</option>
                    <option value="Other / Advisory">Other / Advisory</option>
                  </select>
                </div>

                {/* Budget Range (Optional) */}
                <div className="space-y-2">
                  <label htmlFor="budget" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                    Approximate Budget (Optional)
                  </label>
                  <select
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#090A0D] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="">Prefer to discuss after scoping</option>
                    <option value="Under ₹1,00,000 (Small sprint / review)">Under ₹1,00,000 (Small sprint / review)</option>
                    <option value="₹1,00,000 – ₹3,00,000 (MVP build)">₹1,00,000 – ₹3,00,000 (MVP build)</option>
                    <option value="₹3,00,000 – ₹8,00,000 (Full-stack OS)">₹3,00,000 – ₹8,00,000 (Full-stack OS)</option>
                    <option value="₹8,00,000+ (Multi-month partner)">₹8,00,000+ (Multi-month partner)</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                    What are you looking to build? <span className="text-white">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe the operational challenge, desired timeline, or technical requirements..."
                    className="w-full px-4 py-3 rounded-xl bg-[#090A0D] border border-white/[0.08] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-white/30 transition-colors resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-tactile w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Project Inquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Info & Direct Channels */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-6 rounded-2xl bg-[#0F1116] border border-white/[0.08] space-y-6">
            <h3 className="font-display font-bold text-lg text-white">
              Verified Channels
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              If you prefer direct code inspection, GitHub issues, or messaging:
            </p>

            <ul className="space-y-3 text-xs font-mono">
              <li>
                <a
                  href="https://github.com/manojtyson-37"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tactile p-3.5 rounded-xl bg-[#090A0D] border border-white/[0.08] flex items-center justify-between group hover:border-white/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <GithubIcon className="w-4 h-4 text-[#64748B] group-hover:text-white" />
                    <span className="text-white">github.com/manojtyson-37</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white" />
                </a>
              </li>

              <li className="p-3.5 rounded-xl bg-[#090A0D] border border-white/[0.08] flex items-center justify-between text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Direct Studio Email</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/60">
                  MONITORED
                </span>
              </li>
            </ul>

            <div className="pt-4 border-t border-white/[0.06] text-xs text-[#64748B] space-y-2">
              <div className="font-semibold text-white">Response SLA</div>
              <p>We review every inquiry within 24 to 48 hours with thoughtful technical feedback.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
