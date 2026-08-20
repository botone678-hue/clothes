export type UserRole = 'customer' | 'driver' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface Profile {
  id: string;
  auth_user_id?: string;
  full_name: string;
  name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  status: UserStatus;
  vehicle_type?: string;
  zone?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  address: string;
  area: string;
  additional_details?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type ServiceCategory =
  | 'wash_fold'
  | 'wash_iron'
  | 'dry_clean'
  | 'bedding'
  | 'curtains'
  | 'suits'
  | 'shoes'
  | 'special';

export type PriceType = 'per_kg' | 'per_item' | 'per_pair' | 'fixed';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price_type: PriceType;
  base_price: number;
  image_url: string;
  estimated_duration: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'driver_assigned'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'processing'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'verification_required'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'mpesa' | 'cash_on_delivery' | 'card';

export interface OrderItem {
  id: string;
  order_id: string;
  service_id?: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  pickup_address_id?: string;
  pickup_address_text: string;
  pickup_area: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  status: OrderStatus;
  pickup_date: string;
  pickup_time: string;
  delivery_date?: string;
  delivery_time?: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  special_instructions?: string;
  customer_notes?: string;
  admin_notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  order_number?: string;
  customer_id: string;
  customer_name?: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_reference?: string;
  status: PaymentStatus;
  provider_response?: Record<string, any>;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverAssignment {
  id: string;
  order_id: string;
  driver_id: string;
  assigned_by?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  assigned_at: string;
  accepted_at?: string;
  completed_at?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by?: string;
  changed_by_name?: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  order_id?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  phone: string;
  location: string;
  opening_hours: string;
  delivery_fee: number;
  currency: string;
  minimum_order_amount: number;
  mpesa_phone: string;
  mpesa_type: string;
  mpesa_name: string;
  support_email: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingCartItem {
  service: Service;
  quantity: number;
  notes?: string;
}

export interface PochiPaymentSubmission {
  orderId: string;
  orderNumber: string;
  amount: number;
  transactionReference: string;
  payerPhone?: string;
  submittedAt: string;
}
