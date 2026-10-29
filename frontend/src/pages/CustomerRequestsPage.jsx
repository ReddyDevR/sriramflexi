import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function CustomerRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [serviceName, setServiceName] = useState('Frontlit Flex Banner (Bulk 500+ sq.ft)');
  const [dimensions, setDimensions] = useState('20ft x 10ft');
  const [quantity, setQuantity] = useState(5);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    const token = localStorage.getItem('sri_ramu_token');
    fetch(`${API_BASE_URL}/api/requests/my-requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setRequests(data.requests || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('sri_ramu_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/quotation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceName,
          dimensions,
          quantity,
          description,
          urgency
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      alert('Quotation request submitted! Admin will calculate custom price and alert you immediately.');
      setDescription('');
      fetchRequests();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptQuotation = async (requestId) => {
    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/accept-quotation`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Accept failed');
      alert('Quotation accepted! Admin has received the alert and will schedule your job.');
      fetchRequests();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Custom Quotation &amp; Support Requests</h1>
        <p className="text-sm text-slate-500 mt-1">
          Request custom factory pricing for bulk campaigns, hoardings, or bespoke acrylic signages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-base text-slate-900">Request Custom Price Quote</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service / Media Type</label>
              <select
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
              >
                <option value="Frontlit Flex Banner (Bulk 500+ sq.ft)">Frontlit Flex Banner (Bulk 500+ sq.ft)</option>
                <option value="Star Backlit Lightbox Board (Custom ACP Base)">Star Backlit Lightbox Board (Custom ACP Base)</option>
                <option value="Vinyl Wall Graphics / Frosted Partitions">Vinyl Wall Graphics / Frosted Partitions</option>
                <option value="Executive Visiting Cards with Gold Foil Stamp">Executive Visiting Cards with Gold Foil Stamp</option>
                <option value="Heidelberg Multi-Color Catalogues (16 Pages)">Heidelberg Multi-Color Catalogues (16 Pages)</option>
                <option value="ACP 3D LED Acrylic Letters Signboard">ACP 3D LED Acrylic Letters Signboard</option>
                <option value="Aluminium Standees & Promotional Canopies">Aluminium Standees &amp; Promotional Canopies</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Approx. Dimensions</label>
                <input
                  type="text"
                  placeholder="e.g. 20ft x 10ft"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Priority</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
              >
                <option value="NORMAL">Normal (Within 24 Hours)</option>
                <option value="HIGH">Urgent (Need within 2-4 Hours)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specifications &amp; Requirements</label>
              <textarea
                rows="3"
                required
                placeholder="Mention GSM, lamination, installation requirement, or sample artwork links."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Send Request to Admin Desk'}</span>
            </button>
          </form>
        </div>

        {/* Existing Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Your Submitted Requests &amp; Quotations</h3>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No quotation requests yet</p>
              <p className="text-xs text-slate-400 mt-1">Submit a request above to receive instant price estimates.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-full">
                      {req.type}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{req.serviceName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{req.dimensions} • {req.quantity} unit(s)</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    req.status === 'QUOTATION_ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                    req.quotationAmount ? 'bg-sky-100 text-sky-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status === 'QUOTATION_ACCEPTED' ? 'ACCEPTED' : req.quotationAmount ? 'QUOTED' : 'PENDING REVIEW'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                  {req.description}
                </p>

                {/* Quoted Box if Admin provided price */}
                {req.quotationAmount && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Official Press Quotation:</span>
                      <div className="text-2xl font-black text-emerald-700 mt-0.5">₹{req.quotationAmount}</div>
                      {req.adminNotes && (
                        <p className="text-xs text-emerald-900 mt-1 font-medium">Notes: {req.adminNotes}</p>
                      )}
                    </div>

                    {req.status !== 'QUOTATION_ACCEPTED' ? (
                      <button
                        onClick={() => handleAcceptQuotation(req._id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Quotation &amp; Proceed</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Accepted by You</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
