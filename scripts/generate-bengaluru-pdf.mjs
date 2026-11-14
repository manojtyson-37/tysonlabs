import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/₹/g, 'INR ')
    .replace(/•/g, '-')
    .replace(/·/g, '|')
    .replace(/—/g, '--')
    .replace(/[–]/g, '-')
    .replace(/’|‘/g, "'")
    .replace(/“|”/g, '"')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function generateBengaluruPDF() {
  const pdfDoc = await PDFDocument.create();

  // Embed standard Helvetica fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palettes (Tactile, high-contrast, editorial)
  const cBlack = rgb(0.06, 0.06, 0.08); // #0F0F14
  const cDark = rgb(0.12, 0.12, 0.15); // #1E1E24
  const cMuted = rgb(0.42, 0.44, 0.50); // #6B7280
  const cLight = rgb(0.96, 0.97, 0.98); // #F4F6F8
  const cWhite = rgb(1, 1, 1);
  const cBorder = rgb(0.85, 0.87, 0.90);
  const cOrange = rgb(0.98, 0.35, 0.08); // Bangalore terracotta orange #FA5914
  const cGreen = rgb(0.08, 0.60, 0.28); // FSSAI Veg Green #16A34A
  const cNavy = rgb(0.08, 0.18, 0.36); // Majestic Metro Navy #152E5C

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89; // A4
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Helper for drawing safe text
  function drawSafeText(page, text, options) {
    const sanitized = cleanText(text);
    page.drawText(sanitized, options);
  }

  // Helper for adding header & footer
  function decoratePage(page, pageNum, totalPages) {
    page.drawRectangle({
      x: margin,
      y: pageHeight - 35,
      width: contentWidth,
      height: 2,
      color: cOrange,
    });

    drawSafeText(page, 'TRAVEL KATHEGALU | BENGALURU ITINERARY 2026', {
      x: margin,
      y: pageHeight - 28,
      size: 8,
      font: fontBold,
      color: cMuted,
    });

    drawSafeText(page, '@travel_kathegalu | Verified Creator Guide', {
      x: pageWidth - margin - 170,
      y: pageHeight - 28,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });

    page.drawRectangle({
      x: margin,
      y: 35,
      width: contentWidth,
      height: 1,
      color: cBorder,
    });

    drawSafeText(page, 'TysonLabs Creator Infrastructure | tysonlabs.in', {
      x: margin,
      y: 22,
      size: 7.5,
      font: fontRegular,
      color: cMuted,
    });

    drawSafeText(page, `Page ${pageNum} of ${totalPages}`, {
      x: pageWidth - margin - 50,
      y: 22,
      size: 7.5,
      font: fontBold,
      color: cMuted,
    });
  }

  // ==========================================
  // PAGE 1: COVER & DAY 1 (OLD BENGALURU & TIFFINS)
  // ==========================================
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);

  // Hero Card Background
  page1.drawRectangle({
    x: margin,
    y: pageHeight - 170,
    width: contentWidth,
    height: 120,
    color: cDark,
  });

  drawSafeText(page1, 'THE DEFINITIVE 3-DAY BENGALURU GUIDE', {
    x: margin + 18,
    y: pageHeight - 85,
    size: 18,
    font: fontBold,
    color: cWhite,
  });

  drawSafeText(page1, 'Curated Heritage Walks, Legendary Tiffin Houses, Green Canopies & Evening Brews', {
    x: margin + 18,
    y: pageHeight - 105,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.85, 0.87, 0.90),
  });

  page1.drawRectangle({
    x: margin + 18,
    y: pageHeight - 150,
    width: 260,
    height: 24,
    color: rgb(0.18, 0.18, 0.22),
  });

  drawSafeText(page1, 'Curated by Travel Kathegalu (@travel_kathegalu)', {
    x: margin + 26,
    y: pageHeight - 143,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 0.85, 0.5),
  });

  drawSafeText(page1, 'EDITION: 2026 OFFICIAL | OFFLINE PDF GUIDE', {
    x: pageWidth - margin - 180,
    y: pageHeight - 143,
    size: 7.5,
    font: fontBold,
    color: rgb(0.7, 0.7, 0.75),
  });

  // Transit & Practical Protocol Box
  let y = pageHeight - 185;
  page1.drawRectangle({
    x: margin,
    y: y - 55,
    width: contentWidth,
    height: 55,
    color: cLight,
    borderColor: cBorder,
    borderWidth: 1,
  });

  drawSafeText(page1, 'TRANSIT & TIMING PROTOCOL', {
    x: margin + 12,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: cNavy,
  });

  drawSafeText(page1, '- Namma Metro: Use Purple & Green Lines. Majestic (Kempegowda) is the interchange junction.', {
    x: margin + 12,
    y: y - 29,
    size: 8,
    font: fontRegular,
    color: cDark,
  });

  drawSafeText(page1, '- Tiffin Golden Hour: 6:30 AM to 9:30 AM for steaming hot Masale Dosa batches and fresh filter coffee.', {
    x: margin + 12,
    y: y - 41,
    size: 8,
    font: fontRegular,
    color: cDark,
  });

  // Section Header: Day 1
  y -= 80;
  drawSafeText(page1, 'DAY 1: OLD BENGALURU & LEGENDARY SOUTH TIFFINS', {
    x: margin,
    y: y,
    size: 13,
    font: fontBold,
    color: cOrange,
  });

  drawSafeText(page1, 'Zone: Basavanagudi, Gandhi Bazaar & Lalbagh | Transit: Namma Metro Green Line', {
    x: margin,
    y: y - 14,
    size: 8.5,
    font: fontOblique,
    color: cMuted,
  });

  const day1Stops = [
    {
      time: '07:00 AM',
      name: 'Vidyarthi Bhavan (Est. 1943)',
      locality: 'Gandhi Bazaar, Basavanagudi',
      badge: 'FSSAI VEG',
      mustTry: 'Crispy Ghee Masale Dosa + Thick Kaapi',
      desc: 'Historic institution where Bengaluru artists, writers, and thinkers meet. Watch the iconic waiters stack 20 plates of ghee dosa on their forearms.',
      budget: 'INR 140 for two',
    },
    {
      time: '09:00 AM',
      name: 'Bugle Rock & Bull Temple (Dodda Basavana Gudi)',
      locality: 'Bull Temple Road',
      badge: 'HERITAGE',
      mustTry: 'Dodda Ganesha darshan & ancient 3-billion-year-old rock walk',
      desc: 'Colossal monolith Nandi carved from a single granite boulder in 1537 by Kempe Gowda. Stroll through the tranquil, breezy canopy of Bugle Rock.',
      budget: 'Free Entry',
    },
    {
      time: '11:00 AM',
      name: "Brahmin's Coffee Bar",
      locality: 'Ranka Colony, Shankarpuram',
      badge: 'FSSAI VEG',
      mustTry: 'Piping hot Thatte Idli with unbounded mint-coconut chutney',
      desc: 'Zero seating, standing pavement culture at its finest. No sambar served here--just silky idlis and crispy vadas drenched in fresh, aromatic coconut chutney.',
      budget: 'INR 80 for two',
    },
    {
      time: '02:00 PM',
      name: 'Lalbagh Botanical Garden & 1889 Glass House',
      locality: 'Lalbagh West Gate',
      badge: 'NATURE',
      mustTry: 'Walk the shaded lakeside trail & 200-year-old cotton silk tree',
      desc: '240 acres commissioned by Hyder Ali. The Glass House was modeled after London Crystal Palace. Perfect afternoon respite under centuries-old canopies.',
      budget: 'INR 30 entry',
    },
    {
      time: '05:30 PM',
      name: 'Mavalli Tiffin Room (MTR - Original Branch)',
      locality: 'Lalbagh Road (Est. 1924)',
      badge: 'FSSAI VEG',
      mustTry: 'Inventor of Rava Idli during WWII + Silver cup Filter Kaapi',
      desc: 'A centennial legend. Sip coffee made from 80:20 chicory-blend beans poured between dabarah and tumbler to create the velvet froth.',
      budget: 'INR 220 for two',
    },
  ];

  y -= 25;
  for (const stop of day1Stops) {
    page1.drawRectangle({
      x: margin,
      y: y - 52,
      width: contentWidth,
      height: 52,
      color: cLight,
      borderColor: cBorder,
      borderWidth: 0.8,
    });

    drawSafeText(page1, stop.time, {
      x: margin + 10,
      y: y - 16,
      size: 8,
      font: fontBold,
      color: cOrange,
    });

    drawSafeText(page1, stop.name, {
      x: margin + 70,
      y: y - 16,
      size: 9.5,
      font: fontBold,
      color: cDark,
    });

    page1.drawRectangle({
      x: contentWidth + margin - 75,
      y: y - 18,
      width: 65,
      height: 12,
      color: stop.badge.includes('VEG') ? rgb(0.9, 0.98, 0.92) : rgb(0.92, 0.94, 0.98),
      borderColor: stop.badge.includes('VEG') ? cGreen : cNavy,
      borderWidth: 0.8,
    });
    drawSafeText(page1, stop.badge, {
      x: contentWidth + margin - 70,
      y: y - 15,
      size: 6.5,
      font: fontBold,
      color: stop.badge.includes('VEG') ? cGreen : cNavy,
    });

    drawSafeText(page1, `Must-Order: ${stop.mustTry} | Budget: ${stop.budget}`, {
      x: margin + 70,
      y: y - 29,
      size: 7.5,
      font: fontBold,
      color: cNavy,
    });

    drawSafeText(page1, stop.desc, {
      x: margin + 70,
      y: y - 41,
      size: 7.2,
      font: fontRegular,
      color: cMuted,
    });

    y -= 58;
  }

  // ==========================================
  // PAGE 2: DAY 2 (COLONIAL CANOPY, CHURCH STREET & CUBBON PARK)
  // ==========================================
  const page2 = pdfDoc.addPage([pageWidth, pageHeight]);

  y = pageHeight - 55;
  drawSafeText(page2, 'DAY 2: THE GREEN CANOPY, COLONIAL SOUL & CHURCH STREET', {
    x: margin,
    y: y,
    size: 13,
    font: fontBold,
    color: cOrange,
  });

  drawSafeText(page2, 'Zone: Central Bengaluru, MG Road & Church Street | Transit: Namma Metro Purple Line', {
    x: margin,
    y: y - 14,
    size: 8.5,
    font: fontOblique,
    color: cMuted,
  });

  const day2Stops = [
    {
      time: '07:30 AM',
      name: 'Bengaluru Cafe (9th Main Jayanagar)',
      locality: 'Jayanagar 4th Block',
      badge: 'FSSAI VEG',
      mustTry: 'Button Idli Sambar, Khara Bath & Filter Coffee',
      desc: 'The neighborhood crown jewel for hot Rava Idlis, ghee dip tiffins, and rich froth filter coffee right by Jayanagar parks.',
      budget: 'INR 120 for two',
    },
    {
      time: '09:30 AM',
      name: 'Cubbon Park & State Central Library',
      locality: 'Kasturba Road / Ambedkar Veedhi',
      badge: 'NATURE',
      mustTry: 'Stroll past crimson red Seshadri Iyer Memorial Hall',
      desc: '300 acres of tranquil bamboo groves, mahogany trees, and quiet avenues. Strict no-vehicle rule makes this the city favorite morning escape.',
      budget: 'Free Entry',
    },
    {
      time: '12:00 PM',
      name: 'Blossom Book House & Church Street Stroll',
      locality: 'Church Street, Off MG Road',
      badge: 'CULTURE',
      mustTry: 'Browse 3 floors of rare pre-loved books & street murals',
      desc: 'Iconic independent bookstore housing over 200,000 titles. Church Street pedestrian-friendly cobblestone boulevard is lined with independent creators.',
      budget: 'Free Browse',
    },
    {
      time: '02:00 PM',
      name: "Koshy's Cafe & Restaurant (Est. 1940)",
      locality: "St. Mark's Road",
      badge: 'COLONIAL ICON',
      mustTry: 'Appam & Vegetable Stew / Mutton Cutlets & Filter Coffee',
      desc: 'Where Jawaharlal Nehru, Queen Elizabeth II, and generations of journalists debated politics beneath spinning retro ceiling fans.',
      budget: 'INR 450 for two',
    },
    {
      time: '05:00 PM',
      name: 'Bangalore Palace & Sankey Tank Sunset',
      locality: 'Vasanth Nagar & Sadashivanagar',
      badge: 'HERITAGE',
      mustTry: 'Tudor-style architecture tour & Sankey Tank promenade',
      desc: 'Built in 1878 by the Wadiyar dynasty with fortified towers and woodcarvings. End the day watching golden hour reflections over Sankey Tank.',
      budget: 'INR 250 Palace Entry',
    },
  ];

  y -= 35;
  for (const stop of day2Stops) {
    page2.drawRectangle({
      x: margin,
      y: y - 52,
      width: contentWidth,
      height: 52,
      color: cLight,
      borderColor: cBorder,
      borderWidth: 0.8,
    });

    drawSafeText(page2, stop.time, {
      x: margin + 10,
      y: y - 16,
      size: 8,
      font: fontBold,
      color: cOrange,
    });

    drawSafeText(page2, stop.name, {
      x: margin + 70,
      y: y - 16,
      size: 9.5,
      font: fontBold,
      color: cDark,
    });

    page2.drawRectangle({
      x: contentWidth + margin - 85,
      y: y - 18,
      width: 75,
      height: 12,
      color: stop.badge.includes('VEG') ? rgb(0.9, 0.98, 0.92) : rgb(0.92, 0.94, 0.98),
      borderColor: stop.badge.includes('VEG') ? cGreen : cNavy,
      borderWidth: 0.8,
    });
    drawSafeText(page2, stop.badge, {
      x: contentWidth + margin - 80,
      y: y - 15,
      size: 6.5,
      font: fontBold,
      color: stop.badge.includes('VEG') ? cGreen : cNavy,
    });

    drawSafeText(page2, `Must-Order: ${stop.mustTry} | Budget: ${stop.budget}`, {
      x: margin + 70,
      y: y - 29,
      size: 7.5,
      font: fontBold,
      color: cNavy,
    });

    drawSafeText(page2, stop.desc, {
      x: margin + 70,
      y: y - 41,
      size: 7.2,
      font: fontRegular,
      color: cMuted,
    });

    y -= 58;
  }

  // Insider Coffee Map Box on Page 2
  y -= 15;
  page2.drawRectangle({
    x: margin,
    y: y - 85,
    width: contentWidth,
    height: 85,
    color: rgb(0.12, 0.14, 0.18),
  });

  drawSafeText(page2, 'INSIDER PROTOCOL: THE 2026 BENGALURU FILTER KAAPI CODE', {
    x: margin + 15,
    y: y - 20,
    size: 9.5,
    font: fontBold,
    color: rgb(1, 0.82, 0.4),
  });

  drawSafeText(page2, '1. Always order "By-Two Coffee" when traveling with a friend to enjoy the freshest, hottest pours.', {
    x: margin + 15,
    y: y - 36,
    size: 8,
    font: fontRegular,
    color: cWhite,
  });

  drawSafeText(page2, '2. Authentic ratio: 80% Arabica/Robusta plantation beans + 20% chicory for body and viscosity.', {
    x: margin + 15,
    y: y - 49,
    size: 8,
    font: fontRegular,
    color: cWhite,
  });

  drawSafeText(page2, '3. Froth Technique: Pour back and forth between Dabarah and Tumbler from a height of 18 inches.', {
    x: margin + 15,
    y: y - 62,
    size: 8,
    font: fontRegular,
    color: cWhite,
  });

  drawSafeText(page2, '4. No straws, no paper cups. Stainless steel tumblers are the traditional vessel.', {
    x: margin + 15,
    y: y - 75,
    size: 8,
    font: fontBold,
    color: rgb(0.9, 0.9, 0.95),
  });

  // ==========================================
  // PAGE 3: DAY 3 (MALLESHWARAM & INDIRANAGAR BREWS) + DIRECTORY
  // ==========================================
  const page3 = pdfDoc.addPage([pageWidth, pageHeight]);

  y = pageHeight - 55;
  drawSafeText(page3, 'DAY 3: MALLESHWARAM HERITAGE & INDIRANAGAR CRAFT BREWS', {
    x: margin,
    y: y,
    size: 13,
    font: fontBold,
    color: cOrange,
  });

  drawSafeText(page3, 'Zone: Malleshwaram 7th Cross & Indiranagar 100ft Road | Transit: Metro Purple/Green', {
    x: margin,
    y: y - 14,
    size: 8.5,
    font: fontOblique,
    color: cMuted,
  });

  const day3Stops = [
    {
      time: '08:00 AM',
      name: 'CTR (Central Tiffin Room / Shri Sagar)',
      locality: '7th Cross, Margosa Road, Malleshwaram',
      badge: 'FSSAI VEG',
      mustTry: 'Benne Masale Dosa (Crispy outside, buttery pillow center)',
      desc: 'Operating since the 1920s. Golden brown crust with generous pure butter glaze and mild spiced potato palya.',
      budget: 'INR 130 for two',
    },
    {
      time: '10:30 AM',
      name: 'Kadu Malleshwara Temple & Flower Market',
      locality: 'Malleshwaram 15th Cross',
      badge: 'HERITAGE',
      mustTry: 'Nandishwara Teertha natural spring & jasmine garlands',
      desc: '17th-century Dravidian temple complex built by Shivaji brother Venkoji. The nearby flower market fills the street with fragrant Mysore Mallige.',
      budget: 'Free Entry',
    },
    {
      time: '01:30 PM',
      name: 'Indiranagar 12th Main & Third Wave Coffee',
      locality: '12th Main Indiranagar',
      badge: 'SPECIALTY CAFE',
      mustTry: 'Aeropress single-origin Chikmagalur roast & artisanal bakes',
      desc: 'Tree-canopied indie street packed with design studios, apparel pop-ups, and contemporary coffee houses.',
      budget: 'INR 350 for two',
    },
    {
      time: '06:00 PM',
      name: 'Toit Brewpub (Est. 2010)',
      locality: '100 Feet Road, Indiranagar',
      badge: 'BREWPUB ICON',
      mustTry: 'Tintin Toit (Belgian Wit) & Wood-fired Pepperoni Pizza',
      desc: 'Pioneered India microbrewery revolution. Pet-friendly, multi-level brick brewhouse serving naturally carbonated unfiltered ales.',
      budget: 'INR 1,400 for two',
    },
  ];

  y -= 35;
  for (const stop of day3Stops) {
    page3.drawRectangle({
      x: margin,
      y: y - 52,
      width: contentWidth,
      height: 52,
      color: cLight,
      borderColor: cBorder,
      borderWidth: 0.8,
    });

    drawSafeText(page3, stop.time, {
      x: margin + 10,
      y: y - 16,
      size: 8,
      font: fontBold,
      color: cOrange,
    });

    drawSafeText(page3, stop.name, {
      x: margin + 70,
      y: y - 16,
      size: 9.5,
      font: fontBold,
      color: cDark,
    });

    page3.drawRectangle({
      x: contentWidth + margin - 95,
      y: y - 18,
      width: 85,
      height: 12,
      color: stop.badge.includes('VEG') ? rgb(0.9, 0.98, 0.92) : rgb(0.92, 0.94, 0.98),
      borderColor: stop.badge.includes('VEG') ? cGreen : cNavy,
      borderWidth: 0.8,
    });
    drawSafeText(page3, stop.badge, {
      x: contentWidth + margin - 90,
      y: y - 15,
      size: 6.5,
      font: fontBold,
      color: stop.badge.includes('VEG') ? cGreen : cNavy,
    });

    drawSafeText(page3, `Must-Order: ${stop.mustTry} | Budget: ${stop.budget}`, {
      x: margin + 70,
      y: y - 29,
      size: 7.5,
      font: fontBold,
      color: cNavy,
    });

    drawSafeText(page3, stop.desc, {
      x: margin + 70,
      y: y - 41,
      size: 7.2,
      font: fontRegular,
      color: cMuted,
    });

    y -= 58;
  }

  // Official Directory & Support Box
  y -= 15;
  page3.drawRectangle({
    x: margin,
    y: y - 105,
    width: contentWidth,
    height: 105,
    color: cLight,
    borderColor: cBorder,
    borderWidth: 1,
  });

  drawSafeText(page3, 'OFFICIAL DIRECTORY & EMERGENCY CONTACTS', {
    x: margin + 14,
    y: y - 20,
    size: 8.5,
    font: fontBold,
    color: cDark,
  });

  drawSafeText(page3, '- Namma Metro Smart Helpline: 1800-425-12345 (Operations: 05:00 AM - 11:30 PM)', {
    x: margin + 14,
    y: y - 36,
    size: 8,
    font: fontRegular,
    color: cDark,
  });

  drawSafeText(page3, '- Bengaluru City Police SOS / Women Helpline: 112 (Available 24/7 with zero prefix)', {
    x: margin + 14,
    y: y - 50,
    size: 8,
    font: fontRegular,
    color: cDark,
  });

  drawSafeText(page3, '- Auto-Rickshaw Meter Rate: INR 30 first 2 km, then INR 15/km. Use Namma Yatri or Uber Auto for zero-haggle.', {
    x: margin + 14,
    y: y - 64,
    size: 8,
    font: fontRegular,
    color: cDark,
  });

  drawSafeText(page3, '- Verified Creator Instagram: @travel_kathegalu | DM for live suggestions & local community walks', {
    x: margin + 14,
    y: y - 78,
    size: 8,
    font: fontBold,
    color: cOrange,
  });

  drawSafeText(page3, '- Digital Guide Hosted by TysonLabs Creator Commerce: https://tysonlabs.in', {
    x: margin + 14,
    y: y - 92,
    size: 7.5,
    font: fontRegular,
    color: cMuted,
  });

  // Apply headers & footers
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    decoratePage(pdfDoc.getPage(i), i + 1, totalPages);
  }

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.resolve('public/guides/bengaluru-itinerary-2026.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`[PDF Generator] Successfully generated ${outputPath} (${pdfBytes.length} bytes)`);
}

generateBengaluruPDF().catch(console.error);
