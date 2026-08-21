import { supabase, isSupabaseConfigured } from './supabase';
import { db } from './storage';

// Admin operations must use Supabase as the source of truth. The legacy storage
// layer keeps a per-device local cache, which is not sufficient for admin actions
// performed against orders created on another device.
if (isSupabaseConfigured) {
  const originalUpdateOrderStatus = db.updateOrderStatus.bind(db);
  const originalAssignDriver = db.assignDriver.bind(db);
  const originalUpdatePaymentStatus = db.updatePaymentStatus.bind(db);

  db.updateOrderStatus = async (orderId, newStatus, changedById, changedByName, notes) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: now })
      .eq('id', orderId);
    if (error) throw new Error(`Could not update order: ${error.message}`);

    try {
      await supabase.from('order_status_history').insert({
        id: crypto.randomUUID(),
        order_id: orderId,
        status: newStatus,
        changed_by: changedById && !changedById.startsWith('admin-') ? changedById : null,
        changed_by_name: changedByName || 'Admin',
        note: notes || `Status updated to ${newStatus}`,
      });
    } catch (historyError) {
      console.warn('Order status history could not be recorded', historyError);
    }

    const { data, error: readError } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();
    if (readError) throw new Error(`Order updated but could not be reloaded: ${readError.message}`);
    return data;
  };

  db.assignDriver = async (orderId, driverId, assignedByName, driverPhone) => {
    const { data: driver, error: driverError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', driverId)
      .eq('role', 'driver')
      .single();
    if (driverError || !driver) throw new Error(`Driver could not be loaded: ${driverError?.message || 'not found'}`);

    const now = new Date().toISOString();
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        driver_id: driver.id,
        driver_name: driver.full_name,
        driver_phone: driverPhone || driver.phone,
        status: 'driver_assigned',
        updated_at: now,
      })
      .eq('id', orderId);
    if (orderError) throw new Error(`Could not assign driver: ${orderError.message}`);

    const { error: assignmentError } = await supabase.from('driver_assignments').insert({
      id: crypto.randomUUID(),
      order_id: orderId,
      driver_id: driver.id,
      status: 'assigned',
      assigned_at: now,
      assigned_by: assignedByName || 'Admin',
    });
    if (assignmentError) throw new Error(`Order assigned but assignment record failed: ${assignmentError.message}`);

    const { data, error: readError } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();
    if (readError) throw new Error(`Driver assigned but order could not be reloaded: ${readError.message}`);
    return data;
  };

  db.updatePaymentStatus = async (orderId, status, reference, providerResponse) => {
    const now = new Date().toISOString();
    const { data: payment, error: paymentReadError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (paymentReadError) throw new Error(`Could not load payment: ${paymentReadError.message}`);
    if (!payment) throw new Error('No payment record exists for this order.');

    const { data: updatedPayment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status,
        transaction_reference: reference || payment.transaction_reference,
        provider_response: providerResponse || payment.provider_response,
        paid_at: status === 'paid' ? now : payment.paid_at,
        updated_at: now,
      })
      .eq('id', payment.id)
      .select('*')
      .single();
    if (paymentError) throw new Error(`Could not update payment: ${paymentError.message}`);

    const { error: orderError } = await supabase
      .from('orders')
      .update({ payment_status: status, updated_at: now })
      .eq('id', orderId);
    if (orderError) throw new Error(`Payment updated but order status failed: ${orderError.message}`);

    return updatedPayment;
  };

  // Keep references alive so the override module is explicitly intentional.
  void originalUpdateOrderStatus;
  void originalAssignDriver;
  void originalUpdatePaymentStatus;
}
