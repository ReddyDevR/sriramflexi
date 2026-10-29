const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const products = [
  {
    file: 'flex-printing.svg',
    name: 'Flex Printing',
    emoji: '🖨️',
    subtitle: '1440 DPI Outdoor Solvent Banners',
    bg1: '#0f172a', bg2: '#0284c7',
    badge: '340-440 GSM All-Weather'
  },
  {
    file: 'digital-printing.svg',
    name: 'Digital Printing',
    emoji: '🖨️',
    subtitle: 'Konica Minolta High-Speed Color Press',
    bg1: '#1e1b4b', bg2: '#6366f1',
    badge: '300 GSM Art Card'
  },
  {
    file: 'xerox-photocopy.svg',
    name: 'Xerox / Photocopy',
    emoji: '📄',
    subtitle: 'High-Speed B&W Canon ImageRunner',
    bg1: '#0f172a', bg2: '#475569',
    badge: '75 GSM Super White'
  },
  {
    file: 'color-xerox.svg',
    name: 'Color Xerox',
    emoji: '📑',
    subtitle: 'Laser Vibrant Color Copies',
    bg1: '#1e293b', bg2: '#e11d48',
    badge: '100 GSM Bond Paper'
  },
  {
    file: 'id-cards.svg',
    name: 'ID Cards',
    emoji: '🪪',
    subtitle: 'PVC Multi-Layer Thermal Laminated',
    bg1: '#0c4a6e', bg2: '#0284c7',
    badge: 'Lanyard & Metallic Holder'
  },
  {
    file: 'visiting-cards.svg',
    name: 'Visiting Cards',
    emoji: '💳',
    subtitle: '350 GSM Matte Velvet / Spot UV',
    bg1: '#18181b', bg2: '#d97706',
    badge: 'Rounded / Die Cut Finishing'
  },
  {
    file: 'lamination.svg',
    name: 'Lamination',
    emoji: '📋',
    subtitle: 'Hot & Cold Thermal Film Lamination',
    bg1: '#134e4a', bg2: '#0d9488',
    badge: 'Matte & Gloss 250 Micron'
  },
  {
    file: 'spiral-binding.svg',
    name: 'Spiral Binding',
    emoji: '📚',
    subtitle: 'Wire-O & PVC Plastic Coils',
    bg1: '#312e81', bg2: '#4f46e5',
    badge: 'Frosted OHP Clear Sheets'
  },
  {
    file: 'book-binding.svg',
    name: 'Book Binding',
    emoji: '📕',
    subtitle: 'Hardcover Golden Embossing & Perfect Bound',
    bg1: '#450a0a', bg2: '#dc2626',
    badge: 'Rexine / Leatherette Spine'
  },
  {
    file: 'photo-printing.svg',
    name: 'Photo Printing',
    emoji: '🖼️',
    subtitle: 'Epson UltraChrome 8-Color Photo Luster',
    bg1: '#3b0764', bg2: '#a855f7',
    badge: '280 GSM Glossy / Satin'
  },
  {
    file: 'graphic-design.svg',
    name: 'Graphic / Design Services',
    emoji: '🎨',
    subtitle: 'Custom Logo, Banner & Vector Artworks',
    bg1: '#172554', bg2: '#2563eb',
    badge: 'Adobe Illustrator & CorelDraw'
  },
  {
    file: 'banners.svg',
    name: 'Banners',
    emoji: '🪧',
    subtitle: 'Roll-Up Standees & Event Backdrops',
    bg1: '#022c22', bg2: '#059669',
    badge: 'Aluminium Heavy Base'
  },
  {
    file: 'stickers.svg',
    name: 'Stickers',
    emoji: '🏷️',
    subtitle: 'Custom Kiss-Cut Vinyl Stickers',
    bg1: '#701a75', bg2: '#d946ef',
    badge: 'Waterproof & Scratch Proof'
  },
  {
    file: 'labels.svg',
    name: 'Labels',
    emoji: '📦',
    subtitle: 'Product Jar & Packaging Adhesive Labels',
    bg1: '#7c2d12', bg2: '#ea580c',
    badge: 'Roll & Sheet Formats'
  },
  {
    file: 'invitation-cards.svg',
    name: 'Invitation / Wedding Cards',
    emoji: '💌',
    subtitle: 'Royal Metallic Foil & Letterpress Cards',
    bg1: '#581c87', bg2: '#ec4899',
    badge: 'Handmade Shimmer Board'
  },
  {
    file: 'certificates.svg',
    name: 'Certificates',
    emoji: '📜',
    subtitle: 'Anti-Counterfeit Gold Foil Borders',
    bg1: '#78350f', bg2: '#f59e0b',
    badge: '250 GSM Parchment Paper'
  },
  {
    file: 'brochures.svg',
    name: 'Brochures / Pamphlets',
    emoji: '📰',
    subtitle: 'Bi-Fold & Tri-Fold Offset Flyers',
    bg1: '#064e3b', bg2: '#10b981',
    badge: '170 GSM Art Gloss'
  },
  {
    file: 'posters.svg',
    name: 'Posters',
    emoji: '🖼️',
    subtitle: 'Cinematic Large Wall Prints & Promos',
    bg1: '#1e1b4b', bg2: '#3b82f6',
    badge: 'A3 / A2 / A1 Ultra High-Def'
  },
  {
    file: 'shop-boards.svg',
    name: 'Shop Boards / Sign Boards',
    emoji: '🏪',
    subtitle: 'LED Acrylic Letters & Backlit ACP Boards',
    bg1: '#0f172a', bg2: '#38bdf8',
    badge: '3 Year Outdoor LED Warranty'
  },
  {
    file: 'vinyl-printing.svg',
    name: 'Vinyl Printing',
    emoji: '🏷️',
    subtitle: 'Self-Adhesive Cast Vinyl for Glass & Walls',
    bg1: '#14532d', bg2: '#22c55e',
    badge: 'Air-Release Bubble Free'
  },
  {
    file: 'tshirt-printing.svg',
    name: 'T-Shirt / Heat-Press Printing',
    emoji: '👕',
    subtitle: 'DTF / Sublimation Apparel Printing',
    bg1: '#4c0519', bg2: '#f43f5e',
    badge: '100% Breathable Cotton / Dri-Fit'
  },
  {
    file: 'customized-printing.svg',
    name: 'Customized Printing',
    emoji: '🎁',
    subtitle: 'Mugs, Keychains, Caps & Corporate Gifts',
    bg1: '#312e81', bg2: '#818cf8',
    badge: 'Custom Name & Logo Emboss'
  },
  {
    file: 'large-format.svg',
    name: 'Large Format Printing',
    emoji: '🖨️',
    subtitle: '10-Foot Wide Seamless Solvent Machines',
    bg1: '#111827', bg2: '#0ea5e9',
    badge: 'Commercial Street Banners'
  },
  {
    file: 'blueprint.svg',
    name: 'Blueprint / Plan Printing',
    emoji: '📐',
    subtitle: 'Architectural CAD Drawings (A0, A1, A2)',
    bg1: '#082f49', bg2: '#0284c7',
    badge: 'Line-Accurate Vector Output'
  },
  {
    file: 'scanning.svg',
    name: 'Scanning',
    emoji: '📠',
    subtitle: 'High-Res Optical Document & Book Scanning',
    bg1: '#1e293b', bg2: '#64748b',
    badge: '600 DPI Searchable OCR PDF'
  },
  {
    file: 'document-printing.svg',
    name: 'Document Printing',
    emoji: '📄',
    subtitle: 'Legal, Thesis, Project & Report Printing',
    bg1: '#172554', bg2: '#3b82f6',
    badge: 'Double-Sided Duplex'
  },
  {
    file: 'receipt-printing.svg',
    name: 'Receipt / Bill Printing',
    emoji: '🧾',
    subtitle: 'NCR Carbonless 2-Ply & 3-Ply Books',
    bg1: '#2e1065', bg2: '#9333ea',
    badge: 'Sequential Machine Numbering'
  },
  {
    file: 'letterheads.svg',
    name: 'Letterheads',
    emoji: '📇',
    subtitle: 'Executive Corporate Stationery',
    bg1: '#042f2e', bg2: '#14b8a6',
    badge: '100 GSM Alabaster / Watermark'
  },
  {
    file: 'envelopes.svg',
    name: 'Envelopes',
    emoji: '✉️',
    subtitle: 'Peel & Seal Self-Adhesive Envelopes',
    bg1: '#365314', bg2: '#84cc16',
    badge: 'Window & Non-Window Formats'
  },
  {
    file: 'notebooks.svg',
    name: 'Notebooks / Custom Books',
    emoji: '📒',
    subtitle: 'Personalized College, Office & School Books',
    bg1: '#3b0764', bg2: '#c084fc',
    badge: 'Custom Cover & Ruling'
  }
];

products.forEach(p => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" fill="none">
  <defs>
    <linearGradient id="grad_${p.file.replace(/[^a-z0-9]/gi, '_')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}" />
      <stop offset="100%" stop-color="${p.bg2}" />
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.15)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.4)" />
    </linearGradient>
  </defs>
  <!-- Background Card -->
  <rect width="400" height="260" rx="16" fill="url(#grad_${p.file.replace(/[^a-z0-9]/gi, '_')})" />
  <rect width="400" height="260" rx="16" fill="url(#overlay)" />

  <!-- Inner Decorative Border -->
  <rect x="20" y="20" width="360" height="220" rx="12" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="6 4" fill="rgba(15,23,42,0.45)" />

  <!-- Central Emoji Icon Container -->
  <circle cx="200" cy="85" r="42" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
  <text x="200" y="98" font-size="44" text-anchor="middle">${p.emoji}</text>

  <!-- Title -->
  <text x="200" y="152" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${p.name}</text>

  <!-- Subtitle -->
  <text x="200" y="174" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="11.5" fill="#e2e8f0" text-anchor="middle">${p.subtitle}</text>

  <!-- Quality Badge Pill -->
  <rect x="90" y="192" width="220" height="24" rx="12" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.35)" stroke-width="1" />
  <text x="200" y="208" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="10.5" fill="#f8fafc" text-anchor="middle">✨ ${p.badge}</text>

  <!-- Footer Brand -->
  <text x="200" y="232" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="9" fill="#94a3b8" text-anchor="middle">Sri Ramu Digital — Commercial Printing Hub</text>
</svg>`;

  fs.writeFileSync(path.join(targetDir, p.file), svg, 'utf8');
});

console.log(`✅ Successfully generated ${products.length} prebuilt product SVG images!`);
