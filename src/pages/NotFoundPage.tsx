import React from 'react';
import { Sparkles, Home, ArrowLeft, Phone } from 'lucide-react';

interface NotFoundPageProps {
  setCurrentTab: (tab: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6 animate-fade-in">
      <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto shadow-inner">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Page Not Found • 404</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Looking for Clean Laundry?
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          The page or section you requested could not be located. You can return to our homepage or schedule a pickup in Hawaii Area, Eldoret.
        </p>
      </div>

      <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setCurrentTab('home')}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Homepage</span>
        </button>

        <button
          onClick={() => setCurrentTab('book')}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Book Laundry Pickup</span>
        </button>

        <a
          href="tel:0741775878"
          className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>Call 0741775878</span>
        </a>
      </div>
    </div>
  );
};
