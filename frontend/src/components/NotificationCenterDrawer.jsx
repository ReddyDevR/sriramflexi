import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  CheckCheck, 
  Trash2, 
  Bell, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  Printer, 
  Sparkles, 
  Tag, 
  RefreshCw,
  Send,
  Smartphone
} from 'lucide-react';

export default function NotificationCenterDrawer({ onNavigate }) {
  const { 
    notifications, 
    unreadCount, 
    filterCategory, 
    setFilterCategory, 
    isDrawerOpen, 
    setIsDrawerOpen, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isPushSubscribed,
    subscribePushNotification,
    fetchNotifications,
    isLoading
  } = useNotifications();

  const { user } = useAuth();
  const [subscribing, setSubscribing] = useState(false);

  if (!isDrawerOpen) return null;

  const handlePushSubscribe = async () => {
    setSubscribing(true);
    await subscribePushNotification();
    setSubscribing(false);
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'IMPORTANT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = (type) => {
    if (type.startsWith('PAYMENT_')) return <CreditCard className="w-5 h-5 text-emerald-600" />;
    if (type.startsWith('ORDER_') || type.includes('PRINTING')) return <Printer className="w-5 h-5 text-sky-600" />;
    if (type.startsWith('QUOTATION_') || type === 'CUSTOMER_REQUEST') return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    if (type === 'COUPON' || type === 'OFFER') return <Tag className="w-5 h-5 text-purple-600" />;
    return <Bell className="w-5 h-5 text-slate-500" />;
  };

  const handleActionClick = (notif) => {
    if (!notif.read) markAsRead(notif._id);
    setIsDrawerOpen(false);

    if (notif.data?.orderId) {
      onNavigate('orders', notif.data.orderId);
    } else if (notif.data?.actionUrl?.includes('payments')) {
      onNavigate(user?.role === 'ADMIN' ? 'admin-payments' : 'orders');
    } else if (notif.data?.actionUrl?.includes('requests')) {
      onNavigate(user?.role === 'ADMIN' ? 'admin-requests' : 'requests');
    } else if (notif.data?.actionUrl?.includes('products')) {
      onNavigate('products');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-700 to-sky-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-lg">
                <Bell className="w-5 h-5 text-sky-200" />
              </div>
              <div>
                <h2 className="text-base font-bold">Notification Center</h2>
                <p className="text-xs text-sky-200">
                  {unreadCount > 0 ? `${unreadCount} unread communications` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={fetchNotifications}
                className="p-1.5 text-sky-200 hover:text-white rounded-lg hover:bg-white/10 transition"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-sky-200 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Web Push Prompt Banner (if not subscribed) */}
          {!isPushSubscribed && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-900">
                <Smartphone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Enable Web Push to get real-time print alerts!</span>
              </div>
              <button
                onClick={handlePushSubscribe}
                disabled={subscribing}
                className="text-xs font-semibold px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded transition shadow-sm"
              >
                {subscribing ? 'Enabling...' : 'Enable Push'}
              </button>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs font-medium no-scrollbar">
            {['ALL', 'ORDERS', 'PAYMENTS', 'REQUESTS', 'OFFERS', 'IMPORTANT'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                  filterCategory === cat
                    ? 'bg-sky-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bulk Controls */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-white border-b border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Showing {notifications.length} alerts</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark All Read
                </button>
              )}
            </div>
          )}

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Bell className="w-12 h-12 mx-auto stroke-[1.2] text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-600">No Notifications Found</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Updates on flex printing, payments, quotations, and offers will appear right here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !notif.read 
                      ? 'bg-sky-50/70 border-sky-200 shadow-xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs mt-0.5">
                      {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityStyle(notif.priority)}`}>
                          {notif.priority}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className={`text-sm font-semibold mt-1 ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Channels & Meta info */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {notif.data?.orderId && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 rounded font-bold">
                            #{notif.data.orderId}
                          </span>
                        )}
                        {notif.channels?.map(ch => (
                          <span key={ch} className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-500 rounded font-medium">
                            {ch}
                          </span>
                        ))}
                      </div>

                      {/* Direct Action Button */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                        {notif.data?.actionText ? (
                          <button
                            onClick={() => handleActionClick(notif)}
                            className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-md flex items-center gap-1.5 transition shadow-2xs"
                          >
                            <span>{notif.data.actionText}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span></span>
                        )}

                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif._id)}
                              className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                              title="Mark as read"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif._id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
