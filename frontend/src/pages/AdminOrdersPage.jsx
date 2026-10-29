import React, { useState, useEffect } from 'react';
import OrderTimeline from '../components/OrderTimeline';
import { 
  Package, 
  Printer, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Search,
  Filter,
  Check,
  AlertTriangle
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);

  const fetchOrders = () => {
    const token = localStorage.getItem('sri_ramu_token');
    fetch(`http://localhost:5000/api/orders/admin/all?status=${statusFilter}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders || []);
          if (data.orders.length > 0 && !selectedOrder) {
            setSelectedOrder(data.orders[0]);
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
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    const token = localStorage.getItem('sri_ramu_token');

    try {
      const res = await fetch(`http://localhost:5000/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          statusNotes: statusNotes || `Order updated to ${newStatus.replace(/_/g, ' ')}.`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      alert(`Order updated to ${newStatus.replace(/_/g, ' ')}! Customer notification dispatched.`);
      setStatusNotes('');
      fetchOrders();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ORDER_PLACED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">New Order</span>;
      case 'PAYMENT_VERIFIED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Payment Verified</span>;
      case 'ORDER_ACCEPTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-sky-50 text-sky-700 border border-sky-200">Accepted</span>;
      case 'PRINTING_STARTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">Printing</span>;
      case 'READY_FOR_PICKUP':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Ready for Pickup</span>;
      case 'DELIVERED':
      case 'ORDER_COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Completed</span>;
      case 'ORDER_CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const statusOptions = [
    'ORDER_ACCEPTED',
    'DESIGN_STARTED',
    'DESIGN_REVIEW_REQUIRED',
    'PRINTING_STARTED',
    'PRINTING_COMPLETED',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'ORDER_COMPLETED',
    'ORDER_CANCELLED'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Order Management Desk</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review orders, accept production jobs, and advance print machine stages.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold no-scrollbar">
        {['ALL', 'ORDER_PLACED', 'PAYMENT_VERIFIED', 'ORDER_ACCEPTED', 'PRINTING_STARTED', 'READY_FOR_PICKUP', 'ORDER_COMPLETED'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              statusFilter === st
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Orders List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              No orders found matching this filter.
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white rounded-2xl border p-5 transition cursor-pointer ${
                  selectedOrder?._id === order._id
                    ? 'border-sky-500 ring-2 ring-sky-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-sky-700">#{order.orderId}</span>
                      <span className="text-xs text-slate-500 font-semibold">{order.customerName}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{order.customerPhone || order.customerEmail}</p>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <div className="py-2.5 text-xs text-slate-700 space-y-1">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {it.name} ({it.quantity} {it.unit})</span>
                      <span className="font-mono text-slate-500">₹{it.lineTotal}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <div className="font-bold text-slate-900">
                    Total: <span className="text-sky-700 font-black">₹{order.totalAmount}</span>
                    <span className="ml-2 font-normal text-slate-500">({order.paymentMode})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Stage Controller Box */}
        <div className="space-y-4">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 sticky top-24">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-sky-600">Active Job Control</span>
                <h3 className="text-lg font-black text-slate-900">#{selectedOrder.orderId}</h3>
                <p className="text-xs text-slate-500">{selectedOrder.customerName} ({selectedOrder.customerPhone || selectedOrder.customerEmail})</p>
              </div>

              {/* Customer Custom Photos & Design Notes for Admin */}
              {(selectedOrder.customDescription || (selectedOrder.customPhotos && selectedOrder.customPhotos.length > 0)) && (
                <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-sky-950">Customer Design Instructions:</span>
                    {selectedOrder.customPhotos?.length > 0 && (
                      <span className="text-[10px] font-extrabold bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded-full">
                        {selectedOrder.customPhotos.length} Artwork Photo(s)
                      </span>
                    )}
                  </div>

                  {selectedOrder.customDescription && (
                    <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-sky-100 font-medium">
                      "{selectedOrder.customDescription}"
                    </div>
                  )}

                  {selectedOrder.customPhotos && selectedOrder.customPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {selectedOrder.customPhotos.map((ph, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setEnlargedPhoto(ph)}
                          className="aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-700 relative group cursor-pointer"
                        >
                          <img 
                            src={ph.dataUrl} 
                            alt={`Artwork ${ph.slot || idx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-slate-900/90 text-[9px] font-bold text-sky-300">
                            Slot {ph.slot || idx + 1}
                          </div>
                          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold">
                            🔍 Enlarge
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status Update Control */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">Advance Job Stage</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {statusOptions.map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedOrder.orderId, st)}
                      disabled={isUpdating || selectedOrder.status === st}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold text-left flex justify-between items-center transition ${
                        selectedOrder.status === st
                          ? 'bg-sky-600 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{st.replace(/_/g, ' ')}</span>
                      {selectedOrder.status === st && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Production Notes (Sent in Notification)</label>
                  <input
                    type="text"
                    placeholder="e.g. Roland print completed. Laminating now."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              {/* Chronological Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Order Status History</h4>
                <OrderTimeline timeline={selectedOrder.timeline || []} />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              Select an order to view controls.
            </div>
          )}
        </div>
      </div>

      {/* Enlarged Photo Modal for Admin */}
      {enlargedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 text-white relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="font-bold text-sm text-sky-400">
                Customer Artwork Preview: Slot {enlargedPhoto.slot}
              </div>
              <button 
                onClick={() => setEnlargedPhoto(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="aspect-square max-h-[70vh] w-full flex items-center justify-center p-2 bg-slate-950 rounded-xl mt-3 overflow-hidden">
              <img 
                src={enlargedPhoto.dataUrl} 
                alt="Enlarged Customer Artwork" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="pt-3 text-xs text-slate-400 flex justify-between">
              <span>{enlargedPhoto.name}</span>
              <span>{enlargedPhoto.size}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
