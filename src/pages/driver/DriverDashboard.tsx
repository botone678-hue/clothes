import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, subscribeToEvent } from '../../lib/storage';
import { Order, OrderStatus } from '../../types';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Navigation,
  RefreshCw,
  User,
  ShieldAlert,
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'in_transit' | 'completed'>('assigned');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadDriverOrders = async () => {
    setLoading(true);
    // Get all orders assigned to this driver or pending assignment in Eldoret
    const all = await db.getOrders();
    const driverOrders = all.filter((o) => o.driver_id === user?.id || !o.driver_id);
    setOrders(driverOrders);
    setLoading(false);
  };

  useEffect(() => {
    loadDriverOrders();
    const unsub = subscribeToEvent('orders', () => {
      loadDriverOrders();
    });
    return () => unsub();
  }, [user]);

  // Status update helpers
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, actionLabel: string) => {
    setUpdatingId(orderId);
    try {
      await db.updateOrderStatus(
        orderId,
        newStatus,
        user?.id || 'drv-1',
        user?.full_name || 'Driver',
        `Driver action: ${actionLabel}`
      );
      await loadDriverOrders();
    } catch (e) {
      console.error('Driver status update error', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAcceptJob = async (order: Order) => {
    setUpdatingId(order.id);
    try {
      await db.assignDriver(order.id, user?.id || 'drv-1', user?.full_name || 'Driver');
      await db.updateOrderStatus(
        order.id,
        'pickup_scheduled',
        user?.id || 'drv-1',
        user?.full_name || 'Driver',
        'Driver accepted pickup job'
      );
      await loadDriverOrders();
    } catch (e) {
      console.error('Accept job error', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const assignedPickups = orders.filter(
    (o) =>
      o.status === 'driver_assigned' ||
      o.status === 'pickup_scheduled' ||
      o.status === 'pending' ||
      o.status === 'confirmed'
  );

  const inTransit = orders.filter(
    (o) =>
      o.status === 'picked_up' ||
      o.status === 'processing' ||
      o.status === 'ready_for_delivery' ||
      o.status === 'out_for_delivery'
  );

  const completed = orders.filter((o) => o.status === 'delivered' || o.status === 'completed');

  // Authorization Security Guard
  if (user && user.role !== 'driver' && user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Driver Portal Restricted
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            This portal is restricted to authorized Clothes Spa Laundry dispatch drivers and operations personnel. Your current account ({user.email}) is signed in as a <span className="font-bold capitalize">{user.role}</span>.
          </p>
        </div>
        <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-600 border border-slate-200">
          To view active pickup and delivery routes, please sign in with an authorized driver account.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Driver Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20">
              <Truck className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Driver Dispatch Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.full_name || 'Driver'}</h1>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Active in Hawaii Area, Elgon View & Eldoret Route
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDriverOrders}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="bg-emerald-950/80 px-4 py-2 rounded-2xl border border-emerald-700/50 text-right">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Today's Jobs</span>
              <span className="text-lg font-black text-white">{orders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'assigned'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Pickups Awaiting ({assignedPickups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('in_transit')}
          className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'in_transit'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>In Transit / Spa ({inTransit.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Delivered ({completed.length})</span>
        </button>
      </div>

      {/* Orders List for Active Tab */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading driver assignments...</div>
      ) : (
        <div className="space-y-4">
          {(activeTab === 'assigned' ? assignedPickups : activeTab === 'in_transit' ? inTransit : completed).length ===
          0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900">No Orders in this Queue</h3>
              <p className="text-xs text-slate-500">All assigned jobs are currently handled.</p>
            </div>
          ) : (
            (activeTab === 'assigned' ? assignedPickups : activeTab === 'in_transit' ? inTransit : completed).map(
              (ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-5"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-lg">#{ord.order_number}</h3>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-sky-100 text-sky-800">
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Client: <strong className="text-slate-800">{ord.customer_name}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">
                        KES {ord.total.toLocaleString()}
                      </span>
                      <p className="text-[11px] text-emerald-700 font-semibold uppercase">
                        {ord.payment_status} ({ord.payment_method})
                      </p>
                    </div>
                  </div>

                  {/* Customer Location & Contact for Driver */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 rounded-2xl p-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Pickup Area</span>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        {ord.pickup_area}
                      </p>
                      <p className="text-slate-600">{ord.pickup_address_text}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Scheduled Time</span>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        {ord.pickup_date}
                      </p>
                      <p className="text-slate-600">{ord.pickup_time}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Customer Hotline</span>
                      <p className="font-bold text-slate-900">{ord.customer_phone || '0741775878'}</p>
                      {ord.customer_phone && (
                        <a
                          href={`tel:${ord.customer_phone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline pt-1"
                        >
                          <Phone className="w-3.5 h-3.5" /> Direct Call Client
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Special instructions */}
                  {ord.special_instructions && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900">
                      <strong>Client Note:</strong> {ord.special_instructions}
                    </div>
                  )}

                  {/* Driver Action Transition Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                    {/* If assigned, accept button */}
                    {ord.status === 'driver_assigned' && (
                      <button
                        disabled={updatingId === ord.id}
                        onClick={() => handleAcceptJob(ord)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                      >
                        Accept Assignment
                      </button>
                    )}

                    {/* If pickup scheduled, mark picked up */}
                    {ord.status === 'pickup_scheduled' && (
                      <button
                        disabled={updatingId === ord.id}
                        onClick={() =>
                          handleUpdateStatus(
                            ord.id,
                            'picked_up',
                            'Driver collected laundry from Eldoret customer'
                          )
                        }
                        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Picked Up & En Route to Spa</span>
                      </button>
                    )}

                    {/* If ready for delivery, start delivery */}
                    {ord.status === 'ready_for_delivery' && (
                      <button
                        disabled={updatingId === ord.id}
                        onClick={() =>
                          handleUpdateStatus(ord.id, 'out_for_delivery', 'Driver started delivery run')
                        }
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Start Doorstep Delivery</span>
                      </button>
                    )}

                    {/* If out for delivery, mark delivered */}
                    {ord.status === 'out_for_delivery' && (
                      <button
                        disabled={updatingId === ord.id}
                        onClick={() =>
                          handleUpdateStatus(
                            ord.id,
                            'delivered',
                            'Driver delivered fresh garments to customer'
                          )
                        }
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Delivered to Customer</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            )
          )}
        </div>
      )}
    </div>
  );
};
