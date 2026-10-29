import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Mail, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  X,
  RotateCcw
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState('ANALYTICS');
  const [analytics, setAnalytics] = useState(null);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [inspectEmail, setInspectEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    const token = localStorage.getItem('sri_ramu_token');
    Promise.all([
      fetch('http://localhost:5000/api/admin/notifications/analytics', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('http://localhost:5000/api/admin/notifications/delivery-logs', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('http://localhost:5000/api/admin/notifications/email-logs', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([analyticsData, deliveryData, emailData]) => {
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
      if (deliveryData.success) setDeliveryLogs(deliveryData.logs || []);
      if (emailData.success) setEmailLogs(emailData.logs || []);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetry = async (logId, type) => {
    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/notifications/retry/${logId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      alert('Retry triggered successfully!');
      fetchData();
    } catch (e) {
      alert(`Retry failed: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Notification Logs &amp; Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time delivery health, inspect Brevo email HTML, and audit channel success rates.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setTab('ANALYTICS')}
            className={`px-3 py-1.5 rounded-lg transition ${tab === 'ANALYTICS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('DELIVERY_LOGS')}
            className={`px-3 py-1.5 rounded-lg transition ${tab === 'DELIVERY_LOGS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
          >
            Channel Logs ({deliveryLogs.length})
          </button>
          <button
            onClick={() => setTab('EMAIL_LOGS')}
            className={`px-3 py-1.5 rounded-lg transition ${tab === 'EMAIL_LOGS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
          >
            Brevo Emails ({emailLogs.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading metrics &amp; logs...</div>
      ) : (
        <>
          {tab === 'ANALYTICS' && analytics && (
            <div className="space-y-6">
              {/* Analytics Top Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Notifications</span>
                  <div className="text-3xl font-black text-slate-900 mt-1">{analytics.totalNotifications}</div>
                  <div className="text-xs text-slate-500 mt-1">{analytics.unreadNotifications} unread in pipeline</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Brevo Email Delivery</span>
                  <div className="text-3xl font-black text-emerald-600 mt-1">{analytics.email.successRate}%</div>
                  <div className="text-xs text-slate-500 mt-1">{analytics.email.sent} sent • {analytics.email.failed} failed</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Web Push Delivery</span>
                  <div className="text-3xl font-black text-sky-600 mt-1">{analytics.push.successRate}%</div>
                  <div className="text-xs text-slate-500 mt-1">{analytics.push.sent} sent • {analytics.push.failed} failed</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Failed Deliveries</span>
                  <div className="text-3xl font-black text-rose-600 mt-1">{analytics.failedDeliveryCount}</div>
                  <div className="text-xs text-slate-500 mt-1">Ready for manual retry</div>
                </div>
              </div>

              {/* Event Type Breakdown Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4">
                  Notification Volume by Event Type
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  {Object.entries(analytics.typeBreakdown || {}).map(([type, count]) => (
                    <div key={type} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                      <span className="font-mono text-slate-700 font-bold text-[11px] truncate mr-2">{type}</span>
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'DELIVERY_LOGS' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                Multi-Channel Notification Delivery Status Logs
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Event Type</th>
                      <th className="px-4 py-3">Channel</th>
                      <th className="px-4 py-3">Recipient</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deliveryLogs.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8 text-slate-400">No delivery logs recorded yet.</td></tr>
                    ) : (
                      deliveryLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">
                            {log.eventType}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                              {log.channel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 truncate max-w-xs">
                            {log.recipient}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                              log.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {log.status === 'FAILED' && (
                              <button
                                onClick={() => handleRetry(log._id, 'DELIVERY')}
                                className="px-2 py-1 bg-rose-50 text-rose-700 font-bold rounded hover:bg-rose-100 transition inline-flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Retry</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'EMAIL_LOGS' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                Brevo Transactional Email History &amp; Template Previews
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Recipient</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Event Type</th>
                      <th className="px-4 py-3">Provider Status</th>
                      <th className="px-4 py-3 text-right">Inspect Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {emailLogs.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8 text-slate-400">No emails dispatched yet.</td></tr>
                    ) : (
                      emailLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {log.recipient}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium truncate max-w-xs">
                            {log.subject}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                            {log.eventType}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.providerStatus === 'DELIVERED' || log.providerStatus === 'SIMULATED_SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {log.providerStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setInspectEmail(log)}
                              className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-lg hover:bg-sky-100 transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View HTML</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Email HTML Preview Modal */}
      {inspectEmail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Brevo Email Template Inspector</span>
                <h3 className="font-bold text-sm truncate">{inspectEmail.subject}</h3>
              </div>
              <button onClick={() => setInspectEmail(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 text-xs text-slate-600 flex justify-between">
              <div>To: <strong>{inspectEmail.recipient}</strong> ({inspectEmail.recipientName})</div>
              <div>Status: <strong>{inspectEmail.providerStatus}</strong></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div 
                className="bg-white p-4 rounded-xl shadow-xs border border-slate-200"
                dangerouslySetInnerHTML={{ __html: inspectEmail.htmlPreview }}
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                onClick={() => setInspectEmail(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
