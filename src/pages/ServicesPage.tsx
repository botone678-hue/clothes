import React, { useState } from 'react';
import { Service, ServiceCategory } from '../types';
import { Sparkles, Clock, CheckCircle2, ArrowRight, ShieldCheck, Filter } from 'lucide-react';

interface ServicesPageProps {
  services: Service[];
  setCurrentTab: (tab: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services, setCurrentTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Services' },
    { id: 'wash_fold', label: 'Wash & Fold' },
    { id: 'wash_iron', label: 'Wash & Press' },
    { id: 'suits', label: 'Suits & Dry Cleaning' },
    { id: 'bedding', label: 'Duvets & Bedding' },
    { id: 'curtains', label: 'Curtains & Drapes' },
    { id: 'shoes', label: 'Sneakers & Shoes' },
    { id: 'special', label: 'Delicate & Wedding' },
  ];

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Hawaii Area • Eldoret Rate Card</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Laundry, Dry Cleaning & Garment Spa Services
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Transparent prices for all fabric types. All orders include specialized antibacterial rinse,
          fabric conditioning, and professional packaging.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
          >
            <div className="h-52 overflow-hidden relative">
              <img
                src={srv.image_url}
                alt={srv.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white font-black text-sm shadow-md">
                KSh {srv.base_price.toLocaleString()}{' '}
                <span className="text-[11px] font-normal text-sky-300">
                  /{srv.price_type === 'per_kg' ? 'kg' : srv.price_type === 'per_pair' ? 'pair' : 'item'}
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                    {srv.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    {srv.estimated_duration}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-sky-600 transition">
                  {srv.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sanitized & Scented</span>
                </div>
                <button
                  onClick={() => setCurrentTab('book')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Eldoret Delivery Info Callout */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Clothes Spa Quality Standard</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">Have custom garments or bulk commercial needs?</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            We support hotels, Airbnb hosts, sports teams, and institutions in Eldoret with special contract rates.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="tel:0741775878"
            className="px-6 py-3 bg-white text-slate-900 font-bold text-xs rounded-xl text-center hover:bg-slate-100 transition"
          >
            Call 0741775878
          </a>
          <button
            onClick={() => setCurrentTab('contact')}
            className="px-6 py-3 bg-sky-600 text-white font-bold text-xs rounded-xl hover:bg-sky-700 transition cursor-pointer"
          >
            Contact Hawaii Hub
          </button>
        </div>
      </div>
    </div>
  );
};
