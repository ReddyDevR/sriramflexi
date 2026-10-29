import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export default function InstantPriceCalculator({ onSelectConfig }) {
  const [productType, setProductType] = useState('flex');
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(4);
  const [quantity, setQuantity] = useState(1);
  const [gsm, setGsm] = useState('340');
  const [lamination, setLamination] = useState('none');
  const [frame, setFrame] = useState(false);

  // Rate calculations
  let baseRate = 12; // Flex ₹12/sq.ft
  let isSqFt = true;
  let unit = 'sq.ft';

  if (productType === 'banners') {
    baseRate = 14;
  } else if (productType === 'shop_boards') {
    baseRate = 65;
  } else if (productType === 'vinyl') {
    baseRate = 35;
  } else if (productType === 'large_format') {
    baseRate = 22;
  } else if (productType === 'digital') {
    baseRate = 8;
    isSqFt = false;
    unit = 'sheet';
  } else if (productType === 'visiting_cards') {
    baseRate = 350;
    isSqFt = false;
    unit = 'box';
  } else if (productType === 'id_cards') {
    baseRate = 45;
    isSqFt = false;
    unit = 'card';
  }

  const sqft = isSqFt ? Math.max(1, width * height) : 1;

  let gsmMultiplier = (gsm === '380' || gsm === '440') ? 1.25 : 1.0;
  let lamCost = (lamination === 'matte' || lamination === 'gloss') ? 8 : 0;
  let frameCost = frame ? 15 : 0; // per sq ft

  const unitPrice = isSqFt
    ? Math.round((baseRate * gsmMultiplier + lamCost + frameCost) * sqft)
    : baseRate;
  const totalAmount = unitPrice * quantity;

  const handleOrder = () => {
    if (onSelectConfig) {
      onSelectConfig({
        productType,
        width: isSqFt ? width : null,
        height: isSqFt ? height : null,
        sqft: isSqFt ? sqft : 1,
        quantity,
        gsm,
        lamination,
        frame,
        totalAmount
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-100 rounded-lg text-sky-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Instant Print Price Calculator</h3>
            <p className="text-xs text-slate-500">Live square-foot &amp; unit pricing with finishing options</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
          Factory Press Rates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Print Media Type</label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white font-medium focus:ring-2 focus:ring-sky-500"
            >
              <option value="flex">🖨️ Flex Printing (₹12 / sq.ft)</option>
              <option value="banners">🪧 Banners &amp; Standees (₹14 / sq.ft)</option>
              <option value="shop_boards">🏪 Shop Boards / Sign Boards (₹65 / sq.ft)</option>
              <option value="vinyl">🏷️ Vinyl Printing (₹35 / sq.ft)</option>
              <option value="large_format">🖨️ Large Format Printing (₹22 / sq.ft)</option>
              <option value="digital">🖨️ Digital Printing (₹8 / sheet)</option>
              <option value="visiting_cards">💳 Visiting Cards (₹350 / box 100 pcs)</option>
              <option value="id_cards">🪪 ID Cards (₹45 / card)</option>
            </select>
          </div>

          {isSqFt ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Width (Feet)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={width}
                  onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Height (Feet)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={height}
                  onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Unit</label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                Priced per {unit}
              </div>
            </div>
          )}

          {isSqFt && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">GSM Grade</label>
                <select
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-sky-500"
                >
                  <option value="340">340 GSM Standard</option>
                  <option value="380">380 GSM Heavy (+25%)</option>
                  <option value="440">440 GSM Star (+25%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Lamination</label>
                <select
                  value={lamination}
                  onChange={(e) => setLamination(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-sky-500"
                >
                  <option value="none">None</option>
                  <option value="gloss">Gloss (+₹8/sq.ft)</option>
                  <option value="matte">Matte (+₹8/sq.ft)</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {isSqFt && (
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={frame}
                    onChange={(e) => setFrame(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span>Iron Frame (+₹15/sq.ft)</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Card */}
        <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Live Cost Estimate</div>
            <div className="space-y-2 text-xs text-slate-300">
              {isSqFt && (
                <div className="flex justify-between">
                  <span>Total Surface:</span>
                  <span className="font-bold text-white">{sqft} sq.ft ({width}×{height})</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Unit Cost:</span>
                <span className="font-bold text-white">₹{unitPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-bold text-white">{quantity} {unit}(s)</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-slate-200">
                <span>Finishing &amp; Eyelets:</span>
                <span className="text-emerald-400 font-semibold">Included</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-xs text-slate-400">Total Estimate:</span>
              <span className="text-2xl font-black text-amber-400">₹{totalAmount}</span>
            </div>

            <button
              onClick={handleOrder}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              ⚡ Real-time Admin sound alert &amp; Brevo order email upon placement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
