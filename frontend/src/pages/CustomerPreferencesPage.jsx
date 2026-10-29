import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  Save, 
  AlertCircle 
} from 'lucide-react';

export default function CustomerPreferencesPage() {
  const { preferences, updatePreferences } = useAuth();
  const { isPushSubscribed, subscribePushNotification } = useNotifications();

  const [emailPrefs, setEmailPrefs] = useState(preferences?.email || { orders: true, payments: true, offers: true, system: true });
  const [pushPrefs, setPushPrefs] = useState(preferences?.push || { orders: true, payments: true, offers: true, system: true });
  const [inAppPrefs, setInAppPrefs] = useState(preferences?.inApp || { orders: true, payments: true, offers: true, system: true });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    await updatePreferences({
      email: emailPrefs,
      push: pushPrefs,
      inApp: inAppPrefs
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Notification Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">
          Control how and when you receive order updates, payment confirmations, and promotional discounts.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Your notification preferences have been saved successfully!</span>
        </div>
      )}

      {/* Web Push Device Status Card */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-sky-200 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-sky-600 text-white rounded-xl shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Browser &amp; Device Push Notifications</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Status: {isPushSubscribed ? (
                <span className="font-bold text-emerald-600">Active &amp; Subscribed</span>
              ) : (
                <span className="font-bold text-amber-600">Not Enabled on this Browser</span>
              )}
            </p>
          </div>
        </div>

        {!isPushSubscribed && (
          <button
            onClick={subscribePushNotification}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            Enable Device Push Now
          </button>
        )}
      </div>

      {/* Main Preference Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 text-base">Channel Matrix Configuration</h3>
          <p className="text-xs text-slate-500 mt-0.5">Toggle notification channels for each business event category</p>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Order Updates */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-1">
              <h4 className="font-bold text-sm text-slate-900">Printing &amp; Orders</h4>
              <p className="text-xs text-slate-500 mt-0.5">Machine proofs, printing progress, pickup &amp; delivery.</p>
            </div>
            <div className="md:col-span-3 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inAppPrefs.orders}
                  onChange={(e) => setInAppPrefs(p => ({ ...p, orders: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>In-App Center</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushPrefs.orders}
                  onChange={(e) => setPushPrefs(p => ({ ...p, orders: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>Web Push</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPrefs.orders}
                  onChange={(e) => setEmailPrefs(p => ({ ...p, orders: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>Brevo Email</span>
              </label>
            </div>
          </div>

          {/* Payment Updates (Critical Transactional) */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-50/50">
            <div className="md:col-span-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-slate-900">Payment &amp; Receipts</h4>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Verification, approval, receipts, and refund alerts.</p>
            </div>
            <div className="md:col-span-3 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-not-allowed opacity-80" title="Essential security notice cannot be disabled">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded text-slate-400 w-4 h-4"
                />
                <span>In-App (Required)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushPrefs.payments}
                  onChange={(e) => setPushPrefs(p => ({ ...p, payments: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>Web Push</span>
              </label>

              <label className="flex items-center gap-2 cursor-not-allowed opacity-80" title="Essential payment receipts always sent">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded text-slate-400 w-4 h-4"
                />
                <span>Brevo Email (Required)</span>
              </label>
            </div>
          </div>

          {/* Offers & Coupons */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-1">
              <h4 className="font-bold text-sm text-slate-900">Offers &amp; Coupons</h4>
              <p className="text-xs text-slate-500 mt-0.5">Festive printing discounts, bulk flex coupons, and flash deals.</p>
            </div>
            <div className="md:col-span-3 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inAppPrefs.offers}
                  onChange={(e) => setInAppPrefs(p => ({ ...p, offers: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>In-App Center</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushPrefs.offers}
                  onChange={(e) => setPushPrefs(p => ({ ...p, offers: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>Web Push</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPrefs.offers}
                  onChange={(e) => setEmailPrefs(p => ({ ...p, offers: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>Promotional Email</span>
              </label>
            </div>
          </div>

          {/* System Notices */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-1">
              <h4 className="font-bold text-sm text-slate-900">Press Announcements</h4>
              <p className="text-xs text-slate-500 mt-0.5">Festival operating hours, holiday schedules, and service updates.</p>
            </div>
            <div className="md:col-span-3 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inAppPrefs.system}
                  onChange={(e) => setInAppPrefs(p => ({ ...p, system: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>In-App Center</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushPrefs.system}
                  onChange={(e) => setPushPrefs(p => ({ ...p, system: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>Web Push</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPrefs.system}
                  onChange={(e) => setEmailPrefs(p => ({ ...p, system: e.target.checked }))}
                  className="rounded text-sky-600 w-4 h-4"
                />
                <span>Brevo Email</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Essential payment receipts and account security notices remain active for compliance.
          </p>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
