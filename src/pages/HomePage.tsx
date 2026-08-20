import React from 'react';
import { Service } from '../types';
import { PriceCalculator } from '../components/common/PriceCalculator';
import {
  Sparkles,
  Phone,
  ArrowRight,
  ShieldCheck,
  Truck,
  Clock,
  CheckCircle2,
  MapPin,
  HeartHandshake,
  Star,
  Award,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface HomePageProps {
  services: Service[];
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ services, setCurrentTab, onOpenAuth }) => {
  const eldoretAreas = [
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
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white pt-12 sm:pt-16 pb-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Premier Garment Spa in Hawaii Area, Eldoret</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Flawless laundry & dry cleaning,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
                  delivered fresh in Eldoret.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Experience hospital-grade sanitization, scented fabric softening, and precision steam pressing.
                We pick up from your doorstep in Hawaii Area and across Eldoret, then return your garments crisp and ready to wear.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="hero-book-btn"
                  onClick={() => setCurrentTab('book')}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-sky-600/25 hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5 text-sky-200" />
                  <span>Book Laundry Service</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  href="tel:0741775878"
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base rounded-2xl border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5 text-sky-600" />
                  <span>Call 0741775878</span>
                </a>
              </div>

              {/* Micro Trust Proof */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Gentle Fabric & Color Shield</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold">Fast 24-48h Turnaround</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold">Doorstep Eldoret Pickup</span>
                </div>
              </div>
            </div>

            {/* Right Col: Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Floating Badge 1 */}
                <div className="absolute -top-4 -left-4 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase">M-Pesa Supported</p>
                    <p className="text-xs font-black text-slate-900">Buy Goods Till: 174379</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -bottom-5 -right-4 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Operating Hub</p>
                    <p className="text-xs font-black text-slate-900">Hawaii Area, Eldoret</p>
                  </div>
                </div>

                {/* Main Hero Image */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] relative">
                  <img
                    src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1000&q=80"
                    alt="Clothes Spa Laundry Eldoret Facility"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-6">
                    <div className="text-white">
                      <p className="text-xs font-semibold text-sky-200">Clothes Spa Laundry</p>
                      <h4 className="text-lg font-bold">Crisp. Sanitized. Fragrant.</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR SERVICES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 rounded-full border border-sky-100">
            Specialized Garment Spa
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Laundry & Dry Cleaning Services
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            From daily workwear to king-size duvets and bespoke wedding dresses, we treat every fiber with dedicated care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 8).map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={srv.image_url}
                  alt={srv.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-black text-slate-900 shadow-xs">
                  KSh {srv.base_price.toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-500 ml-0.5">
                    /{srv.price_type === 'per_kg' ? 'kg' : srv.price_type === 'per_pair' ? 'pair' : 'item'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    {srv.estimated_duration}
                  </span>
                  <button
                    onClick={() => setCurrentTab('book')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                  >
                    Select <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => setCurrentTab('services')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition cursor-pointer"
          >
            View Full Service & Pricing Menu
          </button>
        </div>
      </section>

      {/* 3. HOW IT WORKS (4 STEPS) */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-white/10 text-sky-300 rounded-full">
              Effortless Routine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How Clothes Spa Works</h2>
            <p className="text-sm sm:text-base text-slate-400">
              Clean laundry delivered to your door in 4 simple steps without lifting a finger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Book Online / Call',
                desc: 'Select your garment services, pick your preferred Eldoret address & convenient pickup time.',
              },
              {
                step: '02',
                title: 'Doorstep Pickup',
                desc: 'Our courteous driver arrives at your Hawaii Area or Eldoret home to collect your laundry bag.',
              },
              {
                step: '03',
                title: 'Spa Processing',
                desc: 'Garments receive custom temperature wash, organic conditioner, stain removal, and steam pressing.',
              },
              {
                step: '04',
                title: 'Fresh Delivery',
                desc: 'Your neatly folded or hanger-hung clothes are returned fresh, sanitized, and smelling wonderful.',
              },
            ].map((st) => (
              <div key={st.step} className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/60 relative">
                <div className="text-3xl font-black text-sky-400 mb-4">{st.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{st.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setCurrentTab('book')}
              className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition cursor-pointer"
            >
              Schedule Your Pickup Now
            </button>
          </div>
        </div>
      </section>

      {/* 4. INSTANT PRICE ESTIMATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 rounded-full border border-sky-100">
            Transparent Pricing
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">Estimate Your Laundry Cost</h2>
          <p className="text-sm text-slate-600">
            No hidden costs. Clear pricing tailored for Eldoret families, students, and professionals.
          </p>
        </div>

        <PriceCalculator services={services} onStartBooking={() => setCurrentTab('book')} />
      </section>

      {/* 5. ELDORET SERVICE COVERAGE & MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-sky-50 via-indigo-50/50 to-white rounded-3xl p-8 sm:p-12 border border-sky-100 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600 text-white rounded-full text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Pickup & Delivery Network</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Serving Hawaii Area & All Major Eldoret Estates
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you are situated along the Eldoret-Kapsabet Road, Hawaii center, Elgon View residences, or
                the bustling CBD, our dispatch drivers provide prompt doorstep collection and delivery.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {eldoretAreas.map((area) => (
                  <div
                    key={area}
                    className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs font-bold text-slate-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base">Clothes Spa Central Hub</h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Open Daily
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <strong>Location:</strong> Hawaii Area, Eldoret, Kenya
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sky-600" />
                    <strong>Hotline:</strong> 0741775878
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <strong>Hours:</strong> Mon-Sat 7:00 AM - 8:00 PM | Sun 9:00 AM - 6:00 PM
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentTab('book')}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Book Pickup from Hawaii / Eldoret
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED CLIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 rounded-full border border-sky-100">
            Client Satisfaction
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">What Eldoret Residents Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Dr. Evans Kiprop',
              location: 'Elgon View, Eldoret',
              comment:
                'Their suit dry cleaning and shirt pressing is unmatched. I sent 4 suits on Monday and got them back Tuesday evening smelling fresh and perfectly pressed on hangers.',
              rating: 5,
            },
            {
              name: 'Faith Chebet',
              location: 'Hawaii Area, Eldoret',
              comment:
                'Clothes Spa is right in our neighborhood. The duvet wash service took away all the dust and allergens. Very fast pickup and the M-Pesa STK push made payment super easy.',
              rating: 5,
            },
            {
              name: 'Brian Mwangi',
              location: 'Annex, Eldoret',
              comment:
                'As a busy professional, I use their weekly Wash, Dry & Fold service. Saves me at least 6 hours every weekend. Courteous drivers and very reliable timing.',
              rating: 5,
            },
          ].map((t, idx) => (
            <div key={idx} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                "{t.comment}"
              </p>
              <div className="pt-2 border-t border-slate-50">
                <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                <p className="text-[11px] text-slate-400">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM BANNER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black">Ready for Fresh, Pristine Laundry?</h3>
            <p className="text-sky-100 text-sm max-w-xl">
              Book online today or call <strong>0741775878</strong> for urgent pickup in Hawaii Area and Eldoret.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('book')}
            className="px-8 py-4 bg-white text-sky-800 hover:bg-sky-50 font-extrabold text-sm rounded-2xl shadow-lg transition cursor-pointer flex-shrink-0"
          >
            Book My Laundry Pickup
          </button>
        </div>
      </section>
    </div>
  );
};
