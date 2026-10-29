import React, { useState, useEffect } from 'react';
import { 
import { API_BASE_URL } from '../config/api';
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  FileCheck,
  Search
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  const fetchPayments = () => {
    const token = localStorage.getItem('sri_ramu_token');
    const endpoint = filter === 'PENDING' 
      ? `${API_BASE_URL}/api/payments/admin/pending`
      : `${API_BASE_URL}/api/payments/admin/all`;

    fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setPayments(data.payments || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const handleVerify = async (paymentId) => {
    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/admin/${paymentId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      alert('Payment verified! Customer in-app, push & Brevo confirmation dispatched.');
      fetchPayments();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('Enter rejection reason for customer (e.g. UTR mismatch / payment uncredited):', 'UTR reference not credited to press account');
    if (!reason) return;

    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/admin/${paymentId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Rejection failed');
      alert('Payment rejected. Customer in-app, push & Brevo email dispatched with retry action.');
      fetchPayments();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Payment Verification Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verify bank UTRs and approve print jobs into the production queue.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-bold">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-md transition ${filter === 'PENDING' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'}`}
          >
            Pending Verification
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition ${filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
          >
            All History
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading payment queue...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 max-w-md mx-auto space-y-3">
          <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Pending Payments</h3>
          <p className="text-xs text-slate-500">
            When a customer submits a UPI UTR reference or payment receipt, real-time chime alert triggers here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map(payment => (
            <div
              key={payment._id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between ${
                payment.status === 'PENDING' ? 'border-amber-300 ring-2 ring-amber-50' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-sky-700">Order #{payment.orderId}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{payment.customerName}</h3>
                    <p className="text-xs text-slate-400">{payment.customerEmail}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    payment.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                    payment.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {payment.status}
                  </span>
                </div>

                <div className="py-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Submitted:</span>
                    <span className="font-black text-slate-900 text-base">₹{payment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-bold text-slate-700">{payment.paymentMode}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-500">UTR / Ref Number:</span>
                    <span className="font-mono font-bold text-slate-900 select-all">{payment.transactionId}</span>
                  </div>
                  {payment.notes && (
                    <p className="text-slate-500 mt-1 italic">Note: "{payment.notes}"</p>
                  )}
                  {payment.rejectionReason && (
                    <div className="p-2 bg-rose-50 text-rose-700 rounded-lg font-medium">
                      Rejection Reason: {payment.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              {payment.status === 'PENDING' && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleVerify(payment._id)}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Accept</span>
                  </button>
                  <button
                    onClick={() => handleReject(payment._id)}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition border border-rose-200 flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
