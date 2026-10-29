const bcrypt = require('bcryptjs');

const getSeedData = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const customerPasswordHash = bcrypt.hashSync('customer123', salt);

  const users = [
    {
      _id: 'user_admin_001',
      name: 'Ramu S. (Managing Director)',
      email: 'admin@sriramuprinting.com',
      password: adminPasswordHash,
      role: 'ADMIN',
      phone: '+91 98480 12345',
      company: 'Sri Ramu Digital',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user_cust_001',
      name: 'Maheswar Reddy',
      email: 'maheswar@gmail.com',
      password: customerPasswordHash,
      role: 'CUSTOMER',
      phone: '+91 94401 56789',
      company: 'Reddy Agro Tech',
      address: 'Shop #12, Market Yard, Guntur, AP',
      createdAt: new Date().toISOString()
    }
  ];

  const categories = [
    {
      _id: 'cat_flex_sign',
      name: 'Flex & Sign Boards',
      slug: 'flex-sign-boards',
      icon: '🪧',
      description: 'Outdoor flex banners, hoardings, shop nameplates, and vinyl signboards',
      isActive: true
    },
    {
      _id: 'cat_digital_print',
      name: 'Digital & Commercial Printing',
      slug: 'digital-commercial-printing',
      icon: '🖨️',
      description: 'Fast color laser printing, brochures, flyers, posters, and certificates',
      isActive: true
    },
    {
      _id: 'cat_copy_scan',
      name: 'Copying & Scanning',
      slug: 'copying-scanning',
      icon: '📄',
      description: 'Document Xerox, legal printing, high-speed scanning, and CAD blueprints',
      isActive: true
    },
    {
      _id: 'cat_cards_stationery',
      name: 'Cards & Stationery',
      slug: 'cards-stationery',
      icon: '💳',
      description: 'Visiting cards, PVC ID badges, wedding invitations, and letterheads',
      isActive: true
    },
    {
      _id: 'cat_binding_finish',
      name: 'Binding & Finishing',
      slug: 'binding-finishing',
      icon: '📚',
      description: 'Thermal lamination, spiral binding, hardcover books, and custom notebooks',
      isActive: true
    },
    {
      _id: 'cat_stickers_labels',
      name: 'Stickers & Labels',
      slug: 'stickers-labels',
      icon: '🏷️',
      description: 'Custom die-cut stickers, waterproof vinyl decals, and packaging labels',
      isActive: true
    },
    {
      _id: 'cat_custom_merch',
      name: 'Specialty & Custom Merch',
      slug: 'specialty-custom-merch',
      icon: '👕',
      description: 'Heat-press t-shirts, customized corporate gifts, and promo merchandise',
      isActive: true
    },
    {
      _id: 'cat_photo_design',
      name: 'Photo & Design Services',
      slug: 'photo-design-services',
      icon: '🎨',
      description: 'UltraChrome photo prints, logo design, banner typesetting, and vector art',
      isActive: true
    }
  ];

  const products = [
    {
      _id: 'prod_flex_print',
      name: '🖨️ Flex Printing',
      category: 'Flex & Sign Boards',
      basePrice: 12, // per sq ft
      unit: 'sq.ft',
      minQuantity: 20,
      description: 'Heavy duty 340-440 GSM weatherproof flex banner printed on 1440 DPI solvent inkjet machine. Complete with eyelets and border folding.',
      features: ['1440 DPI Japanese Inkjet Print', 'Heavy 340 GSM Flex Media', 'UV & Rain Resistant (2 Years outdoors)', 'Aluminium Eyelets on all 4 corners', 'Thermal border tape reinforcement'],
      badge: 'Bestseller',
      leadTimeDays: 1,
      image: '/images/products/flex-printing.svg',
      isUsed: true
    },
    {
      _id: 'prod_digital_print',
      name: '🖨️ Digital Printing',
      category: 'Digital & Commercial Printing',
      basePrice: 8, // per sheet
      unit: 'sheet',
      minQuantity: 10,
      description: 'Commercial digital printing on Konica Minolta AccurioPress using 300 GSM art card or 130 GSM gloss paper.',
      features: ['Ultra-crisp 2400 DPI laser toner', 'Double-sided duplex capability', 'Zero plate cost & instant setup', 'Smooth color gradients'],
      badge: 'High Speed',
      leadTimeDays: 1,
      image: '/images/products/digital-printing.svg',
      isUsed: true
    },
    {
      _id: 'prod_xerox',
      name: '📄 Xerox / Photocopy',
      category: 'Copying & Scanning',
      basePrice: 2, // per page
      unit: 'page',
      minQuantity: 1,
      description: 'High-speed Canon ImageRunner B&W photocopying on premium 75 GSM super white paper.',
      features: ['Clean, high-contrast B&W copies', 'Auto-duplex double sided', 'Collated and stapled sorting', 'A4 and Legal sizes'],
      badge: 'Economical',
      leadTimeDays: 1,
      image: '/images/products/xerox-photocopy.svg',
      isUsed: true
    },
    {
      _id: 'prod_color_xerox',
      name: '📑 Color Xerox',
      category: 'Copying & Scanning',
      basePrice: 10, // per page
      unit: 'page',
      minQuantity: 1,
      description: 'Vibrant color photocopies and laser prints on 100 GSM imported smooth paper for presentations and certificates.',
      features: ['Vivid true-color CMYK toner', 'Accurate text and chart rendering', 'Rich blacks and saturated hues', 'Smudge-proof laser output'],
      badge: 'Sharp Color',
      leadTimeDays: 1,
      image: '/images/products/color-xerox.svg',
      isUsed: true
    },
    {
      _id: 'prod_id_cards',
      name: '🪪 ID Cards',
      category: 'Cards & Stationery',
      basePrice: 45, // per card
      unit: 'card',
      minQuantity: 1,
      description: 'Multi-layer thermal-fused PVC identity cards with gloss or matte overlay. Includes lanyard and clip holder.',
      features: ['Credit-card grade 800-micron solid PVC', 'Waterproof dye-sublimation print', 'Barcode / QR code / chip compatible', 'Custom printed satin lanyard'],
      badge: 'Durable PVC',
      leadTimeDays: 1,
      image: '/images/products/id-cards.svg',
      isUsed: true
    },
    {
      _id: 'prod_visiting_cards',
      name: '💳 Visiting Cards',
      category: 'Cards & Stationery',
      basePrice: 350, // per box (100 pcs)
      unit: 'box',
      minQuantity: 1,
      description: 'Premium 350 GSM European art board with dual-side thermal velvet matte lamination and optional spot UV gloss highlights.',
      features: ['Sturdy 350 GSM premium art board', 'Silky soft-touch matte lamination', 'Spot UV high-gloss logo accents', 'Precision hydraulic cut edges'],
      badge: 'Top Pick',
      leadTimeDays: 2,
      image: '/images/products/visiting-cards.svg',
      isUsed: true
    },
    {
      _id: 'prod_lamination',
      name: '📋 Lamination',
      category: 'Binding & Finishing',
      basePrice: 15, // per sheet
      unit: 'sheet',
      minQuantity: 1,
      description: 'Heavy duty hot thermal pouch and roll lamination up to 250 microns for certificates, marks cards, and documents.',
      features: ['Bubble-free crystal clear finish', '100% moisture and tear protection', 'Available in Gloss & Anti-Glare Matte', 'Sealed edges preventing peeling'],
      badge: 'Protective',
      leadTimeDays: 1,
      image: '/images/products/lamination.svg',
      isUsed: true
    },
    {
      _id: 'prod_spiral_binding',
      name: '📚 Spiral Binding',
      category: 'Binding & Finishing',
      basePrice: 35, // per book
      unit: 'book',
      minQuantity: 1,
      description: 'Flexible PVC plastic coil and Wire-O twin loop binding with front frosted clear sheet and heavy back board.',
      features: ['360-degree flat opening for easy reading', 'Heavy duty frosted transparent cover', 'Smooth rounded wire edges', 'Accommodates up to 450 pages'],
      badge: 'Student & Office',
      leadTimeDays: 1,
      image: '/images/products/spiral-binding.svg',
      isUsed: true
    },
    {
      _id: 'prod_book_binding',
      name: '📕 Book Binding',
      category: 'Binding & Finishing',
      basePrice: 80, // per book
      unit: 'book',
      minQuantity: 1,
      description: 'Hardcover rexine library binding, softcover perfect glue binding, and hot golden foil title embossing.',
      features: ['Durable hardcover with cloth/rexine spine', 'Hot-melt polyurethane adhesive', 'Golden / Silver foil hot stamping', 'Long-lasting archival durability'],
      badge: 'Premium Finish',
      leadTimeDays: 2,
      image: '/images/products/book-binding.svg',
      isUsed: true
    },
    {
      _id: 'prod_photo_printing',
      name: '🖼️ Photo Printing',
      category: 'Photo & Design Services',
      basePrice: 40, // per print
      unit: 'print',
      minQuantity: 1,
      description: 'Lab-quality photo printing on 280 GSM Epson UltraChrome luster / satin paper with 100-year fade resistance.',
      features: ['Epson 8-color pigment ink technology', 'Zero color degradation or yellowing', 'High dynamic range & shadow detail', 'Available in 4x6, 6x8, 8x12, 12x18'],
      badge: 'Studio Quality',
      leadTimeDays: 1,
      image: '/images/products/photo-printing.svg',
      isUsed: true
    },
    {
      _id: 'prod_graphic_design',
      name: '🎨 Graphic / Design Services',
      category: 'Photo & Design Services',
      basePrice: 300, // per design
      unit: 'design',
      minQuantity: 1,
      description: 'Professional DTP and creative graphic design services by in-house artists using Adobe Creative Cloud and CorelDraw.',
      features: ['Custom design tailored to your vision', 'Print-ready high-res PDF & vector files', 'Quick revisions and typography layout', 'Telugu, English & Hindi typesetting'],
      badge: 'Creative Experts',
      leadTimeDays: 1,
      image: '/images/products/graphic-design.svg',
      isUsed: true
    },
    {
      _id: 'prod_banners',
      name: '🪧 Banners',
      category: 'Flex & Sign Boards',
      basePrice: 14, // per sq ft
      unit: 'sq.ft',
      minQuantity: 15,
      description: 'Retractable roll-up standees, conference backdrop banners, and lightweight aluminium promotional display stands.',
      features: ['Non-tearable matte greyback banner media', 'Heavy aluminium base cassette with carry bag', 'Portable 2-minute tool-free assembly', 'Vivid indoor/outdoor color vibrancy'],
      badge: 'Events & Expos',
      leadTimeDays: 1,
      image: '/images/products/banners.svg',
      isUsed: true
    },
    {
      _id: 'prod_stickers',
      name: '🏷️ Stickers',
      category: 'Stickers & Labels',
      basePrice: 25, // per sheet
      unit: 'sheet',
      minQuantity: 5,
      description: 'Precision kiss-cut vinyl stickers and paper stickers with strong self-adhesive backing for branding and packaging.',
      features: ['Custom shape contour die-cutting', 'Waterproof PVC vinyl or paper finish', 'Peel-and-stick easy application', 'Resistant to sun and scuffing'],
      badge: 'Custom Die-Cut',
      leadTimeDays: 1,
      image: '/images/products/stickers.svg',
      isUsed: true
    },
    {
      _id: 'prod_labels',
      name: '📦 Labels',
      category: 'Stickers & Labels',
      basePrice: 30, // per sheet
      unit: 'sheet',
      minQuantity: 5,
      description: 'Commercial product bottle labels, shipping carton labels, and barcode identification stickers.',
      features: ['Food-safe non-toxic adhesive', 'High-speed roll or sheet packaging', 'Crisp scannable QR & 1D barcodes', 'Matte, Gloss, or Clear Transparent'],
      badge: 'Packaging Ready',
      leadTimeDays: 1,
      image: '/images/products/labels.svg',
      isUsed: true
    },
    {
      _id: 'prod_invitation_cards',
      name: '💌 Invitation / Wedding Cards',
      category: 'Cards & Stationery',
      basePrice: 25, // per card
      unit: 'card',
      minQuantity: 50,
      description: 'Exquisite traditional wedding cards, anniversary invitations, and ceremonial cards with gold foil and embossed textures.',
      features: ['Heavy 300+ GSM imported shimmer board', 'Hot foil stamping in Gold, Rose Gold & Copper', 'Coordinated matching envelopes included', 'Traditional religious motifs and custom inserts'],
      badge: 'Royal Elegance',
      leadTimeDays: 3,
      image: '/images/products/invitation-cards.svg',
      isUsed: true
    },
    {
      _id: 'prod_certificates',
      name: '📜 Certificates',
      category: 'Digital & Commercial Printing',
      basePrice: 20, // per copy
      unit: 'copy',
      minQuantity: 10,
      description: 'Official academic, corporate achievement, and sports certificates printed on 250 GSM parchment card with gold foil seal.',
      features: ['Textured linen and parchment boards', 'Anti-counterfeit border guilloche designs', 'Variable data printing for names & roll numbers', 'Embossed metallic gold foil seal'],
      badge: 'Formal & Secure',
      leadTimeDays: 1,
      image: '/images/products/certificates.svg',
      isUsed: true
    },
    {
      _id: 'prod_brochures',
      name: '📰 Brochures / Pamphlets',
      category: 'Digital & Commercial Printing',
      basePrice: 5, // per copy
      unit: 'copy',
      minQuantity: 100,
      description: 'Full-color promotional pamphlets, bi-fold brochures, and tri-fold corporate marketing collateral printed on Heidelberg press.',
      features: ['130 GSM to 170 GSM high-bulk art paper', 'Precision machine crease folding', 'High-volume offset printing discounts', 'Vibrant photographic color reproduction'],
      badge: 'Marketing Essential',
      leadTimeDays: 2,
      image: '/images/products/brochures.svg',
      isUsed: true
    },
    {
      _id: 'prod_posters',
      name: '🖼️ Posters',
      category: 'Digital & Commercial Printing',
      basePrice: 60, // per piece
      unit: 'piece',
      minQuantity: 2,
      description: 'High-impact promotional and theatrical posters in A3, A2, and A1 dimensions on 220 GSM gloss or matte card.',
      features: ['Wide color gamut high-saturation inks', 'Heavy paper stock resisting curling', 'Perfect for retail windows and walls', 'Optional gloss or matte lamination'],
      badge: 'High Impact',
      leadTimeDays: 1,
      image: '/images/products/posters.svg',
      isUsed: true
    },
    {
      _id: 'prod_shop_boards',
      name: '🏪 Shop Boards / Sign Boards',
      category: 'Flex & Sign Boards',
      basePrice: 65, // per sq ft
      unit: 'sq.ft',
      minQuantity: 10,
      description: 'Complete commercial shopfront glow signboards with Star Backlit flex, heavy GI iron frame, and waterproof Samsung LED modules.',
      features: ['Heavy 1-inch GI square pipe framework', 'High-diffusion 510 GSM Star Backlit flex', 'Energy efficient IP67 LED lighting modules', 'Full weatherproofing and 3-year outdoor warranty'],
      badge: 'Retail Landmark',
      leadTimeDays: 3,
      image: '/images/products/shop-boards.svg',
      isUsed: true
    },
    {
      _id: 'prod_vinyl_printing',
      name: '🏷️ Vinyl Printing',
      category: 'Flex & Sign Boards',
      basePrice: 35, // per sq ft
      unit: 'sq.ft',
      minQuantity: 10,
      description: 'Self-adhesive vinyl with bubble-free adhesive and protective matte or gloss lamination for glass partitions, walls, and vehicles.',
      features: ['Roland Eco-Solvent sharp detailing', 'Cold lamination scratch protection', 'Waterproof & residue-free removal', 'Vivid micro-color reproduction'],
      badge: 'Versatile Adhesive',
      leadTimeDays: 1,
      image: '/images/products/vinyl-printing.svg',
      isUsed: true
    },
    {
      _id: 'prod_tshirt_printing',
      name: '👕 T-Shirt / Heat-Press Printing',
      category: 'Specialty & Custom Merch',
      basePrice: 280, // per piece
      unit: 'piece',
      minQuantity: 1,
      description: 'Custom round-neck and polo collar t-shirts with high-resolution DTF (Direct-to-Film) or sublimation heat-press printing.',
      features: ['100% combed cotton or breathable sports dry-fit', 'Ultra-durable wash-resistant DTF print', 'Full color front and back graphics', 'Available in all sizes (S to 3XL)'],
      badge: 'Custom Apparel',
      leadTimeDays: 2,
      image: '/images/products/tshirt-printing.svg',
      isUsed: true
    },
    {
      _id: 'prod_customized_printing',
      name: '🎁 Customized Printing',
      category: 'Specialty & Custom Merch',
      basePrice: 199, // per piece
      unit: 'piece',
      minQuantity: 1,
      description: 'Personalized gifts including ceramic photo mugs, magic mugs, custom metal keychains, mouse pads, and promotional pens.',
      features: ['Glossy ceramic microwave-safe mugs', 'Scratch-proof sublimation printing', 'Single-piece custom order supported', 'Gift box packaging included'],
      badge: 'Personalized Gifts',
      leadTimeDays: 1,
      image: '/images/products/customized-printing.svg',
      isUsed: true
    },
    {
      _id: 'prod_large_format',
      name: '🖨️ Large Format Printing',
      category: 'Flex & Sign Boards',
      basePrice: 22, // per sq ft
      unit: 'sq.ft',
      minQuantity: 25,
      description: 'Massive seamless printing up to 10.5 feet wide without joint lines for large event backdrops and political banners.',
      features: ['Industrial multi-head Konica solvent printer', 'Seamless 10-foot media width', 'Deep ink penetration for intense colors', 'Reinforced stitched rope border folding'],
      badge: 'Giant Scale',
      leadTimeDays: 1,
      image: '/images/products/large-format.svg',
      isUsed: true
    },
    {
      _id: 'prod_blueprint',
      name: '📐 Blueprint / Plan Printing',
      category: 'Copying & Scanning',
      basePrice: 50, // per sheet
      unit: 'sheet',
      minQuantity: 1,
      description: 'Precision architectural CAD construction blueprints, structural drawings, and maps on A0, A1, and A2 roll paper.',
      features: ['Exact scale vector line accuracy', 'Heavy 80 GSM blueprint bond paper', 'Available in B&W or Color lines', 'Neatly folded to A4 or rolled in tubes'],
      badge: 'Architects & Engineers',
      leadTimeDays: 1,
      image: '/images/products/blueprint.svg',
      isUsed: true
    },
    {
      _id: 'prod_scanning',
      name: '📠 Scanning',
      category: 'Copying & Scanning',
      basePrice: 5, // per page
      unit: 'page',
      minQuantity: 1,
      description: 'High-speed optical document feeding and flatbed book scanning up to 1200 DPI into searchable OCR PDF or JPG.',
      features: ['High-speed multi-page ADF document scanner', 'Searchable OCR text layer in PDF', 'Safe book scanner preserving bindings', 'Cloud transfer or USB flash drive copy'],
      badge: 'Digital Archiving',
      leadTimeDays: 1,
      image: '/images/products/scanning.svg',
      isUsed: true
    },
    {
      _id: 'prod_document_printing',
      name: '📄 Document Printing',
      category: 'Copying & Scanning',
      basePrice: 3, // per page
      unit: 'page',
      minQuantity: 1,
      description: 'Crisp black & white laser printing for student projects, thesis dissertations, legal affidavits, and office reports.',
      features: ['1200 DPI laser engine with sharp typography', 'Premium 80 GSM bright white bond sheets', 'Executive thesis paper and stamp paper support', 'Collation and binding ready'],
      badge: 'Academic & Legal',
      leadTimeDays: 1,
      image: '/images/products/document-printing.svg',
      isUsed: true
    },
    {
      _id: 'prod_receipt_printing',
      name: '🧾 Receipt / Bill Printing',
      category: 'Cards & Stationery',
      basePrice: 120, // per book
      unit: 'book',
      minQuantity: 5,
      description: 'Carbonless NCR multi-ply bill books, tax invoice books, and estimate pads with sequential machine red numbering.',
      features: ['2-ply (White/Pink) or 3-ply (White/Pink/Yellow) NCR', 'No carbon paper required for transfer', 'Sequential automated red numbering', 'Perforated tear lines with hardcover binding'],
      badge: 'Commercial Billing',
      leadTimeDays: 2,
      image: '/images/products/receipt-printing.svg',
      isUsed: true
    },
    {
      _id: 'prod_letterheads',
      name: '📇 Letterheads',
      category: 'Cards & Stationery',
      basePrice: 250, // per pad (100 sheets)
      unit: 'pad',
      minQuantity: 2,
      description: 'Corporate executive letterheads printed on 100 GSM super executive alabaster or watermark bond paper.',
      features: ['Printer-safe ink that won’t smudge in laser copiers', 'Crisp micro-embossed company logo layout', 'Padded with gummed top edge for easy pull', 'Matching continuation sheets available'],
      badge: 'Corporate Standard',
      leadTimeDays: 2,
      image: '/images/products/letterheads.svg',
      isUsed: true
    },
    {
      _id: 'prod_envelopes',
      name: '✉️ Envelopes',
      category: 'Cards & Stationery',
      basePrice: 180, // per pack (50 pcs)
      unit: 'pack',
      minQuantity: 2,
      description: 'Custom branded office envelopes in 9x4 inch DL size, 10x12 inch cloth-lined legal size, with peel-and-seal strip.',
      features: ['Peel-and-seal self-adhesive flap', 'Full color logo and return address imprint', 'Available in standard DL, A4, and cloth green sizes', 'Heavy 120 GSM tear-resistant paper'],
      badge: 'Office Postal',
      leadTimeDays: 2,
      image: '/images/products/envelopes.svg',
      isUsed: true
    },
    {
      _id: 'prod_notebooks',
      name: '📒 Notebooks / Custom Books',
      category: 'Binding & Finishing',
      basePrice: 95, // per book
      unit: 'book',
      minQuantity: 10,
      description: 'Custom printed school, college, and corporate spiral or stitched notebooks with personalized cover and ruled pages.',
      features: ['Custom branded front & back laminated cover', '70 GSM high-opacity smooth ruled/blank paper', 'Available in 100, 150, or 200 pages', 'Single-line, four-line, or grid ruling'],
      badge: 'Institutional Brand',
      leadTimeDays: 3,
      image: '/images/products/notebooks.svg',
      isUsed: true
    }
  ];

  const coupons = [
    {
      code: 'RAMU10',
      discountPercent: 10,
      maxDiscount: 500,
      minAmount: 500,
      description: 'Get 10% off on all print orders above ₹500',
      validUntil: '2026-12-31'
    },
    {
      code: 'FESTIVAL20',
      discountPercent: 20,
      maxDiscount: 1500,
      minAmount: 2000,
      description: 'Special 20% discount on orders above ₹2000',
      validUntil: '2026-12-31'
    }
  ];

  return { users, categories, products, coupons };
};

module.exports = { getSeedData };
