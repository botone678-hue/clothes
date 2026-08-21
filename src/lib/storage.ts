import { supabase, isSupabaseConfigured } from './supabase';
import {
  Profile,
  Service,
  Order,
  OrderItem,
  Payment,
  CustomerAddress,
  DriverAssignment,
  OrderStatusHistory,
  Notification,
  BusinessSettings,
  OrderStatus,
  PaymentStatus,
} from '../types';
import { generateOrderNumber } from './mpesa';

// Seed Initial Services for Clothes Spa Laundry (Hawaii Area, Eldoret, Kenya)
export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Wash, Dry & Fold',
    description: 'Everyday wear thoroughly washed, sanitized with fresh conditioner, tumble-dried, and crisply folded.',
    category: 'wash_fold',
    price_type: 'per_kg',
    base_price: 150,
    image_url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
    estimated_duration: '24 hours',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    name: 'Wash & Professional Ironing',
    description: 'Deep wet wash with premium steam pressing on hanger or flat fold for shirts, trousers, and dresses.',
    category: 'wash_iron',
    price_type: 'per_item',
    base_price: 80,
    image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80',
    estimated_duration: '24-48 hours',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    name: 'Executive Suits Dry Cleaning',
    description: 'Specialized gentle solvent cleaning, deep stain removal, and lapel contour pressing for two & three piece suits.',
    category: 'suits',
    price_type: 'per_item',
    base_price: 600,
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    estimated_duration: '48 hours',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-4',
    name: 'Heavy Duvet & Comforter Spa',
    description: 'Thermal extraction wash and anti-allergen disinfection for double, queen, and king-size duvets & blankets.',
    category: 'bedding',
    price_type: 'per_item',
    base_price: 700,
    image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    estimated_duration: '48 hours',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-5',
    name: 'Curtains & Heavy Drapes',
    description: 'Dust extraction, anti-shrink gentle wash, and anti-static steam finishing for sheer & blackout drapes.',
    category: 'curtains',
    price_type: 'per_kg',
    base_price: 250,
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    estimated_duration: '48 hours',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-6',
    name: 'Sneakers & Shoe Spa',
    description: 'Hand detailed cleaning, sole deoxidation, insole disinfection, deodorization, and water-repellent finish.',
    category: 'shoes',
    price_type: 'per_pair',
    base_price: 350,
    image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    estimated_duration: '24-48 hours',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-7',
    name: 'Wedding Gown & Evening Dresses',
    description: 'Delicate beadwork, lace, and silk preservation with museum-standard packaging for cherished gowns.',
    category: 'special',
    price_type: 'per_item',
    base_price: 2500,
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    estimated_duration: '72 hours',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-8',
    name: 'Bed Sheets & Pillowcases (Set)',
    description: 'Hospitality-grade sanitizing wash, fabric softening, and crisp flat-roller steam iron pressing.',
    category: 'bedding',
    price_type: 'per_item',
    base_price: 300,
    image_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80',
    estimated_duration: '24 hours',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_SETTINGS: BusinessSettings = {
  id: 'default',
  business_name: 'Clothes Spa Laundry',
  phone: '0741775878',
  location: 'Hawaii Area, Eldoret, Kenya',
  opening_hours: 'Mon-Sat: 7:00 AM - 8:00 PM | Sun: 9:00 AM - 6:00 PM',
  delivery_fee: 150,
  currency: 'KES',
  minimum_order_amount: 300,
  mpesa_phone: '0741775878',
  mpesa_type: 'Pochi la Biashara',
  mpesa_name: 'Clothes Spa Laundry',
  support_email: 'info@clothesspalaundry.co.ke',
};

// Initial Drivers in Eldoret
export const INITIAL_DRIVERS: Profile[] = [
  {
    id: 'drv-1',
    full_name: 'Kipchoge Brian',
    email: 'brian.kip@clothesspa.co.ke',
    phone: '0712345678',
    role: 'driver',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    vehicle_type: 'Motorcycle KDK 412A',
    zone: 'Hawaii Area & Eldoret West',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'drv-2',
    full_name: 'David Cheruiyot',
    email: 'david.c@clothesspa.co.ke',
    phone: '0723456789',
    role: 'driver',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    vehicle_type: 'Express Van KDM 890B',
    zone: 'Elgon View, Annex & CBD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initial Admin
export const INITIAL_ADMIN: Profile = {
  id: 'admin-1',
  full_name: 'Clothes Spa Operations',
  email: 'admin@clothesspalaundry.co.ke',
  phone: '0741775878',
  role: 'admin',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Local cache keys
const KEYS = {
  SERVICES: 'csl_services_v2',
  ORDERS: 'csl_orders_v2',
  ORDER_ITEMS: 'csl_order_items_v2',
  PAYMENTS: 'csl_payments_v2',
  PROFILES: 'csl_profiles_v2',
  ADDRESSES: 'csl_addresses_v2',
  ASSIGNMENTS: 'csl_driver_assignments_v2',
  HISTORY: 'csl_order_history_v2',
  NOTIFICATIONS: 'csl_notifications_v2',
  SETTINGS: 'csl_settings_v2',
};

// Listeners for realtime event broadcasting
type ListenerCallback = (data: any) => void;
export type StorageChannel =
  | 'orders'
  | 'notifications'
  | 'notification'
  | 'drivers'
  | 'services'
  | 'settings';

const eventListeners: Record<StorageChannel, Set<ListenerCallback>> = {
  orders: new Set(),
  notifications: new Set(),
  notification: new Set(),
  drivers: new Set(),
  services: new Set(),
  settings: new Set(),
};

export function subscribeToEvent(channel: StorageChannel, callback: ListenerCallback) {
  if (!eventListeners[channel]) {
    eventListeners[channel] = new Set();
  }
  eventListeners[channel].add(callback);
  return () => {
    eventListeners[channel]?.delete(callback);
  };
}

export function emitEvent(channel: StorageChannel, data: any) {
  if (eventListeners[channel]) {
    eventListeners[channel].forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error('Error in listener callback:', e);
      }
    });
  }
}

// Helpers to read/write local storage cache
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to write to localStorage', e);
  }
}

// Setup Supabase Realtime Subscriptions
if (isSupabaseConfigured) {
  try {
    supabase
      .channel('clothesspa-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          emitEvent('orders', payload.new || payload.old);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_status_history' },
        (payload) => {
          emitEvent('orders', payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'driver_assignments' },
        (payload) => {
          emitEvent('drivers', payload.new);
          emitEvent('orders', payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          emitEvent('notifications', payload.new);
          emitEvent('notification', payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          emitEvent('orders', payload.new);
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Could not initialize Supabase Realtime channel:', err);
  }
}

// ==========================================
// DATA REPOSITORY METHODS
// ==========================================

export const db = {
  // --- SERVICES ---
  async getServices(): Promise<Service[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) {
          setLocal(KEYS.SERVICES, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase fetch services warning, using cached catalog', e);
      }
    }
    return getLocal<Service[]>(KEYS.SERVICES, INITIAL_SERVICES);
  },

  async saveService(service: Partial<Service>): Promise<Service> {
    const services = await db.getServices();
    let saved: Service;
    const now = new Date().toISOString();

    if (service.id) {
      const idx = services.findIndex((s) => s.id === service.id);
      if (idx >= 0) {
        saved = {
          ...services[idx],
          ...service,
          updated_at: now,
        } as Service;
        services[idx] = saved;
      } else {
        saved = {
          ...service,
          id: service.id,
          created_at: now,
          updated_at: now,
        } as Service;
        services.push(saved);
      }
    } else {
      saved = {
        id: `srv-${Date.now()}`,
        name: service.name || 'New Service',
        description: service.description || '',
        category: service.category || 'wash_fold',
        price_type: service.price_type || 'per_item',
        base_price: Number(service.base_price) || 100,
        image_url: service.image_url || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
        estimated_duration: service.estimated_duration || '24 hours',
        active: service.active ?? true,
        created_at: now,
        updated_at: now,
      };
      services.push(saved);
    }

    setLocal(KEYS.SERVICES, services);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('services').upsert(saved);
        if (error) throw new Error(`Service save failed: ${error.message}`);
      } catch (e) {
        console.error('Supabase save service error', e);
        throw e;
      }
    }

    emitEvent('services', services);
    return saved;
  },

  async createService(service: Partial<Service>): Promise<Service> {
    return db.saveService(service);
  },

  async deleteService(id: string): Promise<boolean> {
    const services = await db.getServices();
    const filtered = services.filter((s) => s.id !== id);
    setLocal(KEYS.SERVICES, filtered);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete service error', e);
      }
    }
    emitEvent('services', filtered);
    return true;
  },

  // --- ORDERS ---
  async getOrders(filter?: { customerId?: string; driverId?: string; status?: OrderStatus }): Promise<Order[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false });

        if (filter?.customerId) query = query.eq('customer_id', filter.customerId);
        if (filter?.driverId) query = query.eq('driver_id', filter.driverId);
        if (filter?.status) query = query.eq('status', filter.status);

        const { data, error } = await query;
        if (!error && data) {
          setLocal(KEYS.ORDERS, data);
          return data as Order[];
        }
      } catch (e) {
        console.warn('Supabase fetch orders fallback', e);
      }
    }

    let orders = getLocal<Order[]>(KEYS.ORDERS, []);
    const items = getLocal<OrderItem[]>(KEYS.ORDER_ITEMS, []);

    orders = orders.map((ord) => ({
      ...ord,
      items: items.filter((i) => i.order_id === ord.id),
    }));

    if (filter?.customerId) {
      orders = orders.filter((o) => o.customer_id === filter.customerId);
    }
    if (filter?.driverId) {
      orders = orders.filter((o) => o.driver_id === filter.driverId);
    }
    if (filter?.status) {
      orders = orders.filter((o) => o.status === filter.status);
    }

    return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getOrderById(id: string): Promise<Order | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .or(`id.eq.${id},order_number.eq.${id}`)
          .single();
        if (!error && data) {
          return data as Order;
        }
      } catch (e) {
        console.warn('Supabase getOrderById error', e);
      }
    }

    const orders = await db.getOrders();
    return orders.find((o) => o.id === id || o.order_number.toLowerCase() === id.toLowerCase()) || null;
  },

  async createOrder(params: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    pickupAddressText: string;
    pickupArea: string;
    pickupDate: string;
    pickupTime: string;
    deliveryDate?: string;
    deliveryTime?: string;
    items: Array<{ service: Service; quantity: number; notes?: string }>;
    paymentMethod: 'mpesa' | 'cash_on_delivery' | 'card';
    specialInstructions?: string;
    deliveryFee?: number;
  }): Promise<{ order: Order; payment: Payment }> {
    const settings = await db.getBusinessSettings();
    const deliveryFee = params.deliveryFee ?? settings.delivery_fee;

    // Calculate subtotal
    const subtotal = params.items.reduce((sum, item) => sum + item.service.base_price * item.quantity, 0);
    const total = subtotal + deliveryFee;

    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: params.customerId,
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      customer_email: params.customerEmail,
      pickup_address_text: params.pickupAddressText,
      pickup_area: params.pickupArea,
      status: 'pending',
      pickup_date: params.pickupDate,
      pickup_time: params.pickupTime,
      delivery_date: params.deliveryDate,
      delivery_time: params.deliveryTime,
      subtotal,
      delivery_fee: deliveryFee,
      discount: 0,
      total,
      payment_status: 'pending',
      payment_method: params.paymentMethod,
      special_instructions: params.specialInstructions,
      created_at: now,
      updated_at: now,
    };

    const newOrderItems: OrderItem[] = params.items.map((item, idx) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      service_id: item.service.id,
      service_name: item.service.name,
      quantity: item.quantity,
      unit_price: item.service.base_price,
      subtotal: item.service.base_price * item.quantity,
      notes: item.notes,
      created_at: now,
    }));

    newOrder.items = newOrderItems;

    const newPayment: Payment = {
      id: crypto.randomUUID(),
      order_id: orderId,
      order_number: orderNumber,
      customer_id: params.customerId,
      customer_name: params.customerName,
      amount: total,
      currency: 'KES',
      payment_method: params.paymentMethod,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    // Save locally to cache
    const existingOrders = getLocal<Order[]>(KEYS.ORDERS, []);
    setLocal(KEYS.ORDERS, [newOrder, ...existingOrders]);

    const existingItems = getLocal<OrderItem[]>(KEYS.ORDER_ITEMS, []);
    setLocal(KEYS.ORDER_ITEMS, [...newOrderItems, ...existingItems]);

    const existingPayments = getLocal<Payment[]>(KEYS.PAYMENTS, []);
    setLocal(KEYS.PAYMENTS, [newPayment, ...existingPayments]);

    // Initial Status History
    await db.addStatusHistory(orderId, 'pending', params.customerId, params.customerName, 'Order placed by customer');

    // Add Notification for Customer
    await db.createNotification({
      user_id: params.customerId,
      order_id: orderId,
      type: 'order_created',
      title: 'Order Placed Successfully!',
      message: `Your laundry order #${orderNumber} has been received. Our team will arrange pickup in ${params.pickupArea}.`,
    });

    // Notify Admins
    const profiles = await db.getProfiles();
    const admins = profiles.filter((p) => p.role === 'admin');
    for (const admin of admins) {
      await db.createNotification({
        user_id: admin.id,
        order_id: orderId,
        type: 'new_order_admin',
        title: `New Order #${orderNumber}`,
        message: `${params.customerName} placed order #${orderNumber} in ${params.pickupArea} for KES ${total.toLocaleString()}.`,
      });
    }

    if (isSupabaseConfigured) {
      try {
        const { error: orderInsertError } = await supabase.from('orders').insert({
          id: newOrder.id,
          order_number: newOrder.order_number,
          customer_id: newOrder.customer_id.startsWith('cust-') ? null : newOrder.customer_id,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email,
          pickup_address_text: newOrder.pickup_address_text,
          pickup_area: newOrder.pickup_area,
          status: newOrder.status,
          pickup_date: newOrder.pickup_date,
          pickup_time: newOrder.pickup_time,
          delivery_date: newOrder.delivery_date,
          delivery_time: newOrder.delivery_time,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.delivery_fee,
          discount: newOrder.discount,
          total: newOrder.total,
          payment_status: newOrder.payment_status,
          payment_method: newOrder.payment_method,
          special_instructions: newOrder.special_instructions,
        });
        if (orderInsertError) throw new Error(`Order insert failed: ${orderInsertError.message}`);

        const { error: itemsInsertError } = await supabase.from('order_items').insert(
          newOrderItems.map((it) => ({
            id: it.id,
            order_id: it.order_id,
            service_id: it.service_id?.startsWith('srv-') ? null : it.service_id,
            service_name: it.service_name,
            quantity: it.quantity,
            unit_price: it.unit_price,
            total: it.subtotal,
            notes: it.notes,
          }))
        );
        if (itemsInsertError) throw new Error(`Order items insert failed: ${itemsInsertError.message}`);

        const { error: paymentInsertError } = await supabase.from('payments').insert({
          id: newPayment.id,
          order_id: newPayment.order_id,
          customer_id: newPayment.customer_id.startsWith('cust-') ? null : newPayment.customer_id,
          provider: newPayment.payment_method,
          amount: newPayment.amount,
          status: newPayment.status,
        });
        if (paymentInsertError) throw new Error(`Payment insert failed: ${paymentInsertError.message}`);
      } catch (e) {
        console.error('Supabase createOrder error', e);
      }
    }

    emitEvent('orders', newOrder);
    return { order: newOrder, payment: newPayment };
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    changedById: string,
    changedByName: string,
    notes?: string
  ): Promise<Order | null> {
    const orders = getLocal<Order[]>(KEYS.ORDERS, []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return null;

    const prevOrder = orders[idx];
    const updatedOrder: Order = {
      ...prevOrder,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    orders[idx] = updatedOrder;
    setLocal(KEYS.ORDERS, orders);

    // Save status history
    await db.addStatusHistory(orderId, newStatus, changedById, changedByName, notes || `Status updated to ${newStatus}`);

    // Create notifications based on status
    const statusMessages: Record<OrderStatus, { title: string; msg: string }> = {
      pending: { title: 'Order Pending', msg: 'Your order is pending confirmation.' },
      confirmed: { title: 'Order Confirmed', msg: `Order #${updatedOrder.order_number} has been confirmed by Clothes Spa.` },
      driver_assigned: {
        title: 'Driver Assigned',
        msg: `Driver ${updatedOrder.driver_name || 'Assigned Driver'} will pick up your laundry.`,
      },
      pickup_scheduled: {
        title: 'Pickup Scheduled',
        msg: `Your pickup is scheduled for ${updatedOrder.pickup_date} at ${updatedOrder.pickup_time}.`,
      },
      picked_up: {
        title: 'Laundry Picked Up',
        msg: `Your garments have been picked up and are en route to our Hawaii Area spa facility.`,
      },
      processing: {
        title: 'Spa Treatment & Washing in Progress',
        msg: `Your clothes are undergoing deep sanitization, washing, and specialized garment care.`,
      },
      ready_for_delivery: {
        title: 'Ready for Delivery',
        msg: `Your garments are freshly cleaned, pressed, sanitized, and ready for dispatch.`,
      },
      out_for_delivery: {
        title: 'Out for Delivery',
        msg: `Your cleaned laundry is on the way to your delivery address in Eldoret!`,
      },
      delivered: {
        title: 'Delivered',
        msg: `Your laundry order #${updatedOrder.order_number} has been delivered. Thank you for choosing Clothes Spa!`,
      },
      completed: {
        title: 'Order Completed',
        msg: `Order #${updatedOrder.order_number} is completed. We look forward to serving you again.`,
      },
      cancelled: {
        title: 'Order Cancelled',
        msg: `Order #${updatedOrder.order_number} has been cancelled. Please contact 0741775878 for assistance.`,
      },
    };

    const statusInfo = statusMessages[newStatus];
    if (statusInfo) {
      await db.createNotification({
        user_id: updatedOrder.customer_id,
        order_id: orderId,
        type: `order_status_${newStatus}`,
        title: statusInfo.title,
        message: statusInfo.msg,
      });
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId); if (error) throw error;
      } catch (e) {
        console.error('Supabase update status error', e);
      }
    }

    emitEvent('orders', updatedOrder);
    return updatedOrder;
  },

  async assignDriver(orderId: string, driverId: string, assignedByName?: string, driverPhone?: string): Promise<Order | null> {
    const drivers = await db.getDrivers();
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return null;

    const orders = getLocal<Order[]>(KEYS.ORDERS, []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return null;

    const updatedOrder: Order = {
      ...orders[idx],
      driver_id: driver.id,
      driver_name: driver.full_name,
      driver_phone: driverPhone || driver.phone,
      status: 'driver_assigned',
      updated_at: new Date().toISOString(),
    };

    orders[idx] = updatedOrder;
    setLocal(KEYS.ORDERS, orders);

    // Record driver assignment
    const assignments = getLocal<DriverAssignment[]>(KEYS.ASSIGNMENTS, []);
    assignments.push({
      id: `asg-${Date.now()}`,
      order_id: orderId,
      driver_id: driverId,
      assigned_by: assignedByName || 'Admin',
      status: 'pending',
      assigned_at: new Date().toISOString(),
    });
    setLocal(KEYS.ASSIGNMENTS, assignments);

    await db.addStatusHistory(
      orderId,
      'driver_assigned',
      undefined,
      assignedByName || 'Admin',
      `Assigned to driver ${driver.full_name} (${driver.phone})`
    );

    // Notify driver
    await db.createNotification({
      user_id: driver.id,
      order_id: orderId,
      type: 'new_job_assigned',
      title: 'New Pickup Job Assigned',
      message: `You have been assigned order #${updatedOrder.order_number} in ${updatedOrder.pickup_area}. Pickup at ${updatedOrder.pickup_date} ${updatedOrder.pickup_time}.`,
    });

    // Notify customer
    await db.createNotification({
      user_id: updatedOrder.customer_id,
      order_id: orderId,
      type: 'driver_assigned',
      title: 'Driver Assigned for Pickup',
      message: `${driver.full_name} (${driver.phone}) will collect your laundry.`,
    });

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('orders')
          .update({
            driver_id: driver.id,
            driver_name: driver.full_name,
            driver_phone: driverPhone || driver.phone,
            status: 'driver_assigned',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        await supabase.from('driver_assignments').insert({
          order_id: orderId,
          driver_id: driver.id,
          status: 'assigned',
        });
      } catch (e) {
        console.error('Supabase assign driver error', e);
      }
    }

    emitEvent('orders', updatedOrder);
    return updatedOrder;
  },

  async createDriver(driver: { name: string; phone: string; vehicle_type?: string; zone?: string }): Promise<Profile> {
    const saved = await db.saveProfile({
      full_name: driver.name,
      phone: driver.phone,
      email: `${driver.name.toLowerCase().replace(/\s+/g, '.')}@clothesspa.co.ke`,
      role: 'driver',
      status: 'active',
      vehicle_type: driver.vehicle_type,
      zone: driver.zone,
    });
    emitEvent('drivers', saved);
    return saved;
  },

  // --- PAYMENTS ---
  async getPayments(customerId?: string): Promise<Payment[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('payments').select('*').order('created_at', { ascending: false });
        if (customerId) query = query.eq('customer_id', customerId);
        const { data, error } = await query;
        if (!error && data) {
          setLocal(KEYS.PAYMENTS, data);
          return data as Payment[];
        }
      } catch (e) {
        console.warn('Supabase fetch payments fallback', e);
      }
    }
    let payments = getLocal<Payment[]>(KEYS.PAYMENTS, []);
    if (customerId) {
      payments = payments.filter((p) => p.customer_id === customerId);
    }
    return payments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async updatePaymentStatus(
    orderId: string,
    status: PaymentStatus,
    reference?: string,
    providerResponse?: any
  ): Promise<Payment | null> {
    // Always hydrate payments from Supabase first. The admin may be on a different
    // phone/browser and therefore have no local payment cache.
    const payments = await db.getPayments();
    const idx = payments.findIndex((p) => p.order_id === orderId);
    if (idx < 0) throw new Error(`Payment record not found for order ${orderId}`);

    const now = new Date().toISOString();
    const updatedPayment: Payment = {
      ...payments[idx],
      status,
      transaction_reference: reference || payments[idx].transaction_reference,
      provider_response: providerResponse || payments[idx].provider_response,
      paid_at: status === 'paid' ? now : payments[idx].paid_at,
      updated_at: now,
    };

    payments[idx] = updatedPayment;
    setLocal(KEYS.PAYMENTS, payments);

    // Update order payment_status
    const orders = getLocal<Order[]>(KEYS.ORDERS, []);
    const oIdx = orders.findIndex((o) => o.id === orderId);
    if (oIdx >= 0) {
      orders[oIdx].payment_status = status;
      orders[oIdx].updated_at = now;
      setLocal(KEYS.ORDERS, orders);
      emitEvent('orders', orders[oIdx]);
    }

    if (status === 'paid') {
      await db.createNotification({
        user_id: updatedPayment.customer_id,
        order_id: orderId,
        type: 'payment_successful',
        title: 'Payment Verified & Confirmed',
        message: `M-Pesa Pochi payment of KES ${updatedPayment.amount.toLocaleString()} has been verified and confirmed (Ref: ${reference || updatedPayment.transaction_reference || 'N/A'}).`,
      });
    } else if (status === 'verification_required') {
      await db.createNotification({
        user_id: updatedPayment.customer_id,
        order_id: orderId,
        type: 'payment_verification',
        title: 'Payment Reference Submitted',
        message: `Your M-Pesa reference (${reference || 'Submitted'}) has been received. Our accounts team will verify with 0741775878.`,
      });
    } else if (status === 'failed') {
      await db.createNotification({
        user_id: updatedPayment.customer_id,
        order_id: orderId,
        type: 'payment_failed',
        title: 'Payment Verification Unsuccessful',
        message: `The payment reference provided could not be verified. Please check and submit a valid M-Pesa SMS code or contact 0741775878.`,
      });
    }

    if (isSupabaseConfigured) {
      try {
        const paymentUpdate = await supabase.from('payments').update({ status, transaction_reference: updatedPayment.transaction_reference, paid_at: updatedPayment.paid_at, updated_at: now }).eq('order_id', orderId);
        if (paymentUpdate.error) throw new Error(`Payment update failed: ${paymentUpdate.error.message}`);

        const orderPaymentUpdate = await supabase.from('orders').update({ payment_status: status, updated_at: now }).eq('id', orderId);
        if (orderPaymentUpdate.error) throw new Error(`Order payment status update failed: ${orderPaymentUpdate.error.message}`);
      } catch (e) {
        console.error('Supabase update payment error', e);
        throw e;
      }
    }

    return updatedPayment;
  },

  // --- ORDER STATUS HISTORY ---
  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('order_status_history')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });
        if (!error && data) {
          return data as OrderStatusHistory[];
        }
      } catch (e) {
        console.warn('Supabase getStatusHistory fallback', e);
      }
    }
    const all = getLocal<OrderStatusHistory[]>(KEYS.HISTORY, []);
    return all.filter((h) => h.order_id === orderId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async addStatusHistory(orderId: string, status: OrderStatus, changedById?: string, changedByName?: string, notes?: string) {
    const all = getLocal<OrderStatusHistory[]>(KEYS.HISTORY, []);
    const entry: OrderStatusHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order_id: orderId,
      status,
      changed_by: changedById,
      changed_by_name: changedByName || 'System',
      notes,
      created_at: new Date().toISOString(),
    };
    all.push(entry);
    setLocal(KEYS.HISTORY, all);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('order_status_history').insert({
          id: entry.id,
          order_id: entry.order_id,
          status: entry.status,
          changed_by: entry.changed_by?.startsWith('cust-') || entry.changed_by?.startsWith('drv-') || entry.changed_by?.startsWith('admin-') ? null : entry.changed_by,
          changed_by_name: entry.changed_by_name,
          note: entry.notes,
        });
      } catch (e) {
        console.error('Supabase add history error', e);
      }
    }
  },

  // --- PROFILES / DRIVERS / CUSTOMERS ---
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) {
          setLocal(KEYS.PROFILES, data);
          return data as Profile[];
        }
      } catch (e) {
        console.warn('Supabase getProfiles fallback', e);
      }
    }
    return getLocal<Profile[]>(KEYS.PROFILES, [INITIAL_ADMIN, ...INITIAL_DRIVERS]);
  },

  async getDrivers(): Promise<Profile[]> {
    const profiles = await db.getProfiles();
    return profiles.filter((p) => p.role === 'driver');
  },

  async getCustomers(): Promise<Profile[]> {
    const profiles = await db.getProfiles();
    return profiles.filter((p) => p.role === 'customer');
  },

  async saveProfile(profile: Partial<Profile>): Promise<Profile> {
    const profiles = await db.getProfiles();
    let saved: Profile;
    const now = new Date().toISOString();
    const idx = profiles.findIndex((p) => p.id === profile.id || (p.email && p.email === profile.email));

    if (idx >= 0) {
      saved = {
        ...profiles[idx],
        ...profile,
        updated_at: now,
      } as Profile;
      profiles[idx] = saved;
    } else {
      saved = {
        id: profile.id || `prof-${Date.now()}`,
        full_name: profile.full_name || 'New User',
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role || 'customer',
        status: 'active',
        created_at: now,
        updated_at: now,
        ...profile,
      } as Profile;
      profiles.push(saved);
    }

    setLocal(KEYS.PROFILES, profiles);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('profiles').upsert(saved);
        if (error) throw new Error(`Driver profile save failed: ${error.message}`);
      } catch (e) {
        console.error('Supabase save profile error', e);
        throw e;
      }
    }

    return saved;
  },

  // --- CUSTOMER ADDRESSES ---
  async getAddresses(customerId: string): Promise<CustomerAddress[]> {
    if (isSupabaseConfigured && !customerId.startsWith('cust-')) {
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('customer_id', customerId)
          .order('is_default', { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            customer_id: d.customer_id,
            address: d.address_line || d.address,
            area: d.area,
            additional_details: d.landmark || d.additional_details,
            latitude: d.latitude,
            longitude: d.longitude,
            is_default: d.is_default,
            created_at: d.created_at,
            updated_at: d.updated_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase getAddresses fallback', e);
      }
    }
    const all = getLocal<CustomerAddress[]>(KEYS.ADDRESSES, []);
    return all.filter((a) => a.customer_id === customerId);
  },

  async saveAddress(address: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const all = getLocal<CustomerAddress[]>(KEYS.ADDRESSES, []);
    let saved: CustomerAddress;
    const now = new Date().toISOString();

    if (address.is_default) {
      all.forEach((a) => {
        if (a.customer_id === address.customer_id) a.is_default = false;
      });
    }

    if (address.id) {
      const idx = all.findIndex((a) => a.id === address.id);
      if (idx >= 0) {
        saved = { ...all[idx], ...address, updated_at: now } as CustomerAddress;
        all[idx] = saved;
      } else {
        saved = { ...address, id: address.id, created_at: now, updated_at: now } as CustomerAddress;
        all.push(saved);
      }
    } else {
      saved = {
        id: `addr-${Date.now()}`,
        customer_id: address.customer_id!,
        address: address.address || '',
        area: address.area || 'Hawaii Area',
        additional_details: address.additional_details || '',
        is_default: address.is_default ?? true,
        created_at: now,
        updated_at: now,
      };
      all.push(saved);
    }

    setLocal(KEYS.ADDRESSES, all);

    if (isSupabaseConfigured && address.customer_id && !address.customer_id.startsWith('cust-')) {
      try {
        await supabase.from('addresses').upsert({
          id: saved.id.startsWith('addr-') ? undefined : saved.id,
          customer_id: saved.customer_id,
          address_line: saved.address,
          area: saved.area,
          landmark: saved.additional_details,
          is_default: saved.is_default,
        });
      } catch (e) {
        console.error('Supabase save address error', e);
      }
    }

    return saved;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<Notification[]> {
    if (isSupabaseConfigured && !userId.startsWith('cust-') && !userId.startsWith('drv-') && !userId.startsWith('admin-')) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((n: any) => ({
            id: n.id,
            user_id: n.recipient_id || n.user_id,
            order_id: n.order_id,
            type: n.type,
            title: n.title,
            message: n.message,
            read: n.read,
            created_at: n.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase getNotifications fallback', e);
      }
    }
    const all = getLocal<Notification[]>(KEYS.NOTIFICATIONS, []);
    return all.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createNotification(notif: Omit<Notification, 'id' | 'read' | 'created_at'>): Promise<Notification> {
    const all = getLocal<Notification[]>(KEYS.NOTIFICATIONS, []);
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    setLocal(KEYS.NOTIFICATIONS, all);
    emitEvent('notifications', newNotif);

    if (isSupabaseConfigured && notif.user_id && !notif.user_id.startsWith('cust-') && !notif.user_id.startsWith('drv-') && !notif.user_id.startsWith('admin-')) {
      try {
        await supabase.from('notifications').insert({
          recipient_id: notif.user_id,
          order_id: notif.order_id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          read: false,
        });
      } catch (e) {
        console.error('Supabase createNotification error', e);
      }
    }

    return newNotif;
  },

  async markNotificationRead(id: string): Promise<void> {
    const all = getLocal<Notification[]>(KEYS.NOTIFICATIONS, []);
    const idx = all.findIndex((n) => n.id === id);
    if (idx >= 0) {
      all[idx].read = true;
      setLocal(KEYS.NOTIFICATIONS, all);
    }

    if (isSupabaseConfigured && !id.startsWith('notif-')) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      } catch (e) {
        console.error('Supabase markNotificationRead error', e);
      }
    }
  },

  // --- BUSINESS SETTINGS ---
  async getBusinessSettings(): Promise<BusinessSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('business_settings').select('*').single();
        if (!error && data) {
          setLocal(KEYS.SETTINGS, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase get settings fallback', e);
      }
    }
    return getLocal<BusinessSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const current = await db.getBusinessSettings();
    const updated: BusinessSettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    setLocal(KEYS.SETTINGS, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('business_settings').upsert(updated);
      } catch (e) {
        console.error('Supabase update settings error', e);
      }
    }

    emitEvent('settings', updated);
    return updated;
  },
};
