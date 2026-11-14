'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MapPin,
  Download,
  ArrowRight,
  Lock,
} from 'lucide-react';

export function PayClient() {
  const [handle, setHandle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSimulatePayment = () => {
    if (!handle.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between py-12 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Creator Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                <img
                  src="https://scontent.fblr20-4.fna.fbcdn.net/v/t51.82787-15/728684716_17933051643335413_7130452107853258551_n.jpg?_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=7d201b&_nc_ohc=Mt_yofgqI5EQ7kNvwHyhXjm&_nc_oc=AdoaOaBsTyjJrSJDLvV1MosGR8u6zXFH-Odu3j6SqMXVqZQtU64ac6p_oTUnznxafO3nzouSYSTFTlEeVBArJcmD&_nc_zt=23&_nc_ht=scontent.fblr20-4.fna&edm=AHN6ZZcEAAAA&_nc_gid=MmCVqJuszZHoK75uonuUGQ&oh=00_AQT778umoZUs3JDi4IaeDc40OgqE9tLQHXCga5aUWIZ7xg&oe=6AFDB2A8"
                  alt="Travel Kathegalu"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm text-white">Travel Kathegalu ✈️🌍</h1>
              </div>
              <p className="text-xs text-zinc-400">@travel_kathegalu · Verified Creator</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Instant DM Delivery
          </span>
        </div>

        {isSuccess ? (
          <div className="rounded-2xl bg-zinc-900 border border-emerald-500/40 p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Access Unlocked! 🎉</h2>
              <p className="text-xs text-zinc-300">
                Your payment of <strong className="text-white">₹199</strong> was successful. The complete 3-Day Bengaluru Guide & Google Maps pins have been dispatched to your Instagram DMs!
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-left space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Direct Download Link
              </span>
              <a
                href="https://tysonlabs.in/inbox"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-zinc-950 font-bold text-xs py-2.5 hover:opacity-90 transition"
              >
                <Download className="w-4 h-4" />
                Download Itinerary PDF (2.4 MB)
              </a>
            </div>

            <a
              href="https://instagram.com/travel_kathegalu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-white transition inline-flex items-center gap-1"
            >
              Return to @travel_kathegalu on Instagram ↗
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Product Card */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-5 shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider bg-purple-950/60 border border-purple-800/40 px-2.5 py-0.5 rounded-full">
                    Exclusive Creator Guide
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">₹199</span>
                    <span className="text-xs text-zinc-400 line-through ml-2">₹499</span>
                  </div>
                </div>
                <h2 className="text-base font-bold text-white leading-snug">
                  Curated Bengaluru Hidden Gems & Legendary Food Crawl (3-Day Guide)
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The exact, tested weekend blueprint created by @travel_kathegalu. Skip tourist traps and taste real Bangalore.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                <div className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>25+ Iconic Food Spots:</strong> Filter coffee, crispy dosas, Benne masala, and hidden dessert joints.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Interactive Google Map:</strong> One-tap import with all pins, best hours & parking tips.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Instant DM Delivery:</strong> Auto-delivered directly to your Instagram inbox the second payment clears.</span>
                </div>
              </div>

              {/* Handle Entry */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Your Instagram Username <span className="text-zinc-500 font-normal">(for automated DM delivery)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold">
                    @
                  </span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace('@', ''))}
                    placeholder="your_instagram_handle"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-700 pl-8 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing || !handle.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold text-sm py-3 px-4 shadow-lg hover:opacity-95 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {isProcessing ? 'Processing Secure Payment…' : 'Pay ₹199 & Unlock Instant Guide'}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">🔒 256-bit SSL</span>
                <span>•</span>
                <span>UPI / GPay / PhonePe / Cards</span>
                <span>•</span>
                <span>Instant Delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center pt-8 text-[11px] text-zinc-500">
        Powered by <strong className="text-zinc-400">TysonLabs Creator Commerce</strong> · Automated DM Delivery Engine
      </div>
    </div>
  );
}
