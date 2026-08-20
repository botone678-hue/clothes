import React from 'react';
import { Sparkles, MapPin, Phone, ShieldCheck, Heart, Users, Clock, Award } from 'lucide-react';

interface AboutPageProps {
  setCurrentTab: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Our Hawaii Area Eldoret Story</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Pioneering Garment Wellness & Convenience in Eldoret
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Founded in the heart of Hawaii Area, Clothes Spa Laundry is redefining garment care in Uasin Gishu County.
          We believe laundry should be treated with the same precision, hygiene, and freshness as a luxury spa treatment.
        </p>
      </div>

      {/* Story & Facility Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Hospital-Grade Hygiene Meets Fragrant Elegance
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Clothes Spa was built to solve the frustration of harsh chemicals, faded colors, missed pickup times, and
              lost buttons. Our modern facility in Hawaii Area, Eldoret uses gentle enzyme-based detergents, calibrated water
              temperatures, and specialized steam pressing equipment.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              From everyday campus and office wear to delicate wedding dresses and heavy winter duvets, each garment is
              individually inspected, tagged, treated, and hand-finished with utmost care.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100">
              <div className="text-2xl font-black text-sky-700">100%</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Hygienic Scent & Color Care</div>
            </div>
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <div className="text-2xl font-black text-indigo-700">24-48h</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Fast Doorstep Turnaround</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1000&q=80"
              alt="Clothes Spa Steam Pressing Station"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <span className="text-xs font-bold text-sky-300">Hawaii Hub Facility</span>
                <p className="text-sm font-semibold">Precision steam finishing & garment care in Eldoret</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Why Eldoret Trusts Clothes Spa</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Garment Safety Guarantee</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We never mix garments between customers. Each client's load is washed, dried, and pressed in dedicated
              sterile batches.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Punctual Eldoret Pickup</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our dedicated delivery dispatch fleet navigates Hawaii Area, Elgon View, Annex, Kapsoya, and CBD with
              guaranteed pickup time windows.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Eco & Skin-Safe Formulas</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Hypoallergenic, dermatologist-friendly detergents that preserve fabric elasticity and keep colors vibrant
              without irritating sensitive skin.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-black">Experience the Clothes Spa Difference</h3>
        <p className="text-sky-100 max-w-xl mx-auto text-sm">
          Call <strong>0741775878</strong> or book online in 2 minutes for doorstep collection in Hawaii Area and Eldoret.
        </p>
        <button
          onClick={() => setCurrentTab('book')}
          className="px-8 py-4 bg-white text-sky-800 hover:bg-sky-50 font-bold text-sm rounded-2xl shadow-xl transition cursor-pointer"
        >
          Book Your First Pickup
        </button>
      </div>
    </div>
  );
};
