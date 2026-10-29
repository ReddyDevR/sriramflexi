import React, { useState, useEffect } from 'react';
import { Sliders, Save, Check, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = () => {
    const token = localStorage.getItem('sri_ramu_token');
    fetch(`${API_BASE_URL}/api/admin/notifications/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettings(data.settings || {});
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleEventChannel = (eventType, channel) => {
    setSettings(prev => ({
      ...prev,
      [eventType]: {
        ...prev[eventType],
        [channel]: !prev[eventType]?.[channel]
      }
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert(`Error saving: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Notification Channel Matrix Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure backend notification routing: which events send In-App, Push, Email, Admin Sound, or Admin Email.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Channel Matrix</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Notification channel matrix updated and active across backend engine!</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading settings...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Business Event Type</th>
                  <th className="px-5 py-3.5 text-center">In-App</th>
                  <th className="px-5 py-3.5 text-center">Web Push</th>
                  <th className="px-5 py-3.5 text-center">Brevo Email</th>
                  <th className="px-5 py-3.5 text-center">Admin Sound</th>
                  <th className="px-5 py-3.5 text-center">Admin Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(settings).map(([type, channels]) => (
                  <tr key={type} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">
                      {type}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!channels?.inApp}
                        onChange={() => toggleEventChannel(type, 'inApp')}
                        className="rounded text-sky-600 w-4 h-4"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!channels?.push}
                        onChange={() => toggleEventChannel(type, 'push')}
                        className="rounded text-sky-600 w-4 h-4"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!channels?.email}
                        onChange={() => toggleEventChannel(type, 'email')}
                        className="rounded text-sky-600 w-4 h-4"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!channels?.adminSound}
                        onChange={() => toggleEventChannel(type, 'adminSound')}
                        className="rounded text-amber-600 w-4 h-4"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!channels?.adminEmail}
                        onChange={() => toggleEventChannel(type, 'adminEmail')}
                        className="rounded text-purple-600 w-4 h-4"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
