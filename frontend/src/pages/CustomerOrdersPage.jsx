import React, { useState, useEffect } from 'react';
import OrderTimeline from '../components/OrderTimeline';
import PaymentModal from '../components/PaymentModal';
import { 
  Package, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ExternalLink,
  Ban,
  Printer,
  ChevronRight
} from 'lucide-react';

export default function CustomerOrdersPage({ selectedOrderId, onClearSelectedOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);

  const fetchOrders = () => {
    const token = localStorage.getItem('sri_ramu_token');
    fetch('http://localhost:5000/api/orders/my-orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders || []);
          if (selectedOrderId) {
            const found = data.orders.find(o => o.orderId === selectedOrderId || o._id === selectedOrderId);
            if (found) setSelectedOrder(found);
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
  }, [selectedOrderId]);

  const handleCancelRequest = async (orderId) => {
    const reason = prompt('Please specify the reason for cancellation:');
    if (!reason) return;

    const token = localStorage.getItem('sri_ramu_token');
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cancellation request failed');
      alert('Cancellation request submitted to Admin. You will be notified as soon as Admin reviews it.');
      fetchOrders();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ORDER_PLACED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Order Placed</span>;
      case 'PAYMENT_VERIFIED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Payment Verified</span>;
      case 'ORDER_ACCEPTED':
      case 'DESIGN_STARTED':
      case 'PRINTING_STARTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Printing in Progress</span>;
      case 'READY_FOR_PICKUP':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">Ready for Pickup</span>;
      case 'DELIVERED':
      case 'ORDER_COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Completed</span>;
      case 'ORDER_CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">My Print Orders</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track production progress, view payment verification statuses, and see chronological notification timelines.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500">
            Browse our wide format flex printing, vinyl signage, and visiting cards catalog to place your first job.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order List */}
          <div className="lg:col-span-2 space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white rounded-2xl border p-5 transition cursor-pointer ${
                  selectedOrder?._id === order._id
                    ? 'border-sky-500 ring-2 ring-sky-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-sky-700">#{order.orderId}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="py-3 space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">
                        {item.name} ({item.quantity} {item.unit})
                      </span>
                      <span className="text-slate-500 font-mono">₹{item.lineTotal}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400">Total Payable:</span>
                    <span className="ml-1 text-base font-black text-slate-900">₹{order.totalAmount}</span>
                    {order.paymentStatus === 'PAID' ? (
                      <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ PAID
                      </span>
                    ) : (
                      <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        PAYMENT PENDING
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.paymentStatus !== 'PAID' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentModalOrder(order);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Online</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1"
                    >
                      <span>Timeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Detail / Chronological Timeline Box */}
          <div className="space-y-4">
            {selectedOrder ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-24">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs text-sky-600 font-bold">Order Details &amp; Timeline</span>
                    <h3 className="text-lg font-black text-slate-900">#{selectedOrder.orderId}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>

                {/* Items specification */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="font-bold text-slate-700">Specifications:</div>
                  {selectedOrder.items?.map((it, i) => (
                    <div key={i} className="text-slate-600">
                      • {it.name} - {it.quantity} {it.unit}
                      {it.dimensions && ` (${it.dimensions.width}×${it.dimensions.height} ft, ${it.dimensions.sqft} sq.ft)`}
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Final Amount:</span>
                    <span className="text-sky-700">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Custom Artwork Photos & Description */}
                {(selectedOrder.customDescription || (selectedOrder.customPhotos && selectedOrder.customPhotos.length > 0)) && (
                  <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-3 text-xs space-y-2">
                    <div className="font-bold text-sky-950 flex items-center justify-between">
                      <span>Custom Artwork &amp; Design Notes:</span>
                      {selectedOrder.customPhotos?.length > 0 && (
                        <span className="text-[10px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full font-bold">
                          {selectedOrder.customPhotos.length} Attached Photo(s)
                        </span>
                      )}
                    </div>

                    {selectedOrder.customDescription && (
                      <p className="text-slate-600 bg-white p-2 rounded-lg border border-sky-100 italic">
                        "{selectedOrder.customDescription}"
                      </p>
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
                              alt={`Custom Artwork ${ph.slot || idx + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-slate-900/80 text-[9px] font-bold text-sky-300">
                              Slot {ph.slot || idx + 1}
                            </div>
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold">
                              🔍 Click to View
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Chronological Notification Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Chronological Production Timeline
                  </h4>
                  <OrderTimeline timeline={selectedOrder.timeline || []} />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  {selectedOrder.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => setPaymentModalOrder(selectedOrder)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Submit Payment Information</span>
                    </button>
                  )}

                  {selectedOrder.status !== 'ORDER_CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleCancelRequest(selectedOrder.orderId)}
                      className="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs rounded-xl transition border border-slate-200"
                    >
                      Request Order Cancellation
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <Printer className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Select an order</p>
                <p className="text-xs mt-1">Click on any order to view its chronological notification &amp; printing timeline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {enlargedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-4 text-white relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="font-bold text-sm text-sky-400">
                Artwork Preview: Slot {enlargedPhoto.slot}
              </div>
              <button 
                onClick={() => setEnlargedPhoto(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-square max-h-[70vh] w-full flex items-center justify-center p-2 bg-slate-950 rounded-xl mt-3 overflow-hidden">
              <img 
                src={enlargedPhoto.dataUrl} 
                alt="Enlarged Artwork Preview" 
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

      {/* Payment Modal */}
      {paymentModalOrder && (
        <PaymentModal
          order={paymentModalOrder}
          onClose={() => setPaymentModalOrder(null)}
          onSuccess={() => {
            setPaymentModalOrder(null);
            alert('Payment submitted successfully! Admin will verify and you will receive instant confirmation.');
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
