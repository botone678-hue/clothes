import React from 'react';
import { OrderStatus } from '../../types';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Sparkles,
  Home,
  AlertTriangle,
  RotateCw,
  ShoppingBag,
} from 'lucide-react';

interface OrderTrackingTimelineProps {
  status: OrderStatus;
  pickupDate?: string;
  pickupTime?: string;
  driverName?: string;
  driverPhone?: string;
}

const STAGES: Array<{
  key: OrderStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: 'pending',
    label: 'Order Placed',
    description: 'Received in system, awaiting dispatch review',
    icon: ShoppingBag,
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    description: 'Accepted by Clothes Spa Hawaii team',
    icon: CheckCircle2,
  },
  {
    key: 'driver_assigned',
    label: 'Driver Assigned',
    description: 'Driver dispatched for collection in Eldoret',
    icon: Truck,
  },
  {
    key: 'pickup_scheduled',
    label: 'Pickup Scheduled',
    description: 'Driver arriving at scheduled pickup window',
    icon: Clock,
  },
  {
    key: 'picked_up',
    label: 'Picked Up',
    description: 'En route to Hawaii Area cleaning spa',
    icon: Package,
  },
  {
    key: 'processing',
    label: 'Spa Processing',
    description: 'Deep wash, fabric conditioning & steam press',
    icon: Sparkles,
  },
  {
    key: 'ready_for_delivery',
    label: 'Ready for Delivery',
    description: 'Freshly packed, sanitized and inspected',
    icon: CheckCircle2,
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Driver en route to your doorstep',
    icon: Truck,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Handed over in pristine condition',
    icon: Home,
  },
  {
    key: 'completed',
    label: 'Completed',
    description: 'Order fully fulfilled and closed',
    icon: CheckCircle2,
  },
];

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  status,
  pickupDate,
  pickupTime,
  driverName,
  driverPhone,
}) => {
  if (status === 'cancelled') {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h4 className="font-bold text-rose-900 text-lg">Order Cancelled</h4>
        <p className="text-sm text-rose-700 mt-1">
          This order was cancelled. Please contact Clothes Spa support at{' '}
          <a href="tel:0741775878" className="font-bold underline">
            0741775878
          </a>{' '}
          if you have questions.
        </p>
      </div>
    );
  }

  const currentIdx = STAGES.findIndex((s) => s.key === status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="py-4">
      {/* Driver info callout if assigned */}
      {driverName && activeIdx >= 2 && activeIdx < 9 && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Assigned Driver</p>
              <h5 className="font-bold text-slate-900 text-sm">{driverName}</h5>
            </div>
          </div>
          {driverPhone && (
            <a
              href={`tel:${driverPhone}`}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Call Driver ({driverPhone})
            </a>
          )}
        </div>
      )}

      {/* Progress Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isPending = idx > activeIdx;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="relative flex items-start gap-4">
              {/* Timeline marker */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-sky-600 text-white shadow-md ring-4 ring-sky-100 animate-pulse'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>

              {/* Stage content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm font-bold ${
                      isCurrent
                        ? 'text-sky-700 font-extrabold'
                        : isDone
                        ? 'text-slate-900'
                        : 'text-slate-400 font-normal'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded-full animate-pulse uppercase">
                      Current Status
                    </span>
                  )}
                  {isDone && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
