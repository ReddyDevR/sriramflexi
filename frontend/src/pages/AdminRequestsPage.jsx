import React, { useState, useEffect } from 'react';
import { 
import { API_BASE_URL } from '../config/api';
  FileText, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [quotationAmount, setQuotationAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    const token = localStorage.getItem('sri_ramu_token');
    fetch(`${API_BASE_URL}/api/requests/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRequests(data.requests || []);
          if (data.requests.length > 0 && !selectedReq) {
            setSelectedReq(data.requests[0]);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSendQuotation = async (requestId) => {
    if (!quotationAmount) {
      alert('Please enter a quotation amount in ₹');
      return;
    }

    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/admin/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quotationAmount: Number(quotationAmount),
          adminNotes: adminNotes || 'Factory estimation finalized by press manager.',
          status: 'QUOTED'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit quote');

      alert('Quotation dispatched to Customer via In-App, Web Push and Brevo Email!');
      setQuotationAmount('');
      setAdminNotes('');
      fetchRequests();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleResolveCancellation = async (requestId, approved) => {
    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/admin/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: approved ? 'CANCELLATION_APPROVED' : 'CANCELLATION_REJECTED',
          adminNotes: approved ? 'Order cancelled. Refund initiated.' : 'Job already in machine. Cannot cancel.'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');
      alert(`Cancellation ${approved ? 'approved' : 'rejected'} and customer notified.`);
      fetchRequests();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Quotes &amp; Customer Requests</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer inquiries, calculate custom factory quotations, and process urgent cancellation requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Queue */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              No pending customer requests found.
            </div>
          ) : (
            requests.map(req => (
              <div
                key={req._id}
                onClick={() => setSelectedReq(req)}
                className={`bg-white rounded-2xl border p-5 transition cursor-pointer ${
                  selectedReq?._id === req._id
                    ? 'border-sky-500 ring-2 ring-sky-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        req.type === 'CANCELLATION' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {req.type}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{req.customerName}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{req.customerEmail || req.customerPhone}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    req.status === 'QUOTATION_ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'QUOTED' ? 'bg-sky-100 text-sky-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="py-2.5 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">{req.serviceName || req.orderId}</div>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg">{req.description || req.reason}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  {req.quotationAmount ? (
                    <span className="font-bold text-emerald-700">Quoted: ₹{req.quotationAmount}</span>
                  ) : (
                    <span className="text-amber-600 font-bold">Awaiting Quote</span>
                  )}
                  <span className="text-slate-400">{new Date(req.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Response Desk */}
        <div className="space-y-4">
          {selectedReq ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 sticky top-24">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-sky-600">Request Processor</span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedReq.customerName}</h3>
                <p className="text-xs text-slate-400">{selectedReq.type} Ref: #{selectedReq._id.slice(-6)}</p>
              </div>

              {selectedReq.type === 'CANCELLATION' ? (
                <div className="space-y-4 bg-rose-50 p-4 rounded-xl border border-rose-200">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Cancellation Request for #{selectedReq.orderId}</span>
                  </div>
                  <p className="text-xs text-rose-900 font-medium">Customer Reason: "{selectedReq.reason}"</p>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleResolveCancellation(selectedReq._id, true)}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      Approve &amp; Refund
                    </button>
                    <button
                      onClick={() => handleResolveCancellation(selectedReq._id, false)}
                      className="py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Provide Custom Quotation</h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quoted Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 8500"
                      value={quotationAmount}
                      onChange={(e) => setQuotationAmount(e.target.value)}
                      className="w-full text-base font-black border border-slate-300 rounded-lg p-2.5 bg-white text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estimator Notes</label>
                    <textarea
                      rows="2"
                      placeholder="Mention turnaround, delivery terms, or installation charges."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    ></textarea>
                  </div>

                  <button
                    onClick={() => handleSendQuotation(selectedReq._id)}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Quotation (In-App + Push + Email)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              Select a request to process.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
