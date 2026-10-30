import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import soundManager from '../utils/soundAlerts';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Radio, 
  User, 
  ShieldCheck, 
  ShoppingBag, 
  Calculator, 
  FileText, 
  HelpCircle,
  Menu,
  X,
  Sparkles,
  Sliders
} from 'lucide-react';

export default function Navbar({ onOpenTestModal, currentTab, setCurrentTab }) {
  const { user, logout } = useAuth();
  const { unreadCount, setIsDrawerOpen } = useNotifications();
  const { isConnected, liveCounters } = useSocket();
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
    if (!next) {
      soundManager.testSound('ORDER');
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">Sri Ramu Digital Press Pressroom</span>
          <span className="hidden sm:inline text-slate-400">• High Speed Flex &amp; 4-Color Offset Heidelberg Machine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Call Press Desk: <strong className="text-sky-400">+91 98480 12345</strong></span>
          <button 
            onClick={onOpenTestModal}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-400/30 flex items-center gap-1 transition"
          >
            <Sparkles className="w-3 h-3" />
            20-Scenario Test Suite
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <img src="/images/logo.svg" alt="Sri Ramu Digital" className="h-10 w-auto" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-medium text-sm text-slate-600">
            {!isAdmin ? (
              <>
                <button 
                  onClick={() => setCurrentTab('home')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'home' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setCurrentTab('products')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'products' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Print Catalog
                </button>
                <button 
                  onClick={() => setCurrentTab('calculator')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'calculator' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Price Calculator
                </button>
                <button 
                  onClick={() => setCurrentTab('orders')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'orders' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  My Orders
                </button>
                <button 
                  onClick={() => setCurrentTab('requests')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'requests' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Custom Quotes
                </button>
                <button 
                  onClick={() => setCurrentTab('preferences')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'preferences' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Preferences
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setCurrentTab('admin-dashboard')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'admin-dashboard' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setCurrentTab('admin-orders')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'admin-orders' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Orders
                  {liveCounters.newOrders > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full font-bold">
                      {liveCounters.newOrders}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setCurrentTab('admin-payments')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'admin-payments' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Payments
                  {liveCounters.pendingPayments > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full font-bold">
                      {liveCounters.pendingPayments}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setCurrentTab('admin-requests')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'admin-requests' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Quotes &amp; Requests
                </button>
                <button 
                  onClick={() => setCurrentTab('admin-services')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'admin-services' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Services &amp; Categories
                </button>
                <button 
                  onClick={() => setCurrentTab('admin-announcements')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'admin-announcements' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Announcements
                </button>
                <button 
                  onClick={() => setCurrentTab('admin-analytics')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'admin-analytics' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Logs &amp; Analytics
                </button>
                <button 
                  onClick={() => setCurrentTab('admin-settings')}
                  className={`px-3 py-2 rounded-lg transition ${currentTab === 'admin-settings' ? 'text-sky-600 bg-sky-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Settings
                </button>
              </>
            )}
          </nav>

          {/* Action Tools: Role Switcher, Sound Alert, Notification Bell */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-Time Socket Status */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              }`}
              title={isConnected ? 'Live real-time socket connected' : 'Reconnecting to notification engine...'}
            >
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`} />
              <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>

            {/* Admin Sound Alert Control */}
            {isAdmin && (
              <button
                onClick={toggleSound}
                className={`p-2 rounded-lg border text-sm flex items-center gap-1.5 transition ${
                  isMuted 
                    ? 'bg-slate-100 text-slate-500 border-slate-300' 
                    : 'bg-sky-50 text-sky-700 border-sky-300'
                }`}
                title={isMuted ? 'Notification sounds muted. Click to enable sound.' : 'Sounds enabled. Click to mute.'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
                <span className="hidden lg:inline text-xs font-semibold">{isMuted ? 'Muted' : 'Sound ON'}</span>
              </button>
            )}

            {/* Unread Notification Bell */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Open Notification Center"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[10px] font-bold items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </button>

           
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {!isAdmin ? (
            <>
              <button onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Home</button>
              <button onClick={() => { setCurrentTab('products'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Print Catalog</button>
              <button onClick={() => { setCurrentTab('calculator'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Price Calculator</button>
              <button onClick={() => { setCurrentTab('orders'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">My Orders</button>
              <button onClick={() => { setCurrentTab('requests'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Custom Quotes</button>
              <button onClick={() => { setCurrentTab('preferences'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Notification Preferences</button>
            </>
          ) : (
            <>
              <button onClick={() => { setCurrentTab('admin-dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Dashboard</button>
              <button onClick={() => { setCurrentTab('admin-orders'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Orders</button>
              <button onClick={() => { setCurrentTab('admin-payments'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Payments</button>
              <button onClick={() => { setCurrentTab('admin-requests'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Quotes &amp; Requests</button>
              <button onClick={() => { setCurrentTab('admin-services'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Services &amp; Categories</button>
              <button onClick={() => { setCurrentTab('admin-announcements'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Announcements</button>
              <button onClick={() => { setCurrentTab('admin-analytics'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Logs &amp; Analytics</button>
              <button onClick={() => { setCurrentTab('admin-settings'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Notification Settings</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
