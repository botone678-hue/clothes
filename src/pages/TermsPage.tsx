import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Phone } from 'lucide-react';

interface TermsPageProps {
  setCurrentTab: (tab: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold border border-sky-100">
          <FileText className="w-3.5 h-3.5" />
          <span>Clothes Spa Laundry Terms of Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Terms & Conditions of Garment Service
        </h1>
        <p className="text-xs text-slate-500">
          Service agreement for Clothes Spa Laundry, Hawaii Area, Eldoret, Kenya
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Pickup & Delivery Service</h2>
          <p>
            Clothes Spa Laundry provides doorstep pickup and delivery across designated zones in Eldoret, including Hawaii Area, Elgon View, Annex, Kapsoya, Pioneer, Kimumu, Action, Maili Nne, Eldoret CBD, and surrounding neighborhoods. Our standard delivery fee is KSh 150 per order.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Garment Inspection & Care</h2>
          <p>
            All garments are tagged and inspected upon arrival at our Hawaii Area facility. We follow international fabric care labels. Please remove all personal belongings, coins, pens, and jewelry from pockets before handover.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Turnaround Times</h2>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Wash, Dry & Fold: Typically 24 hours.</li>
            <li>Wash & Ironing: 24 to 48 hours.</li>
            <li>Dry Cleaning & Heavy Bedding: 48 hours.</li>
            <li>Specialty Wedding Gowns: 72 hours.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Payment & Receipts</h2>
          <p>
            We accept Lipa na M-Pesa (Pochi la Biashara: 0741775878) and Cash on Delivery / Collection. Transparent digital receipts and live order tracking are generated for every order.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. Contact Information</h2>
          <p>
            For inquiries or special requests, please call or WhatsApp our Eldoret facility at{' '}
            <a href="tel:0741775878" className="text-sky-600 font-bold hover:underline">
              0741775878
            </a>.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setCurrentTab('home')}
            className="text-xs font-bold text-slate-700 hover:text-sky-600 cursor-pointer"
          >
            ← Back to Home
          </button>
          <button
            onClick={() => setCurrentTab('book')}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition cursor-pointer"
          >
            Schedule a Pickup
          </button>
        </div>
      </div>
    </div>
  );
};
