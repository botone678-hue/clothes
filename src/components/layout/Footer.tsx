import React from 'react';
import { Sparkles, Phone, MapPin, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">Clothes Spa</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-sky-900/60 text-sky-300 rounded uppercase">
                  Laundry
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Eldoret's premier laundry, dry cleaning, and specialized garment care spa. Serving Hawaii Area, Elgon View,
              Annex, Kapsoya, and surrounding Eldoret neighborhoods with professional pickup and doorstep delivery.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Scent & Color Care Guarantee</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('services')}
                  className="text-slate-400 hover:text-sky-400 transition cursor-pointer"
                >
                  Services & Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('book')}
                  className="text-slate-400 hover:text-sky-400 transition cursor-pointer"
                >
                  Book Laundry Pickup
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('tracking')}
                  className="text-slate-400 hover:text-sky-400 transition cursor-pointer"
                >
                  Live Order Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="text-slate-400 hover:text-sky-400 transition cursor-pointer"
                >
                  About Hawaii Area Facility
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('contact')}
                  className="text-slate-400 hover:text-sky-400 transition cursor-pointer"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Services */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Popular Services</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex justify-between py-1 border-b border-slate-900">
                <span>Wash, Dry & Fold</span>
                <span className="text-sky-400 font-semibold">KSh 150/kg</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-900">
                <span>Wash & Steam Pressing</span>
                <span className="text-sky-400 font-semibold">KSh 80/item</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-900">
                <span>Executive Suits Dry Cleaning</span>
                <span className="text-sky-400 font-semibold">KSh 600/suit</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-900">
                <span>Heavy Duvet & Blankets Spa</span>
                <span className="text-sky-400 font-semibold">KSh 700/duvet</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-900">
                <span>Sneaker Deep Clean & Spa</span>
                <span className="text-sky-400 font-semibold">KSh 350/pair</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Eldoret Location */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Hawaii Area, Eldoret</h3>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>Hawaii Area, Eldoret, Uasin Gishu County, Kenya</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <a href="tel:0741775878" className="text-white font-bold hover:text-amber-300 transition">
                0741775878
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>info@clothesspalaundry.co.ke</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-slate-400 pt-1">
              <Clock className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-300">Mon - Sat: 7:00 AM - 8:00 PM</p>
                <p>Sunday: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
            <div className="pt-2 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <span className="text-emerald-400 font-bold">M-Pesa Pochi la Biashara: </span>
              <span className="font-mono text-white font-bold tracking-wider">0741775878</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Clothes Spa Laundry. All rights reserved. Hawaii Area, Eldoret, Kenya.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentTab('privacy')} className="hover:text-slate-300">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('terms')} className="hover:text-slate-300">
              Terms of Service
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> in Eldoret
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
