import React, { useState } from 'react';
import { Phone, MapPin, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact Clothes Spa Laundry
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          We're here to assist with pickups, bulk corporate laundry, specialized wedding garment care, or inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-sky-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Direct Reach</span>
              <h2 className="text-2xl font-bold mt-1">Hawaii Central Facility</h2>
              <p className="text-xs text-sky-200 mt-1">Eldoret, Uasin Gishu County, Kenya</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Physical Location</h4>
                  <p className="text-xs text-slate-300">Hawaii Area, Eldoret, Kenya</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Direct Phone / WhatsApp</h4>
                  <a
                    href="tel:0741775878"
                    className="text-amber-300 font-bold hover:underline block text-base"
                  >
                    0741775878
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Email Address</h4>
                  <p className="text-xs text-slate-300">info@clothesspalaundry.co.ke</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Operating Hours</h4>
                  <p className="text-xs text-slate-300">Monday - Saturday: 7:00 AM - 8:00 PM</p>
                  <p className="text-xs text-slate-300">Sunday: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs">
              <span className="font-bold text-amber-300">M-Pesa Official Till:</span> 174379
              <br />
              <span className="text-slate-300 text-[11px]">Instant automated receipt generation upon payment.</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-xl text-slate-900">Send an Inquiry or Feedback</h3>
          </div>

          {sent ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 text-lg">Message Received!</h4>
              <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                Thank you for reaching out to Clothes Spa Laundry. Our Hawaii Area team will contact you shortly via {phone || 'phone'}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Joy Chelagat"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kenyan Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0741775878"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message or Pickup Request</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your laundry requirements, estate location, or inquiry..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Send Message to Clothes Spa</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
