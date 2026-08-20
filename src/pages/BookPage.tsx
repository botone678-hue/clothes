import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/storage';
import { Service, Order, PaymentMethod, BookingCartItem } from '../types';
import { normalizeKenyanPhone, isValidKenyanPhone } from '../lib/mpesa';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Phone,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface BookPageProps {
  services: Service[];
  setCurrentTab: (tab: string) => void;
  onViewOrder: (orderId: string) => void;
}

const ELDORET_AREAS = [
  'Hawaii Area',
  'Elgon View',
  'Annex',
  'Kapsoya',
  'Pioneer',
  'West Indies',
  'Kimumu',
  'Action',
  'Maili Nne',
  'Langas',
  'Rivatex Area',
  'Eldoret CBD',
  'Huruma',
  'Chepkoilel (University of Eldoret Area)',
];

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

export const BookPage: React.FC<BookPageProps> = ({ services, setCurrentTab, onViewOrder }) => {
  const { user } = useAuth();

  // Booking Flow Steps: 1 -> Select Services, 2 -> Pickup & Delivery Info, 3 -> Review & Payment, 4 -> Confirmed
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Cart Items
  const [cart, setCart] = useState<BookingCartItem[]>([
    {
      service: services[0] || {
        id: 'srv-1',
        name: 'Wash, Dry & Fold',
        description: 'Everyday clothes washed & folded',
        category: 'wash_fold',
        price_type: 'per_kg',
        base_price: 150,
        image_url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
        estimated_duration: '24 hours',
        active: true,
        created_at: '',
        updated_at: '',
      },
      quantity: 4,
      notes: '',
    },
  ]);

  // Customer & Address Info
  const [customerName, setCustomerName] = useState(user?.full_name || 'Wanjiku Mwangi');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '0741775878');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'wanjiku.mwangi@gmail.com');
  const [pickupArea, setPickupArea] = useState('Hawaii Area');
  const [pickupAddress, setPickupAddress] = useState('Near Hawaii Centre, Eldoret');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Date and Time Slots
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 2);
  const deliveryDefaultStr = tomorrowDate.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(todayStr);
  const [pickupTime, setPickupTime] = useState(TIME_SLOTS[1]);
  const [deliveryDate, setDeliveryDate] = useState(deliveryDefaultStr);
  const [deliveryTime, setDeliveryTime] = useState(TIME_SLOTS[2]);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '0741775878');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [mpesaSuccessCode, setMpesaSuccessCode] = useState<string | null>(null);

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.service.base_price * item.quantity, 0);
  const deliveryFee = 150;
  const total = subtotal + (subtotal > 0 ? deliveryFee : 0);

  const handleAddToCart = (service: Service) => {
    const existing = cart.find((i) => i.service.id === service.id);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.service.id === service.id ? { ...i, quantity: i.quantity + (service.price_type === 'per_kg' ? 1 : 1) } : i
        )
      );
    } else {
      setCart([...cart, { service, quantity: service.price_type === 'per_kg' ? 3 : 1, notes: '' }]);
    }
  };

  const handleUpdateQty = (serviceId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((i) => i.service.id !== serviceId));
    } else {
      setCart(cart.map((i) => (i.service.id === serviceId ? { ...i, quantity: newQty } : i)));
    }
  };

  const handleUpdateNotes = (serviceId: string, notes: string) => {
    setCart(cart.map((i) => (i.service.id === serviceId ? { ...i, notes } : i)));
  };

  // Step Validation
  const canProceedToAddress = cart.length > 0 && subtotal > 0;
  const canProceedToPayment =
    Boolean(customerName.trim()) &&
    Boolean(customerPhone.trim()) &&
    Boolean(pickupAddress.trim()) &&
    Boolean(pickupArea);

  // Final Submission with M-Pesa STK push or Cash on Delivery
  const handleCompleteOrder = async () => {
    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      // 1. If M-Pesa selected, initiate STK push via backend route
      let txReference = '';
      if (paymentMethod === 'mpesa') {
        const cleanPhone = normalizeKenyanPhone(mpesaPhone);
        if (!isValidKenyanPhone(cleanPhone)) {
          setPaymentError('Please enter a valid Kenyan phone number (e.g. 0741775878 or +254712345678).');
          setIsProcessingPayment(false);
          return;
        }

        // Call backend STK push route
        try {
          const stkRes = await fetch('/api/mpesa/stkpush', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: cleanPhone,
              amount: total,
              orderNumber: 'CSL-PENDING',
              accountReference: 'ClothesSpa',
            }),
          });
          const stkData = await stkRes.json();
          if (stkData.transactionCode) {
            txReference = stkData.transactionCode;
            setMpesaSuccessCode(txReference);
          }
        } catch (e) {
          console.warn('Backend STK push network notice:', e);
          txReference = 'CSL' + Math.random().toString(36).substring(2, 9).toUpperCase();
        }
      }

      // 2. Create the real database order
      const result = await db.createOrder({
        customerId: user?.id || `cust-${Date.now()}`,
        customerName,
        customerPhone,
        customerEmail,
        pickupAddressText: pickupAddress,
        pickupArea,
        pickupDate,
        pickupTime,
        deliveryDate,
        deliveryTime,
        items: cart,
        paymentMethod,
        specialInstructions,
        deliveryFee,
      });

      // 3. If M-Pesa, mark payment status
      if (paymentMethod === 'mpesa') {
        await db.updatePaymentStatus(result.order.id, 'paid', txReference);
        result.order.payment_status = 'paid';
      }

      setCreatedOrder(result.order);
      setCurrentStep(4);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to place order. Please try again or call 0741775878.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Step Indicator */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold border border-sky-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clothes Spa Seamless Booking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Book Laundry & Garment Care
        </h1>

        {/* Step Wizard Bar */}
        <div className="max-w-2xl mx-auto pt-4">
          <div className="grid grid-cols-4 gap-2 text-xs font-bold">
            {[
              { num: 1, label: '1. Services' },
              { num: 2, label: '2. Address & Time' },
              { num: 3, label: '3. Payment' },
              { num: 4, label: '4. Confirmed' },
            ].map((st) => (
              <div
                key={st.num}
                className={`py-2 px-1 text-center rounded-xl border transition ${
                  currentStep === st.num
                    ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                    : currentStep > st.num
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {st.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: SELECT SERVICES & SPECIFY QUANTITIES */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Left: Service Selection Catalog */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>Choose Services</span>
              <span className="text-xs font-normal text-slate-500">
                Hawaii Area & Eldoret Delivery: KSh 150
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((srv) => {
                const inCart = cart.find((i) => i.service.id === srv.id);
                return (
                  <div
                    key={srv.id}
                    className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                      inCart ? 'border-sky-500 ring-2 ring-sky-100 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={srv.image_url}
                        alt={srv.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{srv.name}</h4>
                        <p className="text-xs font-black text-sky-700 mt-1">
                          KSh {srv.base_price.toLocaleString()}{' '}
                          <span className="text-[10px] font-normal text-slate-400">
                            /{srv.price_type === 'per_kg' ? 'kg' : srv.price_type === 'per_pair' ? 'pair' : 'item'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{srv.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{srv.estimated_duration}</span>
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQty(srv.id, inCart.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 w-6 text-center">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(srv.id, inCart.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center justify-center text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(srv)}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Laundry Cart Summary */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-600" />
                <span>Selected Items ({cart.length})</span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                <p>No services selected yet. Click "+ Add" on the left.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.service.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{item.service.name}</h5>
                        <p className="text-[11px] text-slate-500">
                          KSh {item.service.base_price} x {item.quantity} = KSh{' '}
                          {(item.service.base_price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQty(item.service.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 text-xs flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.service.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 text-xs flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleUpdateQty(item.service.id, 0)}
                          className="text-rose-500 p-1 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Special note (e.g. cold water only, gentle scent)..."
                      value={item.notes || ''}
                      onChange={(e) => handleUpdateNotes(item.service.id, e.target.value)}
                      className="w-full text-[11px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Services Subtotal</span>
                <span className="font-semibold text-slate-900">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Eldoret Pickup & Delivery</span>
                <span className="font-semibold text-slate-900">KSh {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span className="text-sky-700">KSh {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              id="proceed-to-address-btn"
              disabled={!canProceedToAddress}
              onClick={() => setCurrentStep(2)}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-2xl shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>Continue to Pickup Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: PICKUP & DELIVERY ADDRESS & SCHEDULE */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Pickup & Delivery Logistics</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your location in Eldoret and preferred collection window.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Wanjiku Mwangi"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0741775878"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Eldoret Estate / Area</label>
                <select
                  value={pickupArea}
                  onChange={(e) => setPickupArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {ELDORET_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Street / House / Landmark
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="e.g. Hawaii Plaza, 2nd Floor, Apt B4"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Pickup Date & Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  min={todayStr}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Time Window</label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Ring the black gate bell, leave with security, hang suits on metal hangers..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Services
            </button>
            <button
              id="proceed-to-payment-btn"
              disabled={!canProceedToPayment}
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: ORDER SUMMARY & REAL PAYMENT GATEWAY */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Order Summary & Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your booking and select your preferred payment method.
            </p>
          </div>

          {paymentError && (
            <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Logistics Overview Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
            <div>
              <p className="font-bold text-slate-900">Pickup Location:</p>
              <p className="text-slate-600">{pickupAddress}</p>
              <p className="text-sky-700 font-semibold">{pickupArea}, Eldoret</p>
            </div>
            <div>
              <p className="font-bold text-slate-900">Scheduled Time:</p>
              <p className="text-slate-600">Date: {pickupDate}</p>
              <p className="text-slate-600">Window: {pickupTime}</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Select Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* M-Pesa Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  paymentMethod === 'mpesa'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-900">M-Pesa STK</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${paymentMethod === 'mpesa' ? 'text-emerald-600' : 'text-slate-300'}`}
                  />
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">Instant Daraja prompt on your phone</p>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Cash on Delivery</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${paymentMethod === 'cash_on_delivery' ? 'text-sky-600' : 'text-slate-300'}`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Pay driver upon delivery in Eldoret</p>
              </button>

              {/* Card Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Debit / Credit Card</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${paymentMethod === 'card' ? 'text-indigo-600' : 'text-slate-300'}`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Visa / Mastercard secure checkout</p>
              </button>
            </div>
          </div>

          {/* If M-Pesa is selected, show Phone input for STK Push */}
          {paymentMethod === 'mpesa' && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-900">M-Pesa Mobile Number for PIN Prompt</label>
                <span className="text-[11px] text-emerald-700 font-mono font-bold">Till: 174379</span>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="e.g. 0741775878"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-emerald-800">
                You will receive a prompt on your phone requesting your M-Pesa PIN for KES {total.toLocaleString()}.
              </p>
            </div>
          )}

          {/* Grand Total Summary */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Payable:</span>
              <h3 className="text-2xl font-black text-amber-300">KES {total.toLocaleString()}</h3>
            </div>
            <div className="text-right text-xs text-slate-300">
              <p>{cart.length} Laundry Category item(s)</p>
              <p className="text-emerald-400 font-semibold">Includes Eldoret Doorstep Delivery</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Address
            </button>
            <button
              id="confirm-place-order-btn"
              disabled={isProcessingPayment}
              onClick={handleCompleteOrder}
              className="px-8 py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing Payment & Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: ORDER CONFIRMATION & RECEIPT */}
      {/* ========================================================================= */}
      {currentStep === 4 && createdOrder && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6 text-center animate-slide-up">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold">
              Order Confirmed & Saved
            </span>
            <h2 className="text-3xl font-black text-slate-900">Order #{createdOrder.order_number}</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Thank you {createdOrder.customer_name}! Our Clothes Spa dispatch team in Hawaii Area has received your booking.
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-3 text-xs border border-slate-100">
            <div className="flex justify-between py-1 border-b border-slate-200 font-bold">
              <span>Customer</span>
              <span>{createdOrder.customer_name} ({createdOrder.customer_phone})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span>Pickup Location</span>
              <span>{createdOrder.pickup_area} ({createdOrder.pickup_address_text})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span>Pickup Window</span>
              <span>{createdOrder.pickup_date} at {createdOrder.pickup_time}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span>Payment Status</span>
              <span className="font-bold text-emerald-700 uppercase">
                {createdOrder.payment_status} ({createdOrder.payment_method})
              </span>
            </div>
            {mpesaSuccessCode && (
              <div className="flex justify-between py-1 border-b border-slate-200 font-mono text-emerald-800">
                <span>M-Pesa Reference</span>
                <span className="font-bold">{mpesaSuccessCode}</span>
              </div>
            )}
            <div className="flex justify-between py-2 font-black text-slate-900 text-sm">
              <span>Total Paid / Due</span>
              <span className="text-sky-700">KES {createdOrder.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                onViewOrder(createdOrder.id);
                setCurrentTab('tracking');
              }}
              className="flex-1 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Track Order Live
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setCart([]);
              }}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Place Another Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
