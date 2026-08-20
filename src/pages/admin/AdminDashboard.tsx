import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, subscribeToEvent } from '../../lib/storage';
import { Order, Service, Profile, OrderStatus, PaymentStatus } from '../../types';
import { OrderTrackingTimeline } from '../../components/common/OrderTrackingTimeline';
import {
  Package,
  TrendingUp,
  Truck,
  Users,
  DollarSign,
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  MapPin,
  Calendar,
  X,
  Phone,
  Sparkles,
  Download,
  Settings,
  CreditCard,
  ShieldCheck,
  Check,
  XCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  services: Service[];
  onRefreshServices: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ services, onRefreshServices }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Admin View Tab: 'orders' | 'services' | 'drivers' | 'payments'
  const [adminTab, setAdminTab] = useState<'orders' | 'services' | 'drivers' | 'payments'>('orders');

  // Filter & Search states for Orders
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // Filter & Search states for Payments & Reconciliation
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // New Service Modal
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<any>('wash_fold');
  const [newServicePrice, setNewServicePrice] = useState(200);
  const [newServiceType, setNewServiceType] = useState<any>('per_item');
  const [newServiceDuration, setNewServiceDuration] = useState('24 hours');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // New Driver Modal
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState('Motorcycle KDK 412A');

  const loadData = async () => {
    setLoading(true);
    const [allOrders, allDrivers] = await Promise.all([db.getOrders(), db.getDrivers()]);
    setOrders(allOrders);
    setDrivers(allDrivers);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubOrders = subscribeToEvent('orders', () => loadData());
    const unsubDrivers = subscribeToEvent('drivers', () => loadData());
    return () => {
      unsubOrders();
      unsubDrivers();
    };
  }, []);

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total : 0), 0);
  const activeProcessing = orders.filter((o) => ['picked_up', 'processing', 'ready_for_delivery'].includes(o.status)).length;
  const pendingOrders = orders.filter((o) => ['pending', 'confirmed'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length;
  const pendingVerifications = orders.filter((o) => o.payment_status === 'verification_required').length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer_phone && o.customer_phone.includes(searchQuery));
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchArea = areaFilter === 'all' || o.pickup_area === areaFilter;
    return matchSearch && matchStatus && matchArea;
  });

  // Filtered Payments for Reconciliation Tab
  const filteredPayments = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      (o.customer_phone && o.customer_phone.includes(paymentSearch));
    const matchStatus = paymentStatusFilter === 'all' || o.payment_status === paymentStatusFilter;
    return matchSearch && matchStatus;
  });

  // Handle Order Status Change in Modal
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setIsUpdatingOrder(true);
    await db.updateOrderStatus(
      selectedOrder.id,
      newStatus,
      user?.id || 'admin',
      user?.full_name || 'Admin',
      `Status changed by Admin to ${newStatus}`
    );
    const updated = await db.getOrders();
    setOrders(updated);
    const refreshed = updated.find((o) => o.id === selectedOrder.id);
    if (refreshed) setSelectedOrder(refreshed);
    setIsUpdatingOrder(false);
  };

  // Handle Driver Assignment
  const handleAssignDriver = async (driverId: string) => {
    if (!selectedOrder) return;
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    setIsUpdatingOrder(true);
    await db.assignDriver(selectedOrder.id, driver.id, driver.full_name || driver.name || 'Driver', driver.phone);
    const updated = await db.getOrders();
    setOrders(updated);
    const refreshed = updated.find((o) => o.id === selectedOrder.id);
    if (refreshed) setSelectedOrder(refreshed);
    setIsUpdatingOrder(false);
  };

  // Handle Payment Status Toggle
  const handlePaymentToggle = async (newPaymentStatus: PaymentStatus) => {
    if (!selectedOrder) return;
    setIsUpdatingOrder(true);
    await db.updatePaymentStatus(selectedOrder.id, newPaymentStatus);
    const updated = await db.getOrders();
    setOrders(updated);
    const refreshed = updated.find((o) => o.id === selectedOrder.id);
    if (refreshed) setSelectedOrder(refreshed);
    setIsUpdatingOrder(false);
  };

  // Direct Payment Verification Handler (usable across tables without opening modal)
  const handleDirectPaymentAction = async (orderId: string, newStatus: PaymentStatus) => {
    setIsUpdatingOrder(true);
    await db.updatePaymentStatus(orderId, newStatus);
    const updated = await db.getOrders();
    setOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      const refreshed = updated.find((o) => o.id === orderId);
      if (refreshed) setSelectedOrder(refreshed);
    }
    setIsUpdatingOrder(false);
  };

  // Add Service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.createService({
      name: newServiceName,
      category: newServiceCategory,
      price_type: newServiceType,
      base_price: Number(newServicePrice),
      estimated_duration: newServiceDuration,
      description: newServiceDesc,
      image_url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
    });
    setIsAddingService(false);
    setNewServiceName('');
    setNewServiceDesc('');
    onRefreshServices();
  };

  // Add Driver
  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.createDriver({
      name: newDriverName,
      phone: newDriverPhone,
      vehicle_type: newDriverVehicle,
      zone: 'Hawaii Area & Eldoret',
    });
    setIsAddingDriver(false);
    setNewDriverName('');
    setNewDriverPhone('');
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Welcome Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-slate-900 text-amber-400">
              Operations Center
            </span>
            <span className="text-xs text-slate-500 font-semibold">Hawaii Area Hub, Eldoret</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Clothes Spa Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 transition cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Total Revenue</span>
            <div className="text-2xl font-black text-slate-900 mt-1">KES {totalRevenue.toLocaleString()}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Paid via M-Pesa & Cash</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Pending Bookings</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingOrders}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting dispatch review</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Active in Spa / Transit</span>
            <div className="text-2xl font-black text-sky-600 mt-1">{activeProcessing}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Washing, drying & steam press</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Fulfilled Orders</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{completedOrders}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Delivered in Eldoret</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('orders')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === 'orders'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders Management ({orders.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('payments')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === 'payments'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>M-Pesa Reconciliation & Payments</span>
          {pendingVerifications > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black animate-pulse">
              {pendingVerifications} to verify
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('services')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === 'services'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Services & Pricing ({services.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('drivers')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === 'drivers'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Dispatch Drivers ({drivers.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORDERS MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {adminTab === 'orders' && (
        <div className="space-y-6">
          {/* Filter / Search Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order #, Customer Name, or Phone..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="driver_assigned">Driver Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="processing">Processing</option>
                <option value="ready_for_delivery">Ready for Delivery</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">All Eldoret Areas</option>
                <option value="Hawaii Area">Hawaii Area</option>
                <option value="Elgon View">Elgon View</option>
                <option value="Annex">Annex</option>
                <option value="Kapsoya">Kapsoya</option>
                <option value="Pioneer">Pioneer</option>
                <option value="Eldoret CBD">Eldoret CBD</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Area & Pickup</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Assigned Driver</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center space-y-2">
                        <Package className="w-12 h-12 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-slate-800 text-sm">No orders yet</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          New customer bookings will appear here. The system is active and waiting for pickups across Eldoret.
                        </p>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-black text-slate-900">#{ord.order_number}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{ord.customer_name}</p>
                          <p className="text-slate-400 text-[11px]">{ord.customer_phone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{ord.pickup_area}</p>
                          <p className="text-slate-400 text-[11px]">
                            {ord.pickup_date} ({ord.pickup_time})
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === 'delivered' || ord.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'processing' || ord.status === 'picked_up'
                                ? 'bg-sky-100 text-sky-800'
                                : ord.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.driver_name ? (
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-sky-600" />
                              {ord.driver_name}
                            </span>
                          ) : (
                            <span className="text-rose-500 font-bold text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.payment_status === 'paid' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              PAID
                            </span>
                          ) : ord.payment_status === 'verification_required' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
                              <ShieldCheck className="w-3 h-3 text-amber-600" />
                              VERIFY REF
                            </span>
                          ) : ord.payment_status === 'failed' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                              FAILED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                              PENDING
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
                            {ord.payment_method === 'mpesa' ? 'M-Pesa Pochi' : 'Cash'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          KES {ord.total.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SERVICES & PRICING TAB */}
      {/* ========================================================================= */}
      {adminTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Catalog & Pricing</h2>
              <p className="text-xs text-slate-500">Configure prices for Hawaii Area & Eldoret clients</p>
            </div>
            <button
              onClick={() => setIsAddingService(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div key={srv.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {srv.category.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{srv.name}</h3>
                  </div>
                  <span className="text-base font-black text-slate-900">
                    KES {srv.base_price}
                    <span className="text-xs font-normal text-slate-400">/{srv.price_type}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{srv.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Turnaround: {srv.estimated_duration}</span>
                  <span className="text-emerald-600 font-bold">Active</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Service Modal */}
          {isAddingService && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateService}
                className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-4 animate-scale-up"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-lg text-slate-900">Add New Laundry Service</h3>
                  <button type="button" onClick={() => setIsAddingService(false)}>
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="e.g. Leather Jacket Conditioning"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={newServiceCategory}
                      onChange={(e) => setNewServiceCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="wash_fold">Wash & Fold</option>
                      <option value="wash_iron">Wash & Iron</option>
                      <option value="suits">Suits & Dry Clean</option>
                      <option value="bedding">Duvets & Bedding</option>
                      <option value="curtains">Curtains</option>
                      <option value="shoes">Sneakers & Shoes</option>
                      <option value="special">Special / Wedding</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price (KES)</label>
                    <input
                      type="number"
                      required
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="Care details and equipment used..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingService(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold"
                  >
                    Save Service
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DISPATCH DRIVERS TAB */}
      {/* ========================================================================= */}
      {adminTab === 'drivers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Eldoret Dispatch Fleet</h2>
              <p className="text-xs text-slate-500">Manage collection & delivery personnel across estates</p>
            </div>
            <button
              onClick={() => setIsAddingDriver(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Driver
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((drv) => {
              const activeJobs = orders.filter(
                (o) => o.driver_id === drv.id && !['completed', 'delivered', 'cancelled'].includes(o.status)
              ).length;

              return (
                <div key={drv.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{drv.full_name || drv.name}</h3>
                        <p className="text-xs text-slate-500">{drv.phone || '0741775878'}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                        drv.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {drv.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1">
                    <p className="text-slate-600">
                      <strong>Vehicle:</strong> {drv.vehicle_type || 'Delivery Motorbike / Van'}
                    </p>
                    <p className="text-slate-600">
                      <strong>Zone:</strong> {drv.zone || 'Hawaii Area, Elgon View & Eldoret'}
                    </p>
                    <p className="text-sky-700 font-bold">
                      <strong>Active Jobs in Route:</strong> {activeJobs}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Driver Modal */}
          {isAddingDriver && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateDriver}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4 animate-scale-up"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-lg text-slate-900">Add Dispatch Driver</h3>
                  <button type="button" onClick={() => setIsAddingDriver(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    required
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    placeholder="e.g. Peter Nderitu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kenyan Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    placeholder="0741775878"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle / Reg #</label>
                  <input
                    type="text"
                    required
                    value={newDriverVehicle}
                    onChange={(e) => setNewDriverVehicle(e.target.value)}
                    placeholder="e.g. Van KDK 412A / Boxer 150"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingDriver(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold"
                  >
                    Save Driver
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. M-PESA RECONCILIATION & PAYMENTS TAB */}
      {/* ========================================================================= */}
      {adminTab === 'payments' && (
        <div className="space-y-6">
          {/* Pochi la Biashara Official Account Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                  Official Business Account
                </span>
                <h3 className="text-xl font-black text-white">Clothes Spa Laundry — Pochi la Biashara</h3>
                <p className="text-xs text-slate-300">
                  M-Pesa Number:{' '}
                  <strong className="text-amber-300 font-mono text-sm">0741775878</strong> • Manual verification & reconciliation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Awaiting Verification</span>
                <span className="text-lg font-black text-amber-300">{pendingVerifications}</span>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Reconciled</span>
                <span className="text-lg font-black text-emerald-400">KES {totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Filter / Search Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by Order #, Customer name, Phone, or Transaction Ref..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Payment Statuses</option>
                <option value="verification_required">Needs Verification</option>
                <option value="paid">Paid & Verified</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed / Invalid</option>
              </select>
            </div>
          </div>

          {/* Reconciliation Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">Payment Ledger & M-Pesa Verifications</h3>
                <p className="text-xs text-slate-400">
                  Cross-reference customer submitted M-Pesa references with your Safaricom Pochi statements (0741775878).
                </p>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">M-Pesa Reference / Details</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Order Date</th>
                    <th className="py-3.5 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center space-y-2">
                        <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-slate-800 text-sm">No payment records found</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Customer bookings and payment submissions will populate here for reconciliation.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          #{ord.order_number}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{ord.customer_name}</p>
                          <p className="text-slate-400 text-[11px]">{ord.customer_phone}</p>
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          KES {ord.total.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700">
                            {ord.payment_method === 'mpesa' ? 'Pochi la Biashara' : 'Cash on Delivery'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.payment_method === 'mpesa' ? (
                            <div className="space-y-0.5">
                              <div className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block text-[11px]">
                                {ord.order_number ? `Ref: ${ord.order_number.replace('CSL-', 'PK')}` : 'Submitted'}
                              </div>
                              <p className="text-[10px] text-slate-500">To: 0741775878 (Clothes Spa)</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Cash collection</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.payment_status === 'paid' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                              <Check className="w-3 h-3" /> Paid & Verified
                            </span>
                          ) : ord.payment_status === 'verification_required' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-amber-600" /> Verify Required
                            </span>
                          ) : ord.payment_status === 'failed' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Failed / Flagged
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.payment_status !== 'paid' ? (
                              <button
                                disabled={isUpdatingOrder}
                                onClick={() => handleDirectPaymentAction(ord.id, 'paid')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Confirm payment received in Pochi la Biashara"
                              >
                                <Check className="w-3.5 h-3.5" /> Mark Paid
                              </button>
                            ) : (
                              <button
                                disabled={isUpdatingOrder}
                                onClick={() => handleDirectPaymentAction(ord.id, 'pending')}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-xs transition cursor-pointer"
                                title="Revert to pending"
                              >
                                Revert
                              </button>
                            )}

                            {ord.payment_status === 'verification_required' && (
                              <button
                                disabled={isUpdatingOrder}
                                onClick={() => handleDirectPaymentAction(ord.id, 'failed')}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition cursor-pointer"
                                title="Flag invalid or unverified reference"
                              >
                                Flag Invalid
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ORDER DETAILS & LIFECYCLE MANAGEMENT */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-scale-up my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-sky-700">Order Management</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                  #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Transition Action Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Update Order Progress Status
                </label>
                <select
                  value={selectedOrder.status}
                  disabled={isUpdatingOrder}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="driver_assigned">Driver Assigned</option>
                  <option value="pickup_scheduled">Pickup Scheduled</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="processing">Processing in Spa</option>
                  <option value="ready_for_delivery">Ready for Delivery</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Eldoret Driver
                </label>
                <select
                  value={selectedOrder.driver_id || ''}
                  disabled={isUpdatingOrder}
                  onChange={(e) => handleAssignDriver(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name || d.name} ({d.phone || '0741775878'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <p className="font-bold text-slate-900">Customer Contact</p>
                <p className="text-slate-700 font-semibold">{selectedOrder.customer_name}</p>
                <p className="text-slate-600 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  {selectedOrder.customer_phone}
                </p>
                {selectedOrder.customer_email && (
                  <p className="text-slate-500">{selectedOrder.customer_email}</p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <p className="font-bold text-slate-900">Pickup Logistics</p>
                <p className="text-slate-700">
                  <strong>Area:</strong> {selectedOrder.pickup_area}
                </p>
                <p className="text-slate-600">
                  <strong>Address:</strong> {selectedOrder.pickup_address_text}
                </p>
                <p className="text-slate-600">
                  <strong>Slot:</strong> {selectedOrder.pickup_date} at {selectedOrder.pickup_time}
                </p>
              </div>
            </div>

            {/* Items Breakdown */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Garment Care Breakdown
              </h4>
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl p-4 text-xs space-y-2">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="pt-2 flex justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{it.service_name}</span>
                      <span className="text-slate-500 ml-2">x {it.quantity}</span>
                      {it.notes && <p className="text-[11px] text-slate-400 mt-0.5">{it.notes}</p>}
                    </div>
                    <span className="font-bold text-slate-900">KES {it.subtotal.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-bold text-slate-600">
                  <span>Delivery Fee</span>
                  <span>KES {selectedOrder.delivery_fee.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between font-black text-slate-900 text-sm border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-sky-700">KES {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment & M-Pesa Reconciliation Management */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider">
                    Payment Method & Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedOrder.payment_method === 'mpesa' ? 'M-Pesa Pochi la Biashara' : 'Cash on Delivery'}
                    </span>
                    {selectedOrder.payment_status === 'paid' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Paid & Verified
                      </span>
                    ) : selectedOrder.payment_status === 'verification_required' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                        Verification Required
                      </span>
                    ) : selectedOrder.payment_status === 'failed' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                        Failed / Flagged
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-semibold block">Payable Total</span>
                  <span className="text-lg font-black text-sky-700">
                    KES {selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedOrder.payment_method === 'mpesa' && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Destination Account:</span>
                    <span className="font-bold text-slate-800">Clothes Spa Laundry (0741775878)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Expected Reference:</span>
                    <span className="font-mono font-bold text-sky-700">
                      {selectedOrder.order_number ? selectedOrder.order_number.replace('CSL-', 'PK') : 'Awaiting'}
                    </span>
                  </div>
                </div>
              )}

              {/* Admin Reconciliation Actions */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <button
                  disabled={isUpdatingOrder}
                  onClick={() => handlePaymentToggle('paid')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedOrder.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {selectedOrder.payment_status === 'paid' ? 'Marked as Paid' : 'Verify & Mark as Paid'}
                </button>

                <button
                  disabled={isUpdatingOrder}
                  onClick={() => handlePaymentToggle('verification_required')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedOrder.payment_status === 'verification_required'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Needs Verification
                </button>

                <button
                  disabled={isUpdatingOrder}
                  onClick={() => handlePaymentToggle('pending')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedOrder.payment_status === 'pending'
                      ? 'bg-slate-200 text-slate-800 font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Mark Unpaid / Pending
                </button>

                <button
                  disabled={isUpdatingOrder}
                  onClick={() => handlePaymentToggle('failed')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedOrder.payment_status === 'failed'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  Flag as Failed
                </button>
              </div>
            </div>

            {/* Tracking timeline preview in admin */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Live Status Timeline
              </h4>
              <OrderTrackingTimeline
                status={selectedOrder.status}
                pickupDate={selectedOrder.pickup_date}
                pickupTime={selectedOrder.pickup_time}
                driverName={selectedOrder.driver_name}
                driverPhone={selectedOrder.driver_phone}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
