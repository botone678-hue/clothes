import React, { useState, useEffect } from 'react';
import { db, subscribeToEvent } from '../lib/storage';
import { Order } from '../types';
import { OrderTrackingTimeline } from '../components/common/OrderTrackingTimeline';
import { Search, Package, MapPin, Calendar, Clock, Phone, AlertCircle, Sparkles } from 'lucide-react';

interface TrackingPageProps {
  initialOrderId?: string;
  setCurrentTab: (tab: string) => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ initialOrderId, setCurrentTab }) => {
  const [searchTerm, setSearchTerm] = useState(initialOrderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (termToUse?: string) => {
    const term = (termToUse ?? searchTerm).trim();
    if (!term) return;

    setLoading(true);
    setSearched(true);

    const orders = await db.getOrders();
    const found = orders.find(
      (o) =>
        o.order_number.toLowerCase() === term.toLowerCase() ||
        o.id === term ||
        (o.customer_phone && o.customer_phone.includes(term))
    );

    setOrder(found || null);
    setLoading(false);
  };

  useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  // Realtime subscription to live update tracked order status/payment
  useEffect(() => {
    const unsub = subscribeToEvent('orders', async () => {
      if (searchTerm.trim()) {
        const orders = await db.getOrders();
        const found = orders.find(
          (o) =>
            o.order_number.toLowerCase() === searchTerm.trim().toLowerCase() ||
            o.id === searchTerm.trim() ||
            (o.customer_phone && o.customer_phone.includes(searchTerm.trim()))
        );
        if (found) {
          setOrder(found);
        }
      }
    });

    return () => unsub();
  }, [searchTerm]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold border border-sky-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Operations Feed</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Track Your Laundry Order
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Enter your unique order number (e.g. <strong>CSL-1023</strong>) or phone number to see live pickup, washing,
          and delivery status in Eldoret.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              id="tracking-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Order # (e.g. CSL-1023) or Phone (0741...)"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            id="track-order-submit-btn"
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Track Order'
            )}
          </button>
        </form>
      </div>

      {/* Order Results */}
      {order ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-fade-in">
          {/* Order Header Summary */}
          <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-sky-200 uppercase tracking-wider">
                  Order Details
                </span>
                <h2 className="text-2xl font-black text-white mt-0.5">#{order.order_number}</h2>
                <p className="text-xs text-sky-100 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-sky-200 block">Total Amount</span>
                <span className="text-2xl font-black text-amber-300">
                  KES {order.total.toLocaleString()}
                </span>
                <span className="block text-[11px] uppercase font-bold text-sky-100 mt-0.5">
                  Payment: {order.payment_status} ({order.payment_method})
                </span>
              </div>
            </div>

            {/* Quick Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs text-sky-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-300 flex-shrink-0" />
                <span>
                  <strong>Pickup:</strong> {order.pickup_area} ({order.pickup_address_text})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-300 flex-shrink-0" />
                <span>
                  <strong>Date:</strong> {order.pickup_date} ({order.pickup_time})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-300 flex-shrink-0" />
                <span>
                  <strong>Items:</strong> {order.items?.length || 1} Service(s)
                </span>
              </div>
            </div>
          </div>

          {/* Timeline & Items Breakdown */}
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Live Progress Timeline</h3>
              <OrderTrackingTimeline
                status={order.status}
                pickupDate={order.pickup_date}
                pickupTime={order.pickup_time}
                driverName={order.driver_name}
                driverPhone={order.driver_phone}
              />
            </div>

            {/* Garment Items list */}
            {order.items && order.items.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Garment Care Breakdown</h4>
                <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl p-4">
                  {order.items.map((it) => (
                    <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{it.service_name}</span>
                        <span className="text-slate-500 ml-2">x {it.quantity}</span>
                        {it.notes && <p className="text-[11px] text-slate-400 mt-0.5">{it.notes}</p>}
                      </div>
                      <span className="font-bold text-slate-900">KES {it.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between text-xs text-slate-600">
                    <span>Delivery Fee (Eldoret)</span>
                    <span>KES {order.delivery_fee.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 flex justify-between text-sm font-black text-slate-900 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span className="text-sky-700">KES {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : searched ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">No Order Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find an order matching "{searchTerm}". Please double check your order number or contact our Hawaii hub at 0741775878.
          </p>
          <button
            onClick={() => setCurrentTab('book')}
            className="px-6 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition cursor-pointer mt-2"
          >
            Create a New Laundry Order
          </button>
        </div>
      ) : null}
    </div>
  );
};
