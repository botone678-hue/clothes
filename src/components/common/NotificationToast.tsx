import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, subscribeToEvent } from '../../lib/storage';
import { Notification } from '../../types';
import { Bell, CheckCircle, Package, Truck, AlertCircle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { user } = useAuth();
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  useEffect(() => {
    const unsub = subscribeToEvent('notifications', (notif: Notification) => {
      if (user && notif.user_id === user.id) {
        setActiveToast(notif);
        // Auto dismiss after 6 seconds
        setTimeout(() => {
          setActiveToast((current) => (current?.id === notif.id ? null : current));
        }, 6000);
      }
    });

    return () => unsub();
  }, [user]);

  if (!activeToast) return null;

  const getIcon = (type: string) => {
    if (type.includes('driver')) return <Truck className="w-5 h-5 text-indigo-500" />;
    if (type.includes('payment')) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (type.includes('order')) return <Package className="w-5 h-5 text-sky-500" />;
    return <Bell className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-4 animate-slide-up flex items-start gap-3">
      <div className="p-2.5 bg-slate-50 rounded-xl flex-shrink-0">
        {getIcon(activeToast.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-900 leading-tight">{activeToast.title}</h4>
        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{activeToast.message}</p>
        <span className="text-[10px] text-slate-400 mt-1.5 block">Just now</span>
      </div>
      <button
        onClick={() => setActiveToast(null)}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
