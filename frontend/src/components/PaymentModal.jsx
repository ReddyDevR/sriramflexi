import React, { useState } from 'react';
import { X, CreditCard, QrCode, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PaymentModal({ order, onClose, onSuccess }) {
  const [paymentMode, setPaymentMode] = useState('UPI_QR');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch('http://localhost:5000/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.orderId,
          amount: order.totalAmount,
          paymentMode,
          transactionId: transactionId || 'UPI-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment submission failed');

      onSuccess(data.payment);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-sky-200" />
            <div>
              <h3 className="font-bold text-lg">Submit Payment</h3>
              <p className="text-xs text-sky-100">Order #{order.orderId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-sky-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 font-medium">Total Amount Due</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">₹{order.totalAmount}</div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              PENDING VERIFICATION
            </span>
          </div>

          {/* UPI QR Display */}
          <div className="border border-slate-200 rounded-xl p-4 text-center bg-sky-50/50">
            <div className="w-36 h-36 mx-auto bg-white p-2 rounded-lg border border-slate-200 shadow-xs flex flex-col items-center justify-center">
              {/* Simulated QR Pattern */}
              <div className="w-28 h-28 border-2 border-slate-800 p-1 flex flex-wrap gap-1">
                <div className="w-8 h-8 bg-slate-900"></div>
                <div className="w-14 h-4 bg-slate-700"></div>
                <div className="w-6 h-8 bg-slate-900"></div>
                <div className="w-12 h-6 bg-slate-600"></div>
                <div className="w-8 h-8 bg-slate-900"></div>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-2">Scan &amp; Pay to Sri Ramu Digital</p>
            <p className="text-[11px] font-mono text-sky-700">UPI ID: sriramuprinting@upi</p>
          </div>

          {/* Payment Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-sky-500"
            >
              <option value="UPI_QR">UPI / Google Pay / PhonePe / Paytm</option>
              <option value="NET_BANKING">Direct Bank IMPS / NEFT Transfer</option>
              <option value="CASH_COUNTER">Cash at Sri Ramu Press Counter</option>
            </select>
          </div>

          {/* UTR / Transaction Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              UTR / Transaction Reference Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 429182048194 or UPI Ref ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Admin will verify this 12-digit UTR before printing starts.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Paid from Maheswar HDFC account"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting to Accounts Desk...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Payment for Verification</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              ⚡ Admin panel will receive real-time alert + notification sound instantly.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
