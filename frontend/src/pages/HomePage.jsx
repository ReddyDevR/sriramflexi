import React from 'react';
import InstantPriceCalculator from '../components/InstantPriceCalculator';
import { 
  Printer, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Award, 
  ArrowRight, 
  CheckCircle,
  Truck,
  PhoneCall
} from 'lucide-react';

export default function HomePage({ onNavigate, onSelectConfig }) {
  const categories = [
    { name: '🖨️ Flex Printing', desc: '1440 DPI Outdoor Heavy Weatherproof Banners', icon: '/images/products/flex-printing.svg', price: '₹12 / sq.ft' },
    { name: '🖨️ Digital Printing', desc: 'Konica Minolta High-Speed Color Laser Press', icon: '/images/products/digital-printing.svg', price: '₹8 / sheet' },
    { name: '💳 Visiting Cards', desc: '350 GSM Velvet Touch & Raised Spot UV Finish', icon: '/images/products/visiting-cards.svg', price: '₹350 / box' },
    { name: '🪪 ID Cards', desc: 'Solid PVC 800-Micron Cards with Satin Lanyard', icon: '/images/products/id-cards.svg', price: '₹45 / card' },
    { name: '🏪 Shop Boards / Sign Boards', desc: 'LED Acrylic 3D Letters on Waterproof GI Framework', icon: '/images/products/shop-boards.svg', price: '₹65 / sq.ft' },
    { name: '👕 T-Shirt / Heat-Press Printing', desc: 'High-Definition DTF Wash-Resistant Apparel Prints', icon: '/images/products/tshirt-printing.svg', price: '₹280 / piece' },
    { name: '🏷️ Stickers & Labels', desc: 'Custom Shape Kiss-Cut Waterproof Vinyl Decals', icon: '/images/products/stickers.svg', price: '₹25 / sheet' },
    { name: '📚 Spiral & Book Binding', desc: 'Wire-O Coils, Hardcover Rexine & Gold Foil Stamping', icon: '/images/products/book-binding.svg', price: 'From ₹35' },
    { name: '💌 Invitation / Wedding Cards', desc: 'Royal Metallic Foil & Letterpress Shimmer Cards', icon: '/images/products/invitation-cards.svg', price: '₹25 / card' }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 sm:mx-8 shadow-2xl border border-sky-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Industrial Wide-Format Flex &amp; Multi-Color Offset Press</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Sri Ramu Digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">
              Flex, Vinyl &amp; Offset Printing
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Ultra-sharp 1440 DPI solvent flex printing, high-speed Heidelberg offset printing, custom visiting cards, acrylic 3D glow signboards, and event displays with instant live job notifications.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('products')}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg flex items-center gap-2"
            >
              <span>Explore Products &amp; Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('calculator')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition border border-white/20"
            >
              Instant Size Calculator
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10 text-center">
            <div>
              <div className="text-2xl font-black text-sky-400">1440 DPI</div>
              <div className="text-xs text-slate-400 mt-0.5">Japanese Solvent Heads</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">24 Hours</div>
              <div className="text-xs text-slate-400 mt-0.5">Turnaround Speed</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-400">10,000+</div>
              <div className="text-xs text-slate-400 mt-0.5">Satisfied Business Clients</div>
            </div>
            <div>
              <div className="text-2xl font-black text-cyan-400">100% Live</div>
              <div className="text-xs text-slate-400 mt-0.5">Real-Time Stage Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Commercial Printing Services</h2>
            <p className="text-xs text-slate-500 mt-1">Select a category to view specifications, materials and live rates</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            <span>View All Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('products')}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-sky-300 hover:shadow-xl transition-all cursor-pointer flex flex-col"
            >
              <div className="h-44 bg-slate-900 overflow-hidden relative flex items-center justify-center p-2">
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-slate-900/90 text-amber-300 font-extrabold text-[11px] rounded-lg border border-amber-400/30">
                  {cat.price}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition text-base">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-bold">
                  <span>Calculate &amp; Order</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Built-in Instant Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InstantPriceCalculator onSelectConfig={onSelectConfig} />
      </section>

      {/* Trust & Quality Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl font-bold text-slate-900">Why Andhra &amp; Telangana Businesses Trust Sri Ramu Digital</h2>
            <p className="text-xs text-slate-500 mt-1">Unmatched print quality backed by automated real-time notification tracking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Japanese High-Speed Machines</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Equipped with Roland &amp; Mimaki 1440 DPI solvent plotters and Heidelberg 4-color offset press for vibrant, color-accurate prints.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Real-Time Notification Pipeline</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Never guess your order status. Receive automatic in-app alerts, browser push notifications, and Brevo transactional emails at every stage.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Same-Day Urgent Dispatch</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Need election flex banners, funeral boards, or launch standees within hours? Our night shift press guarantees same-day turnaround.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
