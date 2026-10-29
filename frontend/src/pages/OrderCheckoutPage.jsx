import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PackageCheck,
  ArrowRight,
  Tag,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info,
  Upload,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  X,
  CheckCircle2,
  Layers
} from 'lucide-react';

import { API_BASE_URL } from '../config/api';

export default function OrderCheckoutPage({ selectedProduct, initialConfig, onOrderSuccess, onCancel }) {
  const { user } = useAuth();

  const product = selectedProduct || {
    _id: 'prod_flex_print',
    name: '🖨️ Flex Printing',
    category: 'Flex & Sign Boards',
    basePrice: 12,
    unit: 'sq.ft',
    image: '/images/products/flex-printing.svg'
  };

  const [width, setWidth] = useState(initialConfig?.width || 10);
  const [height, setHeight] = useState(initialConfig?.height || 4);
  const [quantity, setQuantity] = useState(initialConfig?.quantity || 1);
  const [gsm, setGsm] = useState(initialConfig?.gsm || '340');
  const [lamination, setLamination] = useState(initialConfig?.lamination || 'none');
  const [frame, setFrame] = useState(initialConfig?.frame || false);
  const [eyelets, setEyelets] = useState(true);
  const [shippingAddress, setShippingAddress] = useState(user?.address || 'Pickup at Sri Ramu Press Counter');
  const [couponCode, setCouponCode] = useState('RAMU10');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState('UPI_QR');

  // CUSTOM PHOTO & DESCRIPTION FEATURE
  const [customDescription, setCustomDescription] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [customPhotos, setCustomPhotos] = useState({
    1: null, // { slot: 1, name, dataUrl, size }
    2: null,
    3: null
  });
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const slotLabels = {
    1: 'Slot 1: Front Artwork / Main Photo',
    2: 'Slot 2: Back Side / Additional Photo',
    3: 'Slot 3: Logo / Color Sample / Reference'
  };

  // Handle file select (any file size acceptable)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setCustomPhotos(prev => ({
        ...prev,
        [selectedSlot]: {
          slot: selectedSlot,
          name: file.name,
          dataUrl,
          size: sizeStr,
          type: file.type
        }
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const removePhoto = (slotNum) => {
    setCustomPhotos(prev => ({
      ...prev,
      [slotNum]: null
    }));
  };

  // Calculate pricing
  const isSqFt = product.unit === 'sq.ft';
  const sqft = isSqFt ? Math.max(1, width * height) : 1;

  let baseRate = product.basePrice;
  let gsmMult = gsm === '380' || gsm === '440' ? 1.25 : 1.0;
  let lamCost = lamination !== 'none' ? 8 : 0;
  let frameCost = frame ? 15 : 0;

  const unitPrice = isSqFt 
    ? Math.round((baseRate * gsmMult + lamCost + frameCost) * sqft)
    : baseRate;

  const subtotal = unitPrice * Number(quantity);

  // Coupon handling
  const applyCoupon = () => {
    setCouponError('');
    const code = couponCode.toUpperCase().trim();
    if (code === 'RAMU10') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedDiscount(disc);
    } else if (code === 'FESTIVAL20' && subtotal >= 2000) {
      const disc = Math.min(Math.round(subtotal * 0.2), 1500);
      setAppliedDiscount(disc);
    } else if (code === 'FESTIVAL20') {
      setCouponError('FESTIVAL20 requires minimum order of ₹2,000');
      setAppliedDiscount(0);
    } else {
      setCouponError('Invalid coupon code');
      setAppliedDiscount(0);
    }
  };

  const finalAmount = Math.max(0, subtotal - appliedDiscount);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const uploadedPhotosList = Object.values(customPhotos).filter(Boolean);

    const token = localStorage.getItem('sri_ramu_token');
    try {
      const payload = {
        items: [
          {
            productId: product._id,
            name: product.name,
            category: product.category,
            quantity: Number(quantity),
            unit: product.unit,
            unitPrice,
            dimensions: isSqFt ? { width, height, sqft } : null,
            options: {
              gsm: `${gsm} GSM`,
              lamination,
              frame,
              eyelets
            }
          }
        ],
        subtotal,
        discount: appliedDiscount,
        couponCode: appliedDiscount > 0 ? couponCode.toUpperCase() : null,
        shippingAddress,
        customerNotes: customDescription,
        customDescription,
        customPhotos: uploadedPhotosList,
        paymentMode
      };

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order failed');

      onOrderSuccess(data.order);
    } catch (err) {
      alert(`Error submitting order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf"
        className="hidden"
      />

      {/* Enlarged Photo Modal */}
      {enlargedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 text-white relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="font-bold text-sm text-sky-400">
                {slotLabels[enlargedPhoto.slot]}
              </div>
              <button 
                onClick={() => setEnlargedPhoto(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-square max-h-[70vh] w-full flex items-center justify-center p-2 bg-slate-950 rounded-xl mt-3 overflow-hidden">
              <img 
                src={enlargedPhoto.dataUrl} 
                alt="Enlarged Artwork Preview" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="pt-3 text-xs text-slate-400 flex justify-between">
              <span>{enlargedPhoto.name}</span>
              <span>{enlargedPhoto.size}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2"
        >
          &larr; Back to Products Catalog
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Configure &amp; Place Print Order</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review specifications, upload custom photos, add printing instructions, and submit for instant production scheduling.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Specification Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Product Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
            <div className="w-20 h-20 bg-slate-900 rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-800">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wide">{product.category}</span>
              <h3 className="font-extrabold text-lg text-slate-900">{product.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{product.description}</p>
              <div className="mt-2 text-xs font-bold text-slate-700">
                Base Price: <span className="text-sky-600">₹{product.basePrice} / {product.unit}</span>
              </div>
            </div>
          </div>

          {/* Size & Options Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Dimensions &amp; Quantity Specifications
            </h4>

            {isSqFt ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Width (Feet)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={width}
                    onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Height (Feet)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={height}
                    onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity ({product.unit}s)
                </label>
                <input
                  type="number"
                  min={product.minQuantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 font-medium"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Minimum order: {product.minQuantity || 1} {product.unit}
                </span>
              </div>
            )}

            {isSqFt && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Media Thickness</label>
                  <select
                    value={gsm}
                    onChange={(e) => setGsm(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="340">Standard 340 GSM</option>
                    <option value="380">Heavy Duty 380 GSM (+25%)</option>
                    <option value="440">Industrial Star 440 GSM (+25%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Surface Finish</label>
                  <select
                    value={lamination}
                    onChange={(e) => setLamination(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="none">Standard Unlaminated</option>
                    <option value="gloss">High Gloss Lamination (+₹8/sq.ft)</option>
                    <option value="matte">Velvet Matte Lamination (+₹8/sq.ft)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* CUSTOM PHOTO UPLOAD & DESCRIPTION SECTION */}
          <div className="bg-white p-5 rounded-2xl border border-sky-200 bg-sky-50/20 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  Customized Artwork Photos &amp; Description (Optional)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload up to 3 square shape preview photos (Any size acceptable). Add custom printing instructions.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 bg-sky-100 text-sky-800 rounded-full">
                Any Resolution
              </span>
            </div>

            {/* Dropdown to select Slot */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Select Upload Slot:
              </label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(Number(e.target.value))}
                className="text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white flex-1 min-w-[200px]"
              >
                <option value={1}>📸 Image Slot 1: Front Artwork / Main Photo</option>
                <option value={2}>📸 Image Slot 2: Back Side / Additional Photo</option>
                <option value={3}>📸 Image Slot 3: Logo / Color Sample / Reference</option>
              </select>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo to Slot {selectedSlot}
              </button>
            </div>

            {/* 3 Square Shape Image Preview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {[1, 2, 3].map((slotNum) => {
                const photo = customPhotos[slotNum];
                const isSelected = selectedSlot === slotNum;

                return (
                  <div
                    key={slotNum}
                    onClick={() => {
                      setSelectedSlot(slotNum);
                      if (!photo) fileInputRef.current?.click();
                    }}
                    className={`aspect-square rounded-2xl border-2 transition relative overflow-hidden group cursor-pointer flex flex-col items-center justify-center p-3 text-center ${
                      photo
                        ? 'border-sky-500 bg-slate-950 shadow-md'
                        : isSelected
                        ? 'border-sky-400 border-dashed bg-sky-50/60'
                        : 'border-slate-200 border-dashed bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    {photo ? (
                      <>
                        {/* Square shape fitted image preview */}
                        <img
                          src={photo.dataUrl}
                          alt={`Slot ${slotNum} Preview`}
                          className="w-full h-full object-cover rounded-xl"
                        />

                        {/* Top Badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900/90 text-sky-300 border border-slate-700">
                          Slot {slotNum}
                        </div>

                        {/* Hover Overlay with Preview & Remove actions */}
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnlargedPhoto(photo);
                            }}
                            className="p-2 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-lg backdrop-blur-xs transition"
                            title="Enlarge Preview"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSlot(slotNum);
                              fileInputRef.current?.click();
                            }}
                            className="p-2 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-lg backdrop-blur-xs transition"
                            title="Replace Photo"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto(slotNum);
                            }}
                            className="p-2 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg transition"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Bottom File Info */}
                        <div className="absolute bottom-2 inset-x-2 px-2 py-1 bg-slate-900/90 rounded-md text-[10px] text-slate-300 truncate text-center border border-slate-700">
                          {photo.name} ({photo.size})
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1.5 p-2">
                        <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-slate-400 group-hover:text-sky-600 group-hover:scale-110 transition">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="font-extrabold text-xs text-slate-700">
                          Slot {slotNum} Photo
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {slotNum === 1 && 'Primary Front Design'}
                          {slotNum === 2 && 'Back Design / Reference'}
                          {slotNum === 3 && 'Logo / Color Sample'}
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-white border border-slate-200 text-slate-500">
                          Square Preview
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Description / Job Notes Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Printing Description &amp; Instructions (Optional)
              </label>
              <textarea
                rows="3"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. Please crop 1 inch from top border, print company logo in high-gloss spot UV, Telugu fonts proofing required before machine run..."
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900">Delivery / Counter Pickup</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shipping / Counter Pickup Address</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium"
                placeholder="Pickup at Sri Ramu Press Counter or specify shop address"
              />
            </div>
          </div>
        </div>

        {/* Right Sticky Summary Sidebar */}
        <div className="space-y-5">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-5 sticky top-24">
            <h3 className="font-bold text-lg border-b border-white/10 pb-3">Order Price Summary</h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              {isSqFt && (
                <div className="flex justify-between">
                  <span>Calculated Area:</span>
                  <span className="font-bold text-white">{sqft} sq.ft ({width}×{height} ft)</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Unit Rate:</span>
                <span className="font-bold text-white">₹{unitPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-bold text-white">{quantity} {product.unit}(s)</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span>Subtotal:</span>
                <span className="font-bold text-white">₹{subtotal}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-₹{appliedDiscount}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t border-white/15 text-base">
                <span className="font-semibold text-slate-200">Final Total:</span>
                <span className="text-2xl font-black text-amber-400">₹{finalAmount}</span>
              </div>
            </div>

            {/* Custom Photos badge in summary */}
            {Object.values(customPhotos).filter(Boolean).length > 0 && (
              <div className="bg-sky-950/60 border border-sky-800/80 rounded-xl p-2.5 text-xs text-sky-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>
                  {Object.values(customPhotos).filter(Boolean).length} customized artwork photo(s) attached
                </span>
              </div>
            )}

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. RAMU10"
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-[11px] text-emerald-400 mt-1">✓ Coupon {couponCode.toUpperCase()} applied!</p>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-400 mt-1">{couponError}</p>
              )}
            </div>

            {/* Payment Mode Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="UPI_QR">UPI / QR Code Scan</option>
                <option value="NET_BANKING">Net Banking / IMPS</option>
                <option value="CASH_COUNTER">Pay at Sri Ramu Press Counter</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <PackageCheck className="w-4 h-4" />
                  <span>Confirm &amp; Place Order</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p>⚡ Admin receives real-time alert + chime sound immediately.</p>
              <p>✉️ You will receive instant In-App, Push &amp; Brevo confirmation.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
