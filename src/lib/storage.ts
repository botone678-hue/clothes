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
// Production storage is Supabase-first; localStorage is only the offline fallback.
