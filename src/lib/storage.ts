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
  mpesa_shortcode: '174379',
  mpesa_type: 'Buy Goods / Till',
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

// Local storage key constants
const KEYS = {
  SERVICES: 'csl_services_v1',
  ORDERS: 'csl_orders_v1',
  ORDER_ITEMS: 'csl_order_items_v1',
  PAYMENTS: 'csl_payments_v1',
  PROFILES: 'csl_profiles_v1',
  ADDRESSES: 'csl_addresses_v1',
  ASSIGNMENTS: 'csl_driver_assignments_v1',
  HISTORY: 'csl_order_history_v1',
  NOTIFICATIONS: 'csl_notifications_v1',
  SETTINGS: 'csl_settings_v1',
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

// Helpers to read/write localStorage
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

// Initialize default storage data if missing
export function initStorage() {
  if (!localStorage.getItem(KEYS.SERVICES)) {
    setLocal(KEYS.SERVICES, INITIAL_SERVICES);
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    setLocal(KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  if (!localStorage.getItem(KEYS.PROFILES)) {
    setLocal(KEYS.PROFILES, [INITIAL_ADMIN, ...INITIAL_DRIVERS]);
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    setLocal(KEYS.ORDERS, []);
  }
  if (!localStorage.getItem(KEYS.ORDER_ITEMS)) {
    setLocal(KEYS.ORDER_ITEMS, []);
  }
  if (!localStorage.getItem(KEYS.PAYMENTS)) {
    setLocal(KEYS.PAYMENTS, []);
  }
  if (!localStorage.getItem(KEYS.HISTORY)) {
    setLocal(KEYS.HISTORY, []);
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    setLocal(KEYS.NOTIFICATIONS, []);
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
        console.warn('Supabase fetch services error, fallback to local', e);
      }
    }
    return getLocal<Service[]>(KEYS.SERVICES, INITIAL_SERVICES);
  },

  async saveService(service: Partial<Service>): Promise<Service> {
    const services = await db.getServices();
    let saved: Service;
    if (service.id) {
      const idx = services.findIndex((s) => s.id === service.id);
      if (idx >= 0) {
        saved = {
          ...services[idx],
          ...service,
          updated_at: new Date().toISOString(),
        } as Service;
        services[idx] = saved;
      } else {
        saved = {
          ...service,
          id: service.id || `srv-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      services.push(saved);
    }

    setLocal(KEYS.SERVICES, services);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('services').upsert(saved);
      } catch (e) {
        console.error('Supabase save service error', e);
      }
    }

    emitEvent('services', services);
    return saved;
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
    let orders: Order[] = [];
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
        if (filter?.customerId) query = query.eq('customer_id', filter.customerId);
        if (filter?.driverId) query = query.eq('driver_id', filter.driverId);
        if (filter?.status) query = query.eq('status', filter.status);

        const { data, error } = await query;
        if (!error && data) {
          orders = data;
          setLocal(KEYS.ORDERS, orders);
          return orders;
        }
      } catch (e) {
        console.warn('Supabase fetch orders fallback to local', e);
      }
    }

    orders = getLocal<Order[]>(KEYS.ORDERS, []);
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
    const orders = await db.getOrders();
    return orders.find((o) => o.id === id || o.order_number === id) || null;
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

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
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
      id: `item-${Date.now()}-${idx}`,
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
      id: `pay-${Date.now()}`,
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

    // Save locally
    const existingOrders = getLocal<Order[]>(KEYS.ORDERS, []);
    setLocal(KEYS.ORDERS, [newOrder, ...existingOrders]);

    const existingItems = getLocal<OrderItem[]>(KEYS.ORDER_ITEMS, []);
    setLocal(KEYS.ORDER_ITEMS, [...newOrderItems, ...existingItems]);

    const existingPayments = getLocal<Payment[]>(KEYS.PAYMENTS, []);
    setLocal(KEYS.PAYMENTS, [newPayment, ...existingPayments]);

    // Initial Status History
    await db.addStatusHistory(orderId, 'pending', params.customerId, params.customerName, 'Order placed by customer');

    // Add Notifications for Customer and Admin
    await db.createNotification({
      user_id: params.customerId,
      order_id: orderId,
      type: 'order_created',
      title: 'Order Placed Successfully!',
      message: `Your laundry order #${orderNumber} has been received. Our team will arrange pickup in ${params.pickupArea}.`,
    });

    // Notify all admin profiles
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
        await supabase.from('orders').insert({
          id: newOrder.id,
          order_number: newOrder.order_number,
          customer_id: newOrder.customer_id,
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

        await supabase.from('order_items').insert(
          newOrderItems.map((it) => ({
            id: it.id,
            order_id: it.order_id,
            service_id: it.service_id,
            service_name: it.service_name,
            quantity: it.quantity,
            unit_price: it.unit_price,
            subtotal: it.subtotal,
            notes: it.notes,
          }))
        );

        await supabase.from('payments').insert({
          id: newPayment.id,
          order_id: newPayment.order_id,
          customer_id: newPayment.customer_id,
          amount: newPayment.amount,
          currency: newPayment.currency,
          payment_method: newPayment.payment_method,
          status: newPayment.status,
        });
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
        msg: `Driver ${updatedOrder.driver_name || 'Kipchoge'} has been assigned to pick up your laundry.`,
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
        await supabase
          .from('orders')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      } catch (e) {
        console.error('Supabase update status error', e);
      }
    }

    emitEvent('orders', updatedOrder);
    return updatedOrder;
  },

  async createService(service: Partial<Service>): Promise<Service> {
    return db.saveService(service);
  },

  async createDriver(driver: { name: string; phone: string; vehicle_type?: string; zone?: string }): Promise<Profile> {
    const saved = await db.saveProfile({
      full_name: driver.name,
      phone: driver.phone,
      email: `${driver.name.toLowerCase().replace(/\s+/g, '.')}@clothesspa.co.ke`,
      role: 'driver',
      status: 'active',
    });
    emitEvent('drivers', saved);
    return saved;
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
            status: 'driver_assigned',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      } catch (e) {
        console.error('Supabase assign driver error', e);
      }
    }

    emitEvent('orders', updatedOrder);
    return updatedOrder;
  },

  // --- PAYMENTS ---
  async getPayments(customerId?: string): Promise<Payment[]> {
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
    const payments = getLocal<Payment[]>(KEYS.PAYMENTS, []);
    const idx = payments.findIndex((p) => p.order_id === orderId);
    if (idx < 0) return null;

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
        title: 'Payment Received via M-Pesa',
        message: `M-Pesa payment of KES ${updatedPayment.amount.toLocaleString()} confirmed (Ref: ${reference || 'CSL-MPESA'}).`,
      });
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('payments')
          .update({
            status,
            transaction_reference: updatedPayment.transaction_reference,
            paid_at: updatedPayment.paid_at,
            updated_at: now,
          })
          .eq('order_id', orderId);

        await supabase
          .from('orders')
          .update({
            payment_status: status,
            updated_at: now,
          })
          .eq('id', orderId);
      } catch (e) {
        console.error('Supabase update payment error', e);
      }
    }

    return updatedPayment;
  },

  // --- ORDER STATUS HISTORY ---
  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const all = getLocal<OrderStatusHistory[]>(KEYS.HISTORY, []);
    return all.filter((h) => h.order_id === orderId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async addStatusHistory(orderId: string, status: OrderStatus, changedById?: string, changedByName?: string, notes?: string) {
    const all = getLocal<OrderStatusHistory[]>(KEYS.HISTORY, []);
    const entry: OrderStatusHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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
          changed_by: entry.changed_by,
          changed_by_name: entry.changed_by_name,
          notes: entry.notes,
        });
      } catch (e) {
        console.error('Supabase add history error', e);
      }
    }
  },

  // --- PROFILES / DRIVERS / CUSTOMERS ---
  async getProfiles(): Promise<Profile[]> {
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
    const idx = profiles.findIndex((p) => p.id === profile.id || (p.email && p.email === profile.email));

    if (idx >= 0) {
      saved = {
        ...profiles[idx],
        ...profile,
        updated_at: new Date().toISOString(),
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...profile,
      } as Profile;
      profiles.push(saved);
    }

    setLocal(KEYS.PROFILES, profiles);
    return saved;
  },

  // --- CUSTOMER ADDRESSES ---
  async getAddresses(customerId: string): Promise<CustomerAddress[]> {
    const all = getLocal<CustomerAddress[]>(KEYS.ADDRESSES, []);
    return all.filter((a) => a.customer_id === customerId);
  },

  async saveAddress(address: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const all = getLocal<CustomerAddress[]>(KEYS.ADDRESSES, []);
    let saved: CustomerAddress;

    if (address.is_default) {
      all.forEach((a) => {
        if (a.customer_id === address.customer_id) a.is_default = false;
      });
    }

    if (address.id) {
      const idx = all.findIndex((a) => a.id === address.id);
      if (idx >= 0) {
        saved = { ...all[idx], ...address, updated_at: new Date().toISOString() } as CustomerAddress;
        all[idx] = saved;
      } else {
        saved = { ...address, id: address.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as CustomerAddress;
        all.push(saved);
      }
    } else {
      saved = {
        id: `addr-${Date.now()}`,
        customer_id: address.customer_id!,
        address: address.address || '',
        area: address.area || 'Hawaii',
        additional_details: address.additional_details || '',
        is_default: address.is_default ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      all.push(saved);
    }

    setLocal(KEYS.ADDRESSES, all);
    return saved;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<Notification[]> {
    const all = getLocal<Notification[]>(KEYS.NOTIFICATIONS, []);
    return all.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createNotification(notif: Omit<Notification, 'id' | 'read' | 'created_at'>): Promise<Notification> {
    const all = getLocal<Notification[]>(KEYS.NOTIFICATIONS, []);
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    setLocal(KEYS.NOTIFICATIONS, all);
    emitEvent('notifications', newNotif);
    return newNotif;
  },

  async markNotificationRead(id: string): Promise<void> {
    const all = getLocal<Notification[]>(KEYS.NOTIFICATIONS, []);
    const idx = all.findIndex((n) => n.id === id);
    if (idx >= 0) {
      all[idx].read = true;
      setLocal(KEYS.NOTIFICATIONS, all);
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
        console.warn('Supabase get settings error, fallback', e);
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

// Auto initialize on module load
initStorage();
