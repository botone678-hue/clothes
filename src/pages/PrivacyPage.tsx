import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, Phone } from 'lucide-react';

interface PrivacyPageProps {
  setCurrentTab: (tab: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold border border-sky-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Clothes Spa Laundry Privacy Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Privacy Policy & Data Protection
        </h1>
        <p className="text-xs text-slate-500">
          Last updated: January 2025 • Clothes Spa Laundry, Hawaii Area, Eldoret, Kenya
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            At Clothes Spa Laundry (Hawaii Area, Eldoret, Kenya), we collect information strictly necessary to fulfill your laundry booking, doorstep pickup, and delivery services:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Contact details: Full name, Kenyan phone number (e.g. 0741775878), and email address.</li>
            <li>Location details: Eldoret estate/area (e.g., Hawaii Area, Elgon View, Annex, Kapsoya) and specific building/doorstep descriptions.</li>
            <li>Garment specifications and care instructions provided during booking.</li>
            <li>M-Pesa transaction reference numbers when payments are completed.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. How We Use Your Data</h2>
          <p>
            Your information is used solely to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Dispatch our verified Eldoret delivery drivers to your pickup and delivery address.</li>
            <li>Send real-time SMS or status updates on your order progress.</li>
            <li>Verify M-Pesa automated receipts and maintain transparent order history.</li>
            <li>Improve our customer service and garment care quality in Eldoret.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Data Security & Storage</h2>
          <p>
            We implement strict security standards to ensure personal data is never sold, leased, or shared with third-party marketers. Driver assignment details are shared only with the specific driver assigned to your route.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Contact Our Data Desk</h2>
          <p>
            If you have questions regarding your data or wish to update your profile details, contact our operations desk in Hawaii Area, Eldoret at{' '}
            <a href="tel:0741775878" className="text-sky-600 font-bold hover:underline">
              0741775878
            </a>{' '}
            or email <strong>info@clothesspalaundry.co.ke</strong>.
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
            Book a Pickup
          </button>
        </div>
      </div>
    </div>
  );
};
