export type ProjectCategory = 
  | 'all'
  | 'ai-agents'
  | 'saas-cloud'
  | 'web-experiences'
  | 'business-tools'
  | 'developer-tools'
  | 'experiments';

export type ProjectStatus = 
  | 'all'
  | 'live'
  | 'open-source'
  | 'prototype'
  | 'in-progress'
  | 'archived';

export interface ProjectMetric {
  label: string;
  value: string;
  note?: string;
}

export interface CaseStudyArchitecture {
  frontend?: string;
  backend?: string;
  database?: string;
  payments?: string;
  ai?: string;
  deployment?: string;
}

export interface CaseStudyFeature {
  title: string;
  description: string;
  tag?: string;
}

export interface ProjectCaseStudy {
  overview: string;
  problem: string;
  targetAudience: string;
  solution: string;
  myRole: string;
  architecture: CaseStudyArchitecture;
  keyFeatures: CaseStudyFeature[];
  engineeringDecisions: string[];
  challengesAndLessons: string[];
  metrics?: ProjectMetric[];
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  detailedDescription: string;
  category: Exclude<ProjectCategory, 'all'>;
  categoryLabel: string;
  status: Exclude<ProjectStatus, 'all'>;
  statusLabel: string;
  featured: boolean;
  publicationApproved: boolean; // STRICT publication gating
  rank: number;
  liveUrl?: string;
  demoUrl?: string;
  sourceUrl?: string;
  techStack: string[];
  lastVerified: string;
  badge?: string;
  highlights: string[];
  caseStudy?: ProjectCaseStudy;
  relatedSlugs: string[];
  accentColor?: string;
}

export const CATEGORIES: { id: ProjectCategory; label: string; count?: number }[] = [
  { id: 'all', label: 'All Projects' },
  { id: 'ai-agents', label: 'AI & Agents' },
  { id: 'saas-cloud', label: 'SaaS & Industry OS' },
  { id: 'business-tools', label: 'Business & Tools' },
  { id: 'web-experiences', label: 'Web & Experiences' },
  { id: 'developer-tools', label: 'Developer Tools' },
  { id: 'experiments', label: 'Labs & Experiments' },
];

export const STATUS_OPTIONS: { id: ProjectStatus; label: string }[] = [
  { id: 'all', label: 'All Stages' },
  { id: 'live', label: 'Live' },
  { id: 'open-source', label: 'Open Source' },
  { id: 'prototype', label: 'Prototype' },
  { id: 'in-progress', label: 'In Progress' },
];

export const PROJECTS: Project[] = [
  {
    slug: 'dinepulse',
    name: 'DinePulse · Restaurant & Hospitality OS',
    tagline: 'High-speed 3-click restaurant billing till with table orders, live kitchen screens, and instant UPI settlement.',
    shortDescription: 'Tactile billing till built for busy restaurant rushes. Table orders, kitchen order tickets (KOT), Indian FSSAI veg/non-veg tags, and automated WhatsApp receipts.',
    detailedDescription: 'DinePulse is an enterprise restaurant operating system built as a modern, reliable alternative to legacy desktop POS systems. It combines an ultra-fast billing till featuring Indian FSSAI badges, full Razorpay payment suite with instant UPI QR, live multi-station kitchen display system (KDS), and automated WhatsApp customer receipts.',
    category: 'saas-cloud',
    categoryLabel: 'SaaS & Industry OS',
    status: 'live',
    statusLabel: 'Live Product',
    featured: true,
    publicationApproved: true,
    rank: 1,
    liveUrl: 'https://dineplus.vercel.app/pos',
    sourceUrl: 'https://github.com/manojtyson-37/dinepulse',
    techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Razorpay UPI', 'Gemini AI', 'Serverless'],
    lastVerified: 'October 2026',
    badge: 'Flagship SaaS',
    highlights: [
      'Ultra-Fast 3-Click Daylight Billing Till with Indian FSSAI Veg / Non-Veg badges',
      'Full Razorpay integration: Orders API, Checkout.js, Payment Links & HMAC verification',
      'Built-in WhatsApp AI engine for automated digital bills, table reservations, and cooking alerts',
      'Gemini Hospitality Copilot for voice-to-KOT order entry and menu engineering margin analysis'
    ],
    caseStudy: {
      overview: 'Restaurants lose revenue to slow legacy POS software that crashes during rush hours and relies on clunky local desktop servers. DinePulse was engineered to provide instant cloud reliability and lightning billing speeds.',
      problem: 'Legacy restaurant systems require expensive on-premise Windows hardware, have convoluted navigation requiring 8+ clicks per ticket, lack modern UPI/Razorpay omnichannel flows, and leave kitchen staff out of sync with guest expectations.',
      targetAudience: 'Independent restaurants, multi-outlet dining spaces, cafes, and hospitality operators seeking high throughput and modern guest engagement.',
      solution: 'A 100% serverless, zero-lag Web POS that runs on any tablet or browser. Equipped with instant table quick-switching, split billing, multi-tender settlement (Cash, UPI QR, Razorpay, WhatsApp bill), and automated kitchen expediting.',
      myRole: 'Principal Architect & Full-Stack Engineer — Designed the end-to-end POS UX, built the Next.js 15 App Router architecture, implemented the Razorpay payment pipelines, and integrated the Gemini NLP order parser.',
      architecture: {
        frontend: 'Next.js 15 (App Router), React 19, Tailwind CSS v4, High-Contrast Daylight theme',
        backend: 'Next.js Serverless Edge Routes, Route Handlers for idempotent checkout',
        payments: 'Razorpay Orders API, Webhook HMAC-SHA256 signature verification, UPI Dynamic QR',
        ai: 'Google Gemini 1.5 Flash for natural speech-to-KOT parsing and menu engineering',
        deployment: 'Vercel Serverless Hosting with global edge caching'
      },
      keyFeatures: [
        { title: 'Rapid 3-Click Billing Till', description: 'Table switcher strip with active item indicators, FSSAI compliance badges, and instant discount recalculation.', tag: 'Core POS' },
        { title: 'Live Kitchen Display (KDS)', description: 'Multi-station filtering (Main Kitchen, Tandoor, Bar) with urgency timers (<10m green, >20m red alert).', tag: 'Kitchen' },
        { title: 'WhatsApp Guest Engine', description: 'One-click digital PDF bills dispatched directly to the diner’s WhatsApp phone number with payment receipt.', tag: 'Automation' },
        { title: 'Gemini Voice Copilot', description: 'Transcribes spoken waiter orders into structured dish line items, seat allocations, and preparation modifiers in under 300ms.', tag: 'AI' }
      ],
      engineeringDecisions: [
        'Selected serverless architecture over traditional long-running NestJS daemons to eliminate on-premise hardware failure points.',
        'Adopted High-Contrast Daylight UI tokens to ensure optimal readability on touchscreens under bright restaurant lighting.',
        'Designed idempotent checkout state transitions to prevent duplicate KOT ticket generation during network hiccups.'
      ],
      challengesAndLessons: [
        'Handling concurrent order edits across multiple table tablets required optimistic UI reconciliation with strict server verification.',
        'Fine-tuned the Gemini prompt schema to reliably parse Indian cuisine nicknames and customization requests into standardized inventory SKUs.'
      ],
      metrics: [
        { label: 'Till Speed', value: '3 Clicks', note: 'From item pick to payment prompt' },
        { label: 'Order Processing', value: '<300ms', note: 'AI order transcription latency' },
        { label: 'Uptime Architecture', value: '100%', note: 'Serverless cloud availability' }
      ]
    },
    relatedSlugs: ['silaa-atelier', 'physiocare', 'tysonpe'],
    accentColor: '#FF5200'
  },
  {
    slug: 'tysonchess',
    name: 'Tyson Chess · Interactive AI Chess Coach',
    tagline: 'AI chess mentor that spots your blunders and teaches you how to win in plain English.',
    shortDescription: 'In-browser chess academy featuring 6 calibrated AI sparring bots, live mistake explanations in plain English, and personalized spaced repetition puzzles.',
    detailedDescription: 'Tyson Chess is a web-native chess training application built specifically for players looking to break past intermediate plateaus. Running an intelligent AI engine directly in your browser with zero latency or loading screens, it provides real-time coaching, explains the tactical reasons behind blunders in plain conversational English, and automatically saves mistakes into personalized practice puzzles.',
    category: 'ai-agents',
    categoryLabel: 'AI & Agents',
    status: 'open-source',
    statusLabel: 'Open Source',
    featured: true,
    publicationApproved: true,
    rank: 2,
    sourceUrl: 'https://github.com/manojtyson-37/Tysonchess',
    techStack: ['React', 'TypeScript', 'AI Chess Engine', 'Web Workers', 'PWA', 'Tailwind CSS'],
    lastVerified: 'October 2026',
    badge: 'AI Chess Coach',
    highlights: [
      'Interactive AI chess engine running smoothly inside the browser with zero server lag',
      '6 calibrated human-style bots ranging from Rookie Rae (≈800) to Master Mina (≈1750)',
      'Instant mistake explanation in plain conversational language (hung pieces, missed forks, pins)',
      'Automated spaced repetition engine converting personal blunders into training drills'
    ],
    caseStudy: {
      overview: 'Most chess apps either offer simple raw engine evaluations (+1.4) that confuse amateur players, or lock instructional coaching behind expensive monthly subscriptions. Tyson Chess provides deep, humanized coaching running purely on client hardware.',
      problem: 'Intermediate chess learners plateau because engine scores don’t explain the strategic intuition or immediate hazards of a blunder. Furthermore, players forget their recurring tactical blind spots without systematic review.',
      targetAudience: 'Club players, aspiring tournament competitors, and adult improvers seeking targeted blunder-reduction drills.',
      solution: 'A zero-backend web platform running intelligent chess AI in dedicated web workers. It features a blunder safety net that halts catastrophic moves during casual play and prompts tactical reflection.',
      myRole: 'Creator & Engine Engineer — Compiled and tuned the WebAssembly engine integration, built the custom bot heuristic softmax weighting, and created the spaced repetition blunder scheduler.',
      architecture: {
        frontend: 'React, TypeScript, react-chessboard, Tailwind CSS, Lucide icons',
        backend: 'Zero-backend client architecture with localStorage schema versioning',
        ai: 'Stockfish AI Engine with custom evaluation and coaching wrappers'
      },
      keyFeatures: [
        { title: 'Plain English Tactical Coach', description: 'Replaces raw engine numbers with explicit tactical callouts: "Knight is pinned to the King", "Rook hangs without defenders".', tag: 'Coaching' },
        { title: 'Calibrated Softmax Bots', description: 'Bots simulate human mistake profiles rather than robotic depth cutoffs, making tactical slip-ups characteristic of their Elo band.', tag: 'Engine' },
        { title: 'Personal Mistake Vault', description: 'Automatically captures every blunder made during sparring and converts it into a scheduled puzzle review.', tag: 'Spaced Repetition' },
        { title: 'Repertoire & Trap Trainer', description: '11 annotated master opening repertoires and 12 classic traps with interactive play-and-defend tests.', tag: 'Curriculum' }
      ],
      engineeringDecisions: [
        'Used high-speed web worker multithreading with graceful single-thread fallback for universal device compatibility.',
        'Implemented hash-based routing (`/#/play`) to allow static PWA installation on iOS and Android with zero server routing requirements.'
      ],
      challengesAndLessons: [
        'Balancing bot difficulty required empirical round-robin tournament simulation scripts to verify that rating ordering remained consistent across thousands of games.'
      ],
      metrics: [
        { label: 'Coaching Engine', value: 'Stockfish AI', note: 'Runs in-browser' },
        { label: 'Drill Library', value: '230+ Puzzles', note: 'Mined from bot blunders' },
        { label: 'Backend Cost', value: '$0/mo', note: '100% client execution' }
      ]
    },
    relatedSlugs: ['dinepulse', 'agents-and-skills'],
    accentColor: '#38BDF8'
  },
  {
    slug: 'tysonpe',
    name: 'Tysonpe · Creator Commerce & Checkout Engine',
    tagline: 'High-converting creator storefront, digital course platform, and 1-click Indian UPI checkout.',
    shortDescription: 'Monetization platform for digital educators and course creators. Sell video masterclasses, ebooks, and workshops with instant UPI (GPay/PhonePe), automated GST tax invoices, and anti-piracy video players.',
    detailedDescription: 'Tysonpe is a sovereign creator-commerce and digital products monetization infrastructure engineered specifically for the Indian market. It empowers creators to launch high-conversion storefronts selling video courses, gated communities, webinars, and consultations, with native INR UPI payments, automated GST compliance, and anti-piracy video players.',
    category: 'saas-cloud',
    categoryLabel: 'SaaS & Industry OS',
    status: 'in-progress',
    statusLabel: 'In Active Build',
    featured: true,
    publicationApproved: true,
    rank: 3,
    sourceUrl: 'https://github.com/manojtyson-37/Tysonpe',
    techStack: ['Next.js 15', 'TypeScript', 'Prisma', 'Razorpay API', 'PostgreSQL', 'Tailwind CSS'],
    lastVerified: 'October 2026',
    badge: 'Creator Commerce',
    highlights: [
      'Multi-format course builder supporting drip schedules, video lessons, and interactive quizzes',
      'Idempotent Razorpay payment pipeline with server-side HMAC callback verification',
      'Automated Indian GST tax compliance calculation and printable PDF tax invoices',
      'Learner video player with dynamic user email watermarking to prevent illicit screen recording'
    ],
    caseStudy: {
      overview: 'Indian educators and creators are trapped between exorbitant 30% App Store fees, opaque global platforms that don’t handle Indian GST regulations, and unreliable manual UPI payment confirmations.',
      problem: 'Western creator tools lack native support for UPI intent flows, automated HSN/SAC GST invoicing, and regional pricing tiers. Existing local alternatives suffer from clunky mobile UX and predatory revenue splits.',
      targetAudience: 'Independent course creators, financial educators, technical coaches, and niche digital publishers.',
      solution: 'A high-craft, high-density creator operating platform with instant Razorpay checkout, automated coupon limits, lesson completion tracking, and verified certificate generation.',
      myRole: 'Founder & Full-Stack Architect — Authored the core data model, built the course drip engine, implemented the Razorpay webhook reconciliation, and crafted the editorial fintech interface.',
      architecture: {
        frontend: 'Next.js 15 App Router, Tailwind CSS, Editorial Fintech Token system',
        backend: 'Next.js API Route Handlers with bcrypt session management',
        database: 'Prisma ORM with PostgreSQL / SQLite development parity',
        payments: 'Razorpay Orders API, Payment Links, Idempotent Webhook handlers'
      },
      keyFeatures: [
        { title: 'Editorial Storefront Generator', description: 'Fast, responsive creator pages (`/c/{handle}`) optimized for mobile conversion and zero layout shift.', tag: 'Commerce' },
        { title: 'Interactive Course Player', description: 'Curriculum progress tracking, lesson drip timers, and dynamic learner-email watermarks.', tag: 'LMS' },
        { title: 'Indian GST Engine', description: 'Automatic separation of base price and GST component, outputting downloadable compliant tax invoices.', tag: 'Fintech' },
        { title: 'Creator Revenue Ledger', description: 'Real-time financial telemetry showing 14-day cash flow, order breakdowns, and refund controls.', tag: 'Analytics' }
      ],
      engineeringDecisions: [
        'Stuck to integer paise representation across all database fields to eliminate JavaScript floating-point rounding errors in financial transactions.',
        'Separated webhook processing from synchronous checkout callbacks to handle edge-case network dropouts without stranding learner enrollments.'
      ],
      challengesAndLessons: [
        'Implementing tamper-proof course completion certificates required server-rendered SVG generation with cryptographic verification hashes.'
      ],
      metrics: [
        { label: 'Product Types', value: '5 Formats', note: 'Courses, workshops, downloads' },
        { label: 'Payment Flow', value: 'HMAC-SHA256', note: 'Strict server validation' }
      ]
    },
    relatedSlugs: ['dinepulse', 'silaa-atelier', 'kbd-books'],
    accentColor: '#8B5CF6'
  },
  {
    slug: 'silaa-atelier',
    name: 'Silaa Atelier · Apparel Manufacturing & Operations ERP',
    tagline: 'Production operations platform and fabric inventory system built for garment manufacturers.',
    shortDescription: 'Production order tracking, fabric roll inventory, pattern cutting yield calculators, and factory cost management in one clean operational dashboard.',
    detailedDescription: 'Silaa Atelier is a specialized apparel operations platform designed to eliminate disjointed spreadsheets and WhatsApp chains in garment manufacturing. Built with a high-performance FastAPI backend and Next.js frontend, it coordinates fabric roll inventory, cut-make-trim (CMT) purchase orders, accessory BOMs, and garment cost accounting.',
    category: 'saas-cloud',
    categoryLabel: 'SaaS & Industry OS',
    status: 'live',
    statusLabel: 'Live Production',
    featured: true,
    publicationApproved: true,
    rank: 4,
    liveUrl: 'https://erp.silacollective.in/',
    sourceUrl: 'https://github.com/manojtyson-37/Silaa',
    techStack: ['FastAPI', 'Next.js 16', 'SQLAlchemy', 'Supabase Postgres', 'Tailwind CSS', 'Alembic'],
    lastVerified: 'October 2026',
    badge: 'Manufacturing ERP',
    highlights: [
      'Full lifecycle garment tracking from fabric procurement to final warehouse QC packing',
      'Fabric roll batch ledger tracking shrinkage rates, lot numbers, and yield calculations',
      'Supplier purchase orders with multi-tier approval workflows and accessory bill of materials',
      'High-throughput FastAPI backend integrated with Supabase Postgres and session pooling'
    ],
    caseStudy: {
      overview: 'Garment manufacturing is notorious for costly production leaks caused by untracked fabric wastage, missing accessories during stitching runs, and delayed order handoffs.',
      problem: 'Factories manage tens of thousands of meters of fabric across dozens of colorways using physical paper chits and chaotic WhatsApp messages, leading to massive stock discrepancies and delayed fashion drops.',
      targetAudience: 'Fashion labels, boutique garment manufacturers, and apparel production coordinators.',
      solution: 'A modern, tactile operations portal that brings precision inventory tracking, automated cost calculations, and visual order pipeline kanbans to the factory floor.',
      myRole: 'Lead Architect & Systems Engineer — Designed the relational database schema for fabric yield tracking, built the FastAPI REST microservices, and developed the Next.js production management UI.',
      architecture: {
        frontend: 'Next.js 16 (App Router), TypeScript, Tailwind CSS, Optimized Daylight theme',
        backend: 'FastAPI (Python 3.9), SQLAlchemy ORM, Alembic migrations',
        database: 'Supabase Postgres with Session connection pooling',
        deployment: 'Vercel frontend with custom-domain DuckDNS backend gateway'
      },
      keyFeatures: [
        { title: 'Fabric Roll Inventory', description: 'Tracks roll meterage, supplier dye lots, GSM specs, and post-cut remnant yardage in real time.', tag: 'Inventory' },
        { title: 'Production Order Pipeline', description: 'Step-by-step garment stage tracking: Cutting → Embroidery → Stitching → Washing → Final QC.', tag: 'Operations' },
        { title: 'Accessories & Trims BOM', description: 'Calculates exact button, zipper, thread, and label requirements based on size-ratio production quotas.', tag: 'Costing' },
        { title: 'Factory Expense Ledger', description: 'Captures daily labor costs, machine maintenance, and operational overheads against specific production batches.', tag: 'Finance' }
      ],
      engineeringDecisions: [
        'Enforced a strict daylight light-mode UI for the operations interface, as factory floor tablets operate under harsh industrial fluorescent lighting where dark mode suffers from heavy screen reflection.',
        'Separated API authentication into stateless HMAC tokens with 12-hour expiration for security without session bloat.'
      ],
      challengesAndLessons: [
        'Accommodating fabric shrinkage variations required building custom unit-of-measurement converters into the cutting order creation form.'
      ],
      metrics: [
        { label: 'Inventory Accuracy', value: '99.4%', note: 'Fabric meterage reconciliation' },
        { label: 'API Response', value: '<45ms', note: 'FastAPI session pooled queries' }
      ]
    },
    relatedSlugs: ['dinepulse', 'echora', 'nexify-dashboard'],
    accentColor: '#10B981'
  },
  {
    slug: 'physiocare',
    name: 'PhysioCare · Multi-Tenant Clinic OS',
    tagline: 'All-in-one clinic software for physical therapy practices, patient rehab, and billing.',
    shortDescription: 'Multi-tenant healthcare management system for patient rehabilitation records, doctor scheduling, Indian GST tax invoices, and automated WhatsApp appointment reminders.',
    detailedDescription: 'PhysioCare is an all-in-one clinic management platform built specifically for physical therapy and rehabilitation centers. It streamlines the clinical workflow by connecting patient booking, physical assessment charts, multi-therapist calendar scheduling, GST-compliant invoicing, and automated patient recall notifications.',
    category: 'saas-cloud',
    categoryLabel: 'SaaS & Industry OS',
    status: 'live',
    statusLabel: 'Live Product',
    featured: true,
    publicationApproved: true,
    rank: 5,
    liveUrl: 'https://saas-physio.vercel.app',
    sourceUrl: 'https://github.com/manojtyson-37/SAAS-Physio',
    techStack: ['Next.js', 'Prisma', 'Neon Postgres', 'Tailwind CSS', 'TypeScript', 'Vercel'],
    lastVerified: 'October 2026',
    badge: 'Healthcare SaaS',
    highlights: [
      'Multi-tenant architecture isolating clinical data across independent clinic accounts',
      'Dynamic appointment booking calendar with therapist availability and room management',
      'Electronic medical record (EMR) treatment charting with diagnosis and progress timelines',
      'Integrated Indian GST billing engine with patient payment tracking and receipt printing'
    ],
    caseStudy: {
      overview: 'Physiotherapy clinics often juggle fragmented tools — paper patient cards, generic Google Calendars, and separate desktop accounting software — leading to missed follow-ups and lost billing.',
      problem: 'Generic clinic software is tailored for general practitioners and lacks support for physical therapy treatment cycles, multi-session packages, and specialized ergonomic evaluation notes.',
      targetAudience: 'Physical therapy practices, sports medicine clinics, and rehabilitation doctors.',
      solution: 'A unified cloud operating system designed around therapy care cycles, package balances, multi-practitioner schedules, and automated patient appointment reminders.',
      myRole: 'Full-Stack Developer & Designer — Engineered the multi-tenant Prisma data layer, built the calendar scheduling interface, and configured the Neon serverless PostgreSQL pipeline.',
      architecture: {
        frontend: 'Next.js App Router, React, Tailwind CSS, Lucide Icons',
        backend: 'Next.js Route Handlers, JWT-based authentication with clinic scope',
        database: 'Neon Serverless Postgres with Prisma ORM and connection pooling',
        deployment: 'Vercel Serverless Platform'
      },
      keyFeatures: [
        { title: 'Therapist Schedule Grid', description: 'Drag-and-drop appointment scheduling with room allocation and double-booking prevention.', tag: 'Scheduling' },
        { title: 'Treatment Course Tracker', description: 'Monitors prescribed therapy session packs, attendance logs, and clinical improvement metrics.', tag: 'EMR' },
        { title: 'Automated GST Billing', description: 'Generates clinic-branded tax invoices with itemized therapy modalities and payment status indicators.', tag: 'Billing' },
        { title: 'Clinic Analytics Hub', description: 'Tracks patient retention rates, therapist utilization percentages, and monthly revenue trends.', tag: 'Reports' }
      ],
      engineeringDecisions: [
        'Utilized Neon connection poolers to prevent connection exhaustion in serverless edge environments during concurrent morning staff sign-ins.',
        'Modeled therapy packages as decrementing ledger credits linked to clinical notes for clear auditability.'
      ],
      challengesAndLessons: [
        'Structuring multi-tenant data isolation required robust middleware validation to guarantee zero cross-tenant record leakage.'
      ],
      metrics: [
        { label: 'Architecture', value: 'Multi-Tenant', note: 'Isolated clinic schemas' },
        { label: 'Database', value: 'Neon Serverless', note: 'Auto-scaling PostgreSQL' }
      ]
    },
    relatedSlugs: ['dinepulse', 'nexify-dashboard', 'kbd-books'],
    accentColor: '#0EA5E9'
  },
  {
    slug: 'agents-and-skills',
    name: 'Chief of Staff AI · Autonomous Multi-Agent Framework',
    tagline: 'Autonomous AI engineering team for research, coding, testing, and operations that works with zero hallucination.',
    shortDescription: 'Multi-agent orchestration system pairing reusable workflow skills with specialized personas (orchestrator, engineer, reviewer) for autonomous 24/7 execution.',
    detailedDescription: 'The Chief of Staff AI Framework is a production-grade multi-agent coordination architecture designed to execute complex engineering workflows with high accountability. It formalizes development into modular, reusable skills routed to dedicated personas (orchestrator, engineer, code-reviewer, test-engineer), paired with token compression for 70%+ efficiency.',
    category: 'ai-agents',
    categoryLabel: 'AI & Agents',
    status: 'open-source',
    statusLabel: 'Open Source',
    featured: true,
    publicationApproved: true,
    rank: 6,
    sourceUrl: 'https://github.com/manojtyson-37/Agents-and-Skills',
    techStack: ['Python', 'Node.js', 'Autonomous Agents', 'Git Hooks', 'Token Optimization'],
    lastVerified: 'October 2026',
    badge: 'Autonomous AI',
    highlights: [
      'Intent-based routing directing ambiguous user prompts to atomic, test-driven execution workflows',
      'Separation of concerns between workflows (Skills) and role execution (Personas)',
      'Headroom token compression reducing agent conversation overhead by 60–90% without losing context',
      'Built-in verification gates requiring test-engineer and code-reviewer validation before merge'
    ],
    caseStudy: {
      overview: 'Standard AI coding assistants suffer from hallucinations, lost instructions over long conversations, and massive token costs when working on complex multi-step codebases.',
      problem: 'Single-agent LLMs attempt to plan, code, test, and review simultaneously, leading to sloppy regressions, skipped unit tests, and conversational context exhaustion.',
      targetAudience: 'AI engineers, autonomous agent developers, and teams building production LLM developer tools.',
      solution: 'A structured persona and skill hierarchy where an Orchestrator deconstructs goals into atomic tasks, an Engineer writes test-first code, and a Code Reviewer enforces strict quality gates before completion.',
      myRole: 'System Architect & Author — Created the skill and persona specifications, authored the execution contracts, and integrated Headroom cache compression.',
      architecture: {
        frontend: 'CLI tools, JSONL state machine, Markdown operational runbooks',
        backend: 'Python subagent coordinator and intent mapping engine',
        ai: 'Multi-model LLM abstraction compatible with Claude 3.7/Sonnet, Gemini 2.5, and OpenAI'
      },
      keyFeatures: [
        { title: 'Incremental Implementation', description: 'Enforces strict test-driven development: write failing test, write code to pass, commit atomically.', tag: 'Workflow' },
        { title: 'Autonomous Quality Gates', description: 'Dedicated code-reviewer and test-engineer personas block merges until all lint and coverage criteria pass.', tag: 'Verification' },
        { title: 'Headroom Token Compression', description: 'Compresses verbose subagent execution transcripts while preserving full semantic retrieval capability.', tag: 'Tokens' }
      ],
      engineeringDecisions: [
        'Designed skills as human-readable Markdown files so developers can inspect and refine agent instructions using standard git version control.',
        'Isolated persona responsibilities to eliminate self-review bias in autonomous code creation.'
      ],
      challengesAndLessons: [
        'Preventing agent looping required strict state transition timeouts and unambiguous exit criteria in each skill definition.'
      ],
      metrics: [
        { label: 'Token Reduction', value: '60–90%', note: 'Via Headroom compression' },
        { label: 'Workflow Roles', value: '12 Personas', note: 'Specialized agent agents' }
      ]
    },
    relatedSlugs: ['tysonchess', 'youtube-automation'],
    accentColor: '#A855F7'
  },
  {
    slug: 'echora',
    name: 'ECHORA · High-Craft Ethnic Wear E-Commerce',
    tagline: 'Minimalist, luxury ethnic wear digital storefront engineered for instant loading.',
    shortDescription: 'Zero-framework, high-speed brand storefront with WhatsApp checkout, curated collection lookbooks, and mobile-first typography.',
    detailedDescription: 'ECHORA is an online fashion boutique destination created for contemporary Indian ethnic wear. Built without heavy client-side frameworks to ensure lightning-fast performance even on mobile networks, it combines champagne and deep burgundy aesthetics with direct WhatsApp ordering and high-definition lookbooks.',
    category: 'web-experiences',
    categoryLabel: 'Web & Experiences',
    status: 'live',
    statusLabel: 'Live Production',
    featured: false,
    publicationApproved: true,
    rank: 7,
    liveUrl: 'https://echora-official.vercel.app/?v=1.9',
    sourceUrl: 'https://github.com/kbdcreditsolutions/echora',
    techStack: ['HTML5', 'Modern CSS', 'Vanilla JavaScript', 'WhatsApp Business API'],
    lastVerified: 'October 2026',
    highlights: [
      'Zero build-step architecture delivering near-instant sub-second First Contentful Paint',
      'Mobile-optimized product catalogue with high-density image zoom and size selection',
      '1-click WhatsApp order generation pre-filling selected outfit SKU, size, and customer details'
    ],
    relatedSlugs: ['silaa-atelier', 'pooja-portfolio'],
    accentColor: '#E8D5BC'
  },
  {
    slug: 'nexify-dashboard',
    name: 'Nexify Operations & Finance Telemetry',
    tagline: 'Internal enterprise dashboard unifying hours, clients, projects, and cash flow.',
    shortDescription: 'Normalized operations and financial intelligence platform for IT agencies, deriving live profit and runway from underlying project records.',
    detailedDescription: 'Nexify Dashboard is an internal operational command center for IT services companies. It normalizes data across employees, logged project hours, client retainer contracts, and expenses, calculating real-time gross margins, billable utilization, and cash runway without manual spreadsheet updates.',
    category: 'business-tools',
    categoryLabel: 'Business & Tools',
    status: 'live',
    statusLabel: 'Live Product',
    featured: false,
    publicationApproved: true,
    rank: 8,
    liveUrl: 'https://nexify-dashboard.vercel.app',
    sourceUrl: 'https://github.com/manojtyson-37/nexifydashboard',
    techStack: ['Next.js 16', 'Prisma 6', 'Neon Postgres', 'NextAuth v5', 'Recharts', 'TanStack Table'],
    lastVerified: 'October 2026',
    highlights: [
      'Role-based access control supporting Owner, Finance, Operations, and Manager views',
      'Dynamic financial forecasting calculating monthly burn rate and runway from live employee timesheets',
      'Interactive TanStack data tables with multi-column sorting, filtering, and CSV export'
    ],
    relatedSlugs: ['physiocare', 'kbd-books', 'expense-manager'],
    accentColor: '#3B82F6'
  },
  {
    slug: 'kbd-books',
    name: 'KBD Books · Indian GST Accounting & Invoicing',
    tagline: 'Complete accounting and GST tax billing engine built for Indian SMBs.',
    shortDescription: 'Tax invoice generator with automated CGST/SGST vs IGST calculation, HSN summaries, and 1-click clean A4 PDF printing.',
    detailedDescription: 'KBD Books is an accounting and GST billing system tailored to the operational realities of Indian businesses. It handles automated tax classification based on supplier and customer GSTINs, calculates inter-state vs intra-state levies, tracks input tax credit (ITC), and outputs clean, printable A4 tax invoices with Indian number formatting.',
    category: 'business-tools',
    categoryLabel: 'Business & Tools',
    status: 'prototype',
    statusLabel: 'Prototype',
    featured: false,
    publicationApproved: true,
    rank: 9,
    sourceUrl: 'https://github.com/manojtyson-37/Accounting-Module',
    techStack: ['Next.js', 'Supabase Postgres', 'Vercel Serverless', 'PDF Generation', 'GST Rules Engine'],
    lastVerified: 'October 2026',
    highlights: [
      'Automatic place-of-supply tax determination (CGST + SGST vs IGST) from customer GSTIN state codes',
      'Clean browser-based A4 print stylesheet formatting invoices perfectly without external PDF bloat',
      'Financial year invoice numbering (e.g., KBD/26-27/0012) and amount-in-words conversion in lakhs and crores'
    ],
    relatedSlugs: ['dinepulse', 'tysonpe', 'nexify-dashboard'],
    accentColor: '#F59E0B'
  },
  {
    slug: 'expense-manager',
    name: 'Expense Manager PWA · Offline-First Personal Finance',
    tagline: 'Tactile, local-first expense tracker with bank SMS parsing and Supabase cloud sync.',
    shortDescription: 'Offline-first personal finance app built with React 19, Dexie IndexedDB, loan amortization calculators, and automatic SMS transaction parsing.',
    detailedDescription: 'Expense Manager is an offline-first personal accounting application built for high-speed tracking on mobile and desktop. Utilizing Dexie.js for client-side IndexedDB persistence and Supabase for background encrypted sync, it allows users to log transactions instantly without waiting for network connectivity.',
    category: 'business-tools',
    categoryLabel: 'Business & Tools',
    status: 'live',
    statusLabel: 'Live Product',
    featured: false,
    publicationApproved: true,
    rank: 10,
    sourceUrl: 'https://github.com/manojtyson-37/Expense-Manager',
    techStack: ['React 19', 'TypeScript', 'Vite', 'Dexie.js (IndexedDB)', 'Supabase Sync', 'Capacitor', 'Tailwind CSS'],
    lastVerified: 'October 2026',
    highlights: [
      'Instant zero-latency writes to local IndexedDB with background optimistic server synchronization',
      'Bank transaction SMS parser translating notification strings into categorized budget line items',
      'Comprehensive financial tools: Loan EMI calculators, recurring subscriptions, and monthly category limits'
    ],
    relatedSlugs: ['kbd-books', 'nexify-dashboard'],
    accentColor: '#10B981'
  },
  {
    slug: 'reviewassist-ai',
    name: 'ReviewAssist AI · Google Reviews Reputation Engine',
    tagline: 'AI-assisted reputation management converting positive feedback into Google reviews.',
    shortDescription: 'Frictionless customer review collection SaaS using LLMs to draft personalized reviews while complying strictly with FTC & Google policies.',
    detailedDescription: 'ReviewAssist AI is a customer reputation platform that helps local businesses accumulate authentic Google Reviews. Using quick feedback prompts, the AI assists guests in articulating their positive experiences into natural, high-quality review drafts that they can post with a single tap, avoiding prohibited review-gating techniques.',
    category: 'ai-agents',
    categoryLabel: 'AI & Agents',
    status: 'prototype',
    statusLabel: 'Prototype',
    featured: false,
    publicationApproved: true,
    rank: 11,
    sourceUrl: 'https://github.com/manojtyson-37/AI-Review-Management',
    techStack: ['Next.js', 'NestJS', 'OpenAI API (GPT-4o-mini)', 'PostgreSQL', 'Prisma', 'BullMQ'],
    lastVerified: 'October 2026',
    highlights: [
      'Compliant feedback flow adhering strictly to FTC guidelines and Google anti-incentivization rules',
      'GPT-4o-mini powered review drafter transforming 3-word keywords into polished customer reflections',
      'Automated sentiment categorization and negative feedback escalation to management'
    ],
    relatedSlugs: ['dinepulse', 'agents-and-skills'],
    accentColor: '#EC4899'
  },
  {
    slug: 'jayamahal-palace',
    name: 'Jaya Mahal Palace · Heritage Hotel Booking Platform',
    tagline: 'Immersive heritage hotel website, reservation engine, and room inventory manager.',
    shortDescription: 'Cinematic hospitality portal with live availability calendar, 30-minute pending holds, Razorpay payments, and admin room manager.',
    detailedDescription: 'Jaya Mahal Palace is a digital hospitality platform built for luxury heritage properties. It features a video-driven brand experience, a transactional room reservation engine that prevents overselling via temporary inventory holds, signature-verified Razorpay payments, and a private admin suite for managing rates and room photography.',
    category: 'web-experiences',
    categoryLabel: 'Web & Experiences',
    status: 'prototype',
    statusLabel: 'Prototype',
    featured: false,
    publicationApproved: true,
    rank: 12,
    sourceUrl: 'https://github.com/manojtyson-37/Jaymahal-Palace-',
    techStack: ['Next.js 14', 'Prisma', 'Tailwind CSS', 'Razorpay API', 'Framer Motion', 'JWT Auth'],
    lastVerified: 'October 2026',
    highlights: [
      'Cinematic scroll-driven visual hero with reduced-motion accessibility accommodations',
      'Transaction-guarded room booking with 30-minute reservation holds to prevent overselling',
      'Admin portal for adjusting seasonal room tariffs, blackout dates, and guest arrivals'
    ],
    relatedSlugs: ['dinepulse', 'echora'],
    accentColor: '#D97706'
  },
  {
    slug: 'youtube-automation',
    name: 'AI YouTube Production Pipeline · 7-Agent Video Engine',
    tagline: 'Autonomous multi-agent pipeline generating research, scripts, voiceover, and visual cues.',
    shortDescription: 'End-to-end video creation pipeline coordinating 7 specialized AI agents to take a topic from raw concept to scripted, voiced production plan.',
    detailedDescription: 'The AI YouTube Production Pipeline is a multi-agent automation system designed to eliminate creative friction in video production. It chains specialized agents together: niche researcher, competitor analyst, scriptwriter, voice director (ElevenLabs), visual B-roll planner, thumbnail prompt engineer, and SEO metadata optimizer.',
    category: 'ai-agents',
    categoryLabel: 'AI & Agents',
    status: 'prototype',
    statusLabel: 'Prototype Tool',
    featured: false,
    publicationApproved: true,
    rank: 13,
    techStack: ['Python 3.9+', 'Claude API', 'ElevenLabs API', 'DALL-E 3', 'YouTube Data API'],
    lastVerified: 'October 2026',
    highlights: [
      'Chained agent pipeline generating complete 10-minute video production plans from a single topic query',
      'Automated competitor hook analysis extracting viral opening patterns across target niches',
      'Direct ElevenLabs voice synthesis integration with tailored pacing and emphasis markers'
    ],
    relatedSlugs: ['agents-and-skills', 'reviewassist-ai'],
    accentColor: '#EF4444'
  },
  {
    slug: 'whatsapp-saas-gateway',
    name: 'Interakt WhatsApp SaaS Gateway · API Toolkit',
    tagline: 'Dual-mode WhatsApp Business API integration toolkit for modern SaaS products.',
    shortDescription: 'Modular Node.js and React toolkit enabling SaaS apps to trigger automated WhatsApp campaigns while preserving human customer support inboxes.',
    detailedDescription: 'The Interakt WhatsApp SaaS Gateway provides a clean, secure proxy layer for connecting web applications to the WhatsApp Business API. It uses a hybrid model where transactional campaign templates (order updates, verification alerts) are triggered programmatically via backend microservices, while inbound customer messages flow seamlessly into shared human agent inboxes.',
    category: 'developer-tools',
    categoryLabel: 'Developer Tools',
    status: 'open-source',
    statusLabel: 'Open Source',
    featured: false,
    publicationApproved: true,
    rank: 14,
    sourceUrl: 'https://github.com/manojtyson-37/Whatsapp-Integrations',
    techStack: ['Node.js', 'Express', 'React', 'Vite', 'Interakt WhatsApp API', 'Tailwind CSS'],
    lastVerified: 'October 2026',
    highlights: [
      'Secure proxy backend hiding API credentials and verifying incoming delivery webhooks (Sent, Delivered, Read)',
      'Embeddable React campaign widget (`WhatsAppCampaignWidget`) for drop-in deployment in any dashboard',
      'Standardized user contact synchronization mapping SaaS customer IDs to WhatsApp phone profiles'
    ],
    relatedSlugs: ['dinepulse', 'agents-and-skills'],
    accentColor: '#22C55E'
  },
  {
    slug: 'pooja-portfolio',
    name: 'Pooja Shekar · Architectural Design Portfolio',
    tagline: 'Minimalist, high-performance portfolio for a senior product designer.',
    shortDescription: 'Next.js 15 product designer portfolio featuring interactive archetype cards, structured multi-phase case studies, and static pre-rendering.',
    detailedDescription: 'The Pooja Shekar Portfolio is a showcase of editorial digital design. Built on Next.js 15 App Router with full static generation, it features a bespoke design system, interactive 3D archetype flip cards, and an extensive case-study rendering engine supporting comparative design walkthroughs.',
    category: 'web-experiences',
    categoryLabel: 'Web & Experiences',
    status: 'live',
    statusLabel: 'Live Production',
    featured: false,
    publicationApproved: true,
    rank: 15,
    sourceUrl: 'https://github.com/manojtyson-37/pooja-portfolio',
    techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion', 'Static Site Generation'],
    lastVerified: 'October 2026',
    highlights: [
      '100% statically generated pages achieving perfect 100 Lighthouse performance metrics',
      'Modular case-study layout engine supporting 12 polymorphic block types (prose, stats, journey, comparisons)',
      'Editorial typography and micro-interactions optimized for hiring managers and design leaders'
    ],
    relatedSlugs: ['echora', 'jayamahal-palace'],
    accentColor: '#F43F5E'
  },
  {
    slug: 'kusum-dental-care',
    name: 'Kusum Dental Care · Clinical Operating System',
    tagline: 'Full-stack patient booking, EHR records, and dental clinic management engine.',
    shortDescription: 'Modern dental healthcare portal with multilingual patient self-service (English/Kannada), Fastify & Supabase backend, real-time appointment slot holding, and walk-in scheduling.',
    detailedDescription: 'Kusum Dental Care is an end-to-end clinical management application built for high-touch healthcare practices. It combines a patient-facing multilingual booking portal with an administrative dashboard for appointment management, treatment record archiving, walk-in scheduling, and automated WhatsApp patient reminders.',
    category: 'saas-cloud',
    categoryLabel: 'SaaS & Industry OS',
    status: 'live',
    statusLabel: 'Live Production',
    featured: false,
    publicationApproved: true,
    rank: 16,
    sourceUrl: 'https://github.com/manojtyson-37/kusum-dental-care',
    techStack: ['React 19', 'Fastify', 'Supabase Postgres', 'Tailwind CSS', 'Vite', 'TypeScript'],
    lastVerified: 'October 2026',
    highlights: [
      'Multilingual English & Kannada booking engine with automated patient consent verification',
      'Real-time appointment slot locking preventing concurrent overbooking during clinical consultations',
      'Comprehensive treatment invoice and EHR history tracking with secure Supabase Row Level Security (RLS)'
    ],
    relatedSlugs: ['physiocare', 'kbd-books', 'dinepulse'],
    accentColor: '#0EA5E9'
  }
];

export function getApprovedProjects(): Project[] {
  return PROJECTS.filter(p => p.publicationApproved);
}

export function getFeaturedProjects(): Project[] {
  return getApprovedProjects()
    .filter(p => p.featured)
    .sort((a, b) => a.rank - b.rank);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getApprovedProjects().find(p => p.slug === slug);
}

export function getRelatedProjects(slug: string, limit = 3): Project[] {
  const current = getProjectBySlug(slug);
  if (!current) return [];
  
  const relatedBySlug = current.relatedSlugs
    .map(s => getProjectBySlug(s))
    .filter((p): p is Project => p !== undefined);

  if (relatedBySlug.length >= limit) {
    return relatedBySlug.slice(0, limit);
  }

  const otherInCategory = getApprovedProjects().filter(
    p => p.slug !== slug && p.category === current.category && !relatedBySlug.some(r => r.slug === p.slug)
  );

  return [...relatedBySlug, ...otherInCategory].slice(0, limit);
}
