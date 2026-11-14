'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Download,
  ExternalLink,
  Clock,
  Compass,
  Coffee,
  Sparkles,
  Share2,
  Check,
  ChevronRight,
  Info,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface ItineraryStop {
  id: string;
  time: string;
  name: string;
  established?: string;
  locality: string;
  metroStop: string;
  badge: 'FSSAI_VEG' | 'HERITAGE' | 'NATURE' | 'COLONIAL' | 'BREWPUB' | 'CAFE';
  mustOrder: string;
  budgetForTwo: string;
  description: string;
  googleMapsUrl: string;
}

const DAY_1_STOPS: ItineraryStop[] = [
  {
    id: 'vidyarthi-bhavan',
    time: '07:00 AM',
    name: 'Vidyarthi Bhavan',
    established: 'Est. 1943',
    locality: 'Gandhi Bazaar, Basavanagudi',
    metroStop: 'National College (Green Line)',
    badge: 'FSSAI_VEG',
    mustOrder: 'Crispy Ghee Masale Dosa + Thick Filter Kaapi',
    budgetForTwo: '₹140',
    description:
      'Historic institution where Bengaluru artists, writers, and thinkers meet. Watch the iconic waiters effortlessly balance 20 plates of ghee dosa on their forearms.',
    googleMapsUrl: 'https://maps.google.com/?q=Vidyarthi+Bhavan+Gandhi+Bazaar+Bengaluru',
  },
  {
    id: 'bugle-rock',
    time: '09:00 AM',
    name: 'Bugle Rock & Bull Temple (Dodda Basavana Gudi)',
    established: 'Built 1537',
    locality: 'Bull Temple Road, Basavanagudi',
    metroStop: 'South End Circle (Green Line)',
    badge: 'HERITAGE',
    mustOrder: 'Dodda Ganesha darshan & ancient 3-billion-year-old rock walk',
    budgetForTwo: 'Free Entry',
    description:
      'Colossal monolith Nandi carved from a single granite boulder in 1537 by Kempe Gowda. Stroll through the tranquil, breezy bamboo canopy of Bugle Rock Park.',
    googleMapsUrl: 'https://maps.google.com/?q=Dodda+Basavana+Gudi+Bull+Temple+Bengaluru',
  },
  {
    id: 'brahmins-coffee-bar',
    time: '11:00 AM',
    name: "Brahmin's Coffee Bar",
    established: 'Est. 1965',
    locality: 'Ranka Colony, Shankarpuram',
    metroStop: 'National College (Green Line)',
    badge: 'FSSAI_VEG',
    mustOrder: 'Piping hot Thatte Idli with unbounded mint-coconut chutney & Vada',
    budgetForTwo: '₹80',
    description:
      'Zero seating, standing pavement culture at its purest. No sambar served here—just silky, pillowy idlis and crunchy vadas drenched in fresh, aromatic coconut chutney.',
    googleMapsUrl: 'https://maps.google.com/?q=Brahmins+Coffee+Bar+Shankarpuram+Bengaluru',
  },
  {
    id: 'lalbagh',
    time: '02:00 PM',
    name: 'Lalbagh Botanical Garden & 1889 Glass House',
    established: 'Commissioned 1760',
    locality: 'Lalbagh West Gate / Mavalli',
    metroStop: 'Lalbagh (Green Line)',
    badge: 'NATURE',
    mustOrder: 'Walk the shaded lakeside trail & visit 200-year-old cotton silk tree',
    budgetForTwo: '₹30 / person',
    description:
      '240 acres commissioned by Hyder Ali and expanded by Tipu Sultan. The iconic Glass House was modeled after London’s Crystal Palace. Perfect afternoon respite under centuries-old canopies.',
    googleMapsUrl: 'https://maps.google.com/?q=Lalbagh+Botanical+Garden+Bengaluru',
  },
  {
    id: 'mtr-original',
    time: '05:30 PM',
    name: 'Mavalli Tiffin Room (MTR - Original Branch)',
    established: 'Est. 1924',
    locality: 'Lalbagh Road, Mavalli',
    metroStop: 'Lalbagh (Green Line)',
    badge: 'FSSAI_VEG',
    mustOrder: 'Inventor of Rava Idli during WWII + Silver cup Filter Kaapi',
    budgetForTwo: '₹220',
    description:
      'A centennial culinary legend. Sip authentic filter coffee made from 80:20 chicory-blend beans poured between dabarah and tumbler to create the velvet froth.',
    googleMapsUrl: 'https://maps.google.com/?q=Mavalli+Tiffin+Room+Lalbagh+Road+Bengaluru',
  },
];

const DAY_2_STOPS: ItineraryStop[] = [
  {
    id: 'bengaluru-cafe',
    time: '07:30 AM',
    name: 'Bengaluru Cafe',
    established: 'Neighborhood Icon',
    locality: '9th Main, Jayanagar 4th Block',
    metroStop: 'Jayanagar (Green Line)',
    badge: 'FSSAI_VEG',
    mustOrder: 'Button Idli Sambar, Khara Bath & Filter Coffee',
    budgetForTwo: '₹120',
    description:
      'The modern south Bangalore gold standard for fresh Rava Idlis, ghee dip tiffins, and rich froth filter coffee right beside the quiet tree-lined avenues of Jayanagar.',
    googleMapsUrl: 'https://maps.google.com/?q=The+Bengaluru+Cafe+9th+Main+Jayanagar',
  },
  {
    id: 'cubbon-park',
    time: '09:30 AM',
    name: 'Cubbon Park & State Central Library',
    established: 'Est. 1870',
    locality: 'Kasturba Road / Ambedkar Veedhi',
    metroStop: 'Cubbon Park (Purple Line)',
    badge: 'NATURE',
    mustOrder: 'Stroll past crimson red Seshadri Iyer Memorial Hall & bamboo groves',
    budgetForTwo: 'Free Entry',
    description:
      '300 acres of tranquil bamboo groves, mahogany trees, and quiet avenues. Strict no-vehicle rule on mornings makes this the city’s favorite green sanctuary.',
    googleMapsUrl: 'https://maps.google.com/?q=Cubbon+Park+Bengaluru',
  },
  {
    id: 'blossom-book-house',
    time: '12:00 PM',
    name: 'Blossom Book House & Church Street Stroll',
    established: 'Est. 2001',
    locality: 'Church Street, Off MG Road',
    metroStop: 'MG Road (Purple Line)',
    badge: 'HERITAGE',
    mustOrder: 'Browse 3 floors of rare pre-loved books & Church Street murals',
    budgetForTwo: 'Free Browse',
    description:
      'Iconic independent bookstore housing over 200,000 titles. Church Street’s pedestrian-friendly cobblestone boulevard is lined with independent creators, buskers, and cafes.',
    googleMapsUrl: 'https://maps.google.com/?q=Blossom+Book+House+Church+Street+Bengaluru',
  },
  {
    id: 'koshys',
    time: '02:00 PM',
    name: "Koshy's Cafe & Restaurant",
    established: 'Est. 1940',
    locality: "St. Mark's Road, Ashok Nagar",
    metroStop: 'MG Road (Purple Line)',
    badge: 'COLONIAL',
    mustOrder: 'Appam & Vegetable Stew / Mutton Cutlets & Filter Coffee',
    budgetForTwo: '₹450',
    description:
      'Where Jawaharlal Nehru, Queen Elizabeth II, and generations of journalists debated politics beneath spinning retro ceiling fans and heritage wood finishes.',
    googleMapsUrl: 'https://maps.google.com/?q=Koshys+Restaurant+St+Marks+Road+Bengaluru',
  },
  {
    id: 'bangalore-palace',
    time: '05:00 PM',
    name: 'Bangalore Palace & Sankey Tank Sunset',
    established: 'Built 1878',
    locality: 'Vasanth Nagar & Sadashivanagar',
    metroStop: 'Mantri Square Sampige Road (Green Line)',
    badge: 'HERITAGE',
    mustOrder: 'Tudor-style architecture tour & Sankey Tank promenade',
    budgetForTwo: '₹250 Palace Entry',
    description:
      'Built in 1878 by the Wadiyar dynasty with fortified towers and woodcarvings. End the day watching golden hour reflections across the tree-lined waters of Sankey Tank.',
    googleMapsUrl: 'https://maps.google.com/?q=Bangalore+Palace+Bengaluru',
  },
];

const DAY_3_STOPS: ItineraryStop[] = [
  {
    id: 'ctr-shri-sagar',
    time: '08:00 AM',
    name: 'CTR (Central Tiffin Room / Shri Sagar)',
    established: 'Est. 1920s',
    locality: '7th Cross, Margosa Road, Malleshwaram',
    metroStop: 'Sampige Road (Green Line)',
    badge: 'FSSAI_VEG',
    mustOrder: 'Benne Masale Dosa (Crispy outside, buttery pillow center)',
    budgetForTwo: '₹130',
    description:
      'Operating for over a century. Famous for its thick golden brown crust with generous pure butter glaze, mild spiced potato palya, and sharp mint chutney.',
    googleMapsUrl: 'https://maps.google.com/?q=Shri+Sagar+CTR+7th+Cross+Malleshwaram+Bengaluru',
  },
  {
    id: 'kadu-malleshwara',
    time: '10:30 AM',
    name: 'Kadu Malleshwara Temple & Flower Market',
    established: '17th Century',
    locality: 'Malleshwaram 15th Cross',
    metroStop: 'Sampige Road (Green Line)',
    badge: 'HERITAGE',
    mustOrder: 'Nandishwara Teertha natural spring & jasmine flower market',
    budgetForTwo: 'Free Entry',
    description:
      '17th-century Dravidian temple complex built by Shivaji’s brother Venkoji. The nearby flower market fills the street with fragrant Mysore Mallige and marigold garlands.',
    googleMapsUrl: 'https://maps.google.com/?q=Kadu+Malleshwara+Temple+Bengaluru',
  },
  {
    id: 'indiranagar-third-wave',
    time: '01:30 PM',
    name: 'Indiranagar 12th Main & Third Wave Coffee',
    established: 'Modern Craft',
    locality: '12th Main Indiranagar',
    metroStop: 'Indiranagar (Purple Line)',
    badge: 'CAFE',
    mustOrder: 'Aeropress single-origin Chikmagalur roast & artisanal bakes',
    budgetForTwo: '₹350',
    description:
      'Tree-canopied indie street packed with design studios, apparel pop-ups, and contemporary coffee houses showcasing Indian specialty bean origins.',
    googleMapsUrl: 'https://maps.google.com/?q=Third+Wave+Coffee+Roasters+12th+Main+Indiranagar',
  },
  {
    id: 'toit-brewpub',
    time: '06:00 PM',
    name: 'Toit Brewpub',
    established: 'Est. 2010',
    locality: '100 Feet Road, Indiranagar',
    metroStop: 'Indiranagar (Purple Line)',
    badge: 'BREWPUB',
    mustOrder: 'Tintin Toit (Belgian Wit) & Wood-fired Pepperoni Pizza',
    budgetForTwo: '₹1,400',
    description:
      'Pioneered India’s microbrewery revolution. Pet-friendly, multi-level brick brewhouse serving naturally carbonated unfiltered ales made with pristine local brews.',
    googleMapsUrl: 'https://maps.google.com/?q=Toit+Brewpub+100+Feet+Road+Indiranagar',
  },
];

export default function BengaluruGuidePage() {
  const [activeDay, setActiveDay] = useState<1 | 2 | 3>(1);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const activeStops = activeDay === 1 ? DAY_1_STOPS : activeDay === 2 ? DAY_2_STOPS : DAY_3_STOPS;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-orange-600 selection:text-white">
      {/* Top Breadcrumb & Status Header */}
      <div className="border-b border-zinc-800/80 bg-black/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition">
              TysonLabs
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-medium">Guides</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-orange-500 font-semibold truncate max-w-[140px] sm:max-w-none">
              Bengaluru 3-Day Itinerary 2026
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 font-medium active:scale-[0.98] transition"
            >
              {copiedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            <a
              href="/guides/bengaluru-itinerary-2026.pdf"
              download="bengaluru-itinerary-2026.pdf"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm active:scale-[0.98] transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Editorial Header Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-orange-950/80 border border-orange-800/60 text-orange-400">
              Official 2026 Edition
            </span>
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Creator Curation
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            The Definitive 3-Day Bengaluru Heritage & Food Guide
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
            Curated by <strong>@travel_kathegalu</strong>. An insider circuit through centennial South Indian tiffin institutions, ancient granite temples, shaded colonial canopies, indie bookstores, and pioneering microbreweries.
          </p>

          {/* Creator Attribution Strip */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                <img
                  src="https://scontent.fblr20-4.fna.fbcdn.net/v/t51.82787-15/728684716_17933051643335413_7130452107853258551_n.jpg?_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=7d201b&_nc_ohc=Mt_yofgqI5EQ7kNvwHyhXjm&_nc_oc=AdoaOaBsTyjJrSJDLvV1MosGR8u6zXFH-Odu3j6SqMXVqZQtU64ac6p_oTUnznxafO3nzouSYSTFTlEeVBArJcmD&_nc_zt=23&_nc_ht=scontent.fblr20-4.fna&edm=AHN6ZZcEAAAA&_nc_gid=MmCVqJuszZHoK75uonuUGQ&oh=00_AQT778umoZUs3JDi4IaeDc40OgqE9tLQHXCga5aUWIZ7xg&oe=6AFDB2A8"
                  alt="Travel Kathegalu"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">Travel Kathegalu</span>
                <span className="text-xs text-zinc-400">(@travel_kathegalu)</span>
              </div>
              <p className="text-xs text-zinc-500">
                Instagram Creator & Bangalore Local Food Historian
              </p>
            </div>
          </div>
        </div>

        {/* Namma Metro & Golden Hour Protocol Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-950/60 border border-orange-800/40 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-200">
                Tiffin Golden Hour: 06:30 AM - 09:30 AM
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Legendary tiffin houses churn their best crispy Ghee Masale Dosas and steaming Thatte Idlis between 7:00 AM and 9:00 AM. Arrive early to skip the hour-long basavanagudi queues.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-200">
                Namma Metro Smart Transit
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect seamlessly using the <strong>Purple Line</strong> (MG Road, Cubbon Park, Indiranagar) and <strong>Green Line</strong> (Basavanagudi, Lalbagh, Malleshwaram). Majestic is the central interchange.
              </p>
            </div>
          </div>
        </div>

        {/* Day Selector Navigation Pills */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveDay(1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-[0.98] ${
              activeDay === 1
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span>Day 1: Basavanagudi & South Tiffins</span>
          </button>

          <button
            onClick={() => setActiveDay(2)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-[0.98] ${
              activeDay === 2
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span>Day 2: Cubbon Park & Colonial Cafes</span>
          </button>

          <button
            onClick={() => setActiveDay(3)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-[0.98] ${
              activeDay === 3
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span>Day 3: Malleshwaram & Craft Brews</span>
          </button>
        </div>

        {/* Itinerary Stops List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>
                {activeDay === 1
                  ? 'Day 1: Old Bengaluru Heritage & Centennial Tiffins'
                  : activeDay === 2
                  ? 'Day 2: The Green Canopies, Colonial Soul & Church Street'
                  : 'Day 3: Malleshwaram Temple Streets & Indiranagar Evening Brews'}
              </span>
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              {activeStops.length} Curated Stops
            </span>
          </div>

          <div className="space-y-4">
            {activeStops.map((stop, index) => (
              <div
                key={stop.id}
                className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition space-y-4 shadow-sm"
              >
                {/* Header: Time, Name, Badge, Maps Link */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950/60 border border-orange-800/40 px-2 py-0.5 rounded">
                        {stop.time}
                      </span>
                      <h3 className="font-bold text-base sm:text-lg text-white">
                        {stop.name}
                      </h3>
                      {stop.established && (
                        <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
                          ({stop.established})
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span>{stop.locality}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400 font-medium">{stop.metroStop}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* FSSAI Indian Veg Badge or Category */}
                    {stop.badge === 'FSSAI_VEG' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-bold tracking-wider">
                        {/* Authentic FSSAI Green-Square Dot */}
                        <span className="w-2.5 h-2.5 rounded-sm border border-emerald-500 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </span>
                        <span>PURE VEG TIFFIN</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                        {stop.badge}
                      </span>
                    )}

                    <a
                      href={stop.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold active:scale-[0.98] transition"
                    >
                      <span>Map</span>
                      <ExternalLink className="w-3 h-3 text-orange-400" />
                    </a>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {stop.description}
                </p>

                {/* Footer Highlights: Must Order & Budget */}
                <div className="pt-2 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-semibold text-[11px] uppercase">
                      Must-Order:
                    </span>
                    <span className="font-semibold text-amber-300 truncate">
                      {stop.mustOrder}
                    </span>
                  </div>

                  <div className="flex items-center sm:justify-end gap-2">
                    <span className="text-zinc-500 font-semibold text-[11px] uppercase">
                      Estimated Cost:
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {stop.budgetForTwo}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Kaapi Code Editorial Callout */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Coffee className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">
              The 2026 Bengaluru Filter Kaapi Code
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
            <div className="space-y-1">
              <strong className="text-white block font-semibold">1. Always Order "By-Two Coffee"</strong>
              <p className="text-zinc-400">
                If exploring with a friend, ask for "by-two". It divides one steaming dabarah portion into two cups so every sip stays piping hot.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-white block font-semibold">2. The 80:20 Bean Ratio</strong>
              <p className="text-zinc-400">
                True Karnataka filter coffee uses 80% Arabica/Robusta plantation beans and 20% roasted chicory root for viscosity and crema.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-white block font-semibold">3. The 18-Inch Yard Pour</strong>
              <p className="text-zinc-400">
                Cooling the brew is done by pouring it between the stainless tumbler and dabarah from an 18-inch height to froth without diluting.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-white block font-semibold">4. Stainless Tumblers Only</strong>
              <p className="text-zinc-400">
                Never accept paper or plastic cups at a traditional darshini. Stainless steel preserves the heat transfer and aroma.
              </p>
            </div>
          </div>
        </div>

        {/* Directory & Emergency SOS Contacts */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            City Helpline & Transit Protocol
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 font-semibold block text-[10px] uppercase">
                Namma Metro SOS
              </span>
              <p className="font-mono text-zinc-200 font-bold mt-0.5">1800-425-12345</p>
              <span className="text-[10px] text-zinc-500">05:00 AM - 11:30 PM Daily</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 font-semibold block text-[10px] uppercase">
                Bengaluru Police SOS
              </span>
              <p className="font-mono text-zinc-200 font-bold mt-0.5">112</p>
              <span className="text-[10px] text-zinc-500">Toll-free 24/7 across city</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <span className="text-zinc-500 font-semibold block text-[10px] uppercase">
                Auto Meter Protocol
              </span>
              <p className="font-mono text-zinc-200 font-bold mt-0.5">₹30 first 2km</p>
              <span className="text-[10px] text-zinc-500">Use Namma Yatri for zero-surge</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Save This Guide For Your Trip</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Download the offline PDF version for zero-internet access inside basavanagudi streets, or save directly to your phone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="/guides/bengaluru-itinerary-2026.pdf"
              download="bengaluru-itinerary-2026.pdf"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md active:scale-[0.98] transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Offline PDF Guide (9.2 KB)</span>
            </a>

            <a
              href="https://instagram.com/travel_kathegalu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm active:scale-[0.98] transition"
            >
              <span>Follow @travel_kathegalu on Instagram ↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
