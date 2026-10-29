import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';
import soundManager from '../utils/soundAlerts';
import { 
  ShoppingBag, 
  CreditCard, 
  FileText, 
  Bell, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Play
} from 'lucide-react';

export default function AdminDashboardPage({ onNavigate, onOpenTestModal }) {
  const { liveCounters, isConnected, activeAlert, dismissAlert } = useSocket();
  const { unreadCount } = useNotifications();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Alert if active real-time event arrived */}
      {activeAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xl flex items-center justify-between animate-bounceOnce">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Real-Time Admin Alert Received
              </div>
              <h3 className="text-base font-extrabold">{activeAlert.title}</h3>
              <p className="text-xs text-white/90">{activeAlert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                dismissAlert();
                if (activeAlert.type === 'ORDER') onNavigate('admin-orders');
                else if (activeAlert.type === 'PAYMENT') onNavigate('admin-payments');
                else onNavigate('admin-requests');
              }}
              className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-xs hover:bg-slate-100 transition"
            >
              View Event
            </button>
            <button
              onClick={dismissAlert}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl transition"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sri Ramu Digital Press Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Admin Dashboard &amp; Notification Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live monitoring of orders, incoming payment verifications, and multi-channel notification logs.
          </p>
        </div>

        <button
          onClick={onOpenTestModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch 20-Scenario Verification Suite</span>
        </button>
      </div>

      {/* Live Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* New Orders Counter */}
        <div 
          onClick={() => onNavigate('admin-orders')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Orders</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{liveCounters.newOrders}</div>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600">
            <span>View order queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Pending Payments Counter */}
        <div 
          onClick={() => onNavigate('admin-payments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Payments</span>
              <div className="text-3xl font-black text-rose-600 mt-1">{liveCounters.pendingPayments}</div>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-600">
            <span>Verify UTR references</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Pending Requests Counter */}
        <div 
          onClick={() => onNavigate('admin-requests')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Quotes &amp; Requests</span>
              <div className="text-3xl font-black text-amber-600 mt-1">{liveCounters.pendingRequests}</div>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
            <span>Respond &amp; Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Unread Notifications Counter */}
        <div 
          onClick={() => onNavigate('admin-notifications')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unread Alerts</span>
              <div className="text-3xl font-black text-indigo-600 mt-1">{unreadCount}</div>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
            <span>Notification center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Sound System & Auto-Alert Controls Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 rounded-xl text-sky-400">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Real-Time Sound Alert Controls</h3>
              <p className="text-xs text-slate-400">Browser-compatible synthesized audio. Plays once per event.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.setMuted(!soundManager.isMuted);
                window.location.reload();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                soundManager.isMuted 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {soundManager.isMuted ? 'Notifications Muted' : 'Sound Alerts Active'}
            </button>
          </div>
        </div>

        {/* Test Chime Buttons */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Test Professional Sound Alerts:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => soundManager.testSound('ORDER')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test New Order Fanfare</span>
            </button>
            <button
              onClick={() => soundManager.testSound('PAYMENT')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Payment Cash Register Ding</span>
            </button>
            <button
              onClick={() => soundManager.testSound('REQUEST')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Urgent Attention Chime</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => onNavigate('admin-announcements')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-2xs hover:shadow-md transition cursor-pointer"
        >
          <div className="text-sky-600 font-bold text-xs uppercase tracking-wider">Customer Marketing</div>
          <h4 className="font-bold text-base text-slate-900 mt-1">Broadcast Announcement</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Send festive offers and discount coupons across In-App, Web Push, and Brevo promotional email.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('admin-analytics')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-2xs hover:shadow-md transition cursor-pointer"
        >
          <div className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Email &amp; Push Logs</div>
          <h4 className="font-bold text-base text-slate-900 mt-1">Delivery Logs &amp; Brevo Inspector</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Inspect exact Brevo transactional email rendered HTML and monitor delivery success rates.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('admin-settings')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-2xs hover:shadow-md transition cursor-pointer"
        >
          <div className="text-indigo-600 font-bold text-xs uppercase tracking-wider">System Matrix</div>
          <h4 className="font-bold text-base text-slate-900 mt-1">Notification Channel Matrix</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Configure which events trigger In-App, Web Push, Email, Admin Sound, and Admin Email alerts.
          </p>
        </div>
      </div>
    </div>
  );
}
