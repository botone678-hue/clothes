import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, subscribeToEvent } from '../lib/storage';
import { Order } from '../types';
import { Package, Clock, MapPin, Calendar, Eye, RefreshCw, Sparkles } from 'lucide-react';

interface CustomerOrdersProps {
  setCurrentTab: (tab: string) => void;
  onTrackOrder: (orderId: string) => void;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ setCurrentTab, onTrackOrder }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const all = await db.getOrders({ customerId: user?.id });
      setOrders(all);
    } catch (error) {
      console.error('Failed to load customer orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    const unsub = subscribeToEvent('orders', () => void loadOrders());
    return () => unsub();
  }, [user?.id]);

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'processing':
      case 'picked_up':
      case 'out_for_delivery':
        return 'bg-sky-100 text-sky-800 border-sky-200 animate-pulse';
      case 'driver_assigned':
      case 'pickup_scheduled':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Customer Laundry Hub</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Laundry Orders & History</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void loadOrders()} className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition cursor-pointer" title="Refresh orders">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setCurrentTab('book')} className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /><span>Book New Laundry</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[{ id: 'all', label: 'All Orders' }, { id: 'pending', label: 'Pending' }, { id: 'processing', label: 'In Washing/Spa' }, { id: 'out_for_delivery', label: 'Out for Delivery' }, { id: 'delivered', label: 'Delivered' }].map((tab) => (
          <button key={tab.id} type="button" onClick={() => setFilterStatus(tab.id)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${filterStatus === tab.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading your orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">You haven't placed any laundry orders yet. Experience Eldoret's premier garment care with doorstep pickup!</p>
          <button type="button" onClick={() => setCurrentTab('book')} className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer">Book My First Laundry Pickup</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const safeTotal = Number(order.total ?? 0);
            const safeCreatedAt = order.created_at ? new Date(order.created_at) : null;
            const safeStatus = String(order.status ?? 'pending');
            return (
              <div key={order.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold"><Package className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">#{order.order_number}</h3>
                      <p className="text-[11px] text-slate-400">
                        {safeCreatedAt && !Number.isNaN(safeCreatedAt.getTime()) ? `${safeCreatedAt.toLocaleDateString()} at ${safeCreatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Date unavailable'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getStatusBadge(safeStatus)}`}>{safeStatus.replaceAll('_', ' ')}</span>
                    <span className="text-base font-black text-slate-900">KES {safeTotal.toLocaleString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-600 flex-shrink-0" /><span><strong>Pickup:</strong> {order.pickup_area ?? 'Not specified'} ({order.pickup_address_text ?? 'Address unavailable'})</span></div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-600 flex-shrink-0" /><span><strong>Schedule:</strong> {order.pickup_date ?? 'Not scheduled'} ({order.pickup_time ?? 'Time unavailable'})</span></div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-sky-600 flex-shrink-0" /><span><strong>Payment:</strong> {order.payment_status ?? 'pending'} ({order.payment_method ?? 'Not specified'})</span></div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl flex flex-wrap gap-2 text-[11px] text-slate-700">
                    {order.items.map((it) => <span key={it.id} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium">{it.service_name} (x{it.quantity})</span>)}
                  </div>
                )}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => onTrackOrder(order.id)} className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"><Eye className="w-4 h-4" /><span>Track Live Status</span></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
