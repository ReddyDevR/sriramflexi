import React, { useState } from 'react';
import { 
  Send, 
  Megaphone, 
  Tag, 
  Sparkles, 
  Smartphone, 
  Mail, 
  Bell,
  CheckCircle2
} from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState('Diwali Special: 20% Off on Flex & Glow Sign Boards!');
  const [message, setMessage] = useState('Celebrate the festive season with ultra-vibrant wide format flex banners and 3D acrylic signage. Use code DIWALI20 at checkout.');
  const [couponCode, setCouponCode] = useState('DIWALI20');
  const [expiryDate, setExpiryDate] = useState('2026-11-15');
  const [channels, setChannels] = useState(['IN_APP', 'WEB_PUSH', 'EMAIL']);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const toggleChannel = (ch) => {
    if (channels.includes(ch)) {
      setChannels(channels.filter(c => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsBroadcasting(true);
    setSuccessMsg('');

    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          message,
          couponCode: couponCode || null,
          expiryDate: expiryDate || null,
          channels,
          targetAudience: 'ALL_CUSTOMERS'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Broadcast failed');

      setSuccessMsg(data.message || 'Announcement broadcast successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Customer Announcement Manager</h1>
        <p className="text-xs text-slate-500 mt-1">
          Broadcast promotional offers, festival coupons, and press announcements across In-App, Push, and Brevo email.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleBroadcast} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Create New Customer Announcement</h3>
            <p className="text-xs text-slate-400">Delivered directly to registered customers' devices &amp; inboxes</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Promotional Message Body</label>
            <textarea
              rows="3"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Attached Coupon Code (Optional)</label>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <input
                  type="text"
                  placeholder="e.g. RAMU20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Offer Expiry Date</label>
              <input
                type="text"
                placeholder="e.g. 2026-11-15"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Channels Selection */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">Delivery Channels</label>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={channels.includes('IN_APP')}
                  onChange={() => toggleChannel('IN_APP')}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <Bell className="w-4 h-4 text-slate-600" />
                <span>In-App Center</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={channels.includes('WEB_PUSH')}
                  onChange={() => toggleChannel('WEB_PUSH')}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <Smartphone className="w-4 h-4 text-slate-600" />
                <span>Web Push Notification</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={channels.includes('EMAIL')}
                  onChange={() => toggleChannel('EMAIL')}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <Mail className="w-4 h-4 text-slate-600" />
                <span>Brevo Promotional Email</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isBroadcasting}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isBroadcasting ? 'Broadcasting to Customers...' : 'Broadcast Announcement Now'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
