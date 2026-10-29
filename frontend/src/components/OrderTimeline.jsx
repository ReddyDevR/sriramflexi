import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Printer, 
  CreditCard, 
  ShieldCheck, 
  Package, 
  Truck, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function OrderTimeline({ timeline = [] }) {
  const getStageIcon = (stage) => {
    switch (stage) {
      case 'ORDER_PLACED':
        return <Package className="w-4 h-4 text-sky-600" />;
      case 'PAYMENT_SUBMITTED':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'PAYMENT_VERIFIED':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'ORDER_ACCEPTED':
      case 'DESIGN_STARTED':
      case 'PRINTING_STARTED':
      case 'PRINTING_COMPLETED':
        return <Printer className="w-4 h-4 text-indigo-600" />;
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'ORDER_COMPLETED':
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'ORDER_CANCELLED':
      case 'PAYMENT_REJECTED':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timeline.map((event, eventIdx) => (
          <li key={eventIdx}>
            <div className="relative pb-8">
              {eventIdx !== timeline.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white shadow-xs flex items-center justify-center ring-4 ring-slate-50">
                    {getStageIcon(event.stage)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {event.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <div className="text-[10px] text-slate-400">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
