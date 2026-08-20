import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/storage';
import { CustomerAddress } from '../types';
import { MapPin, Plus, CheckCircle2, Trash2, Home, Building, Sparkles } from 'lucide-react';

export const CustomerAddresses: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [area, setArea] = useState('Hawaii Area');
  const [addressText, setAddressText] = useState('');
  const [details, setDetails] = useState('');

  const ELDORET_AREAS = [
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

  const loadAddresses = async () => {
    if (user) {
      const list = await db.getAddresses(user.id);
      setAddresses(list);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !addressText) return;

    await db.saveAddress({
      customer_id: user.id,
      area,
      address: addressText,
      additional_details: details,
      is_default: addresses.length === 0,
    });

    setAddressText('');
    setDetails('');
    setIsAdding(false);
    loadAddresses();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
            Address Book
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Saved Pickup & Delivery Locations
          </h1>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Add Address Form */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-3xl p-6 border border-sky-200 shadow-xl space-y-4 animate-fade-in"
        >
          <h3 className="font-bold text-slate-900 text-base">Add New Eldoret Address</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Eldoret Estate / Area</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {ELDORET_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                House / Street / Apartment
              </label>
              <input
                type="text"
                required
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="e.g. Hawaii Court, Gate 3, House #12"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Directions / Landmarks (Optional)
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Opposite Hawaii Total Station, near Eldoret Kapsabet bypass"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Address Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-900">No Saved Addresses</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save your Hawaii Area, Elgon View, or Eldoret home location to book laundry in 1 click!
            </p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{addr.area}</h4>
                    {addr.is_default && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{addr.address}</p>
                  {addr.additional_details && (
                    <p className="text-[11px] text-slate-400 mt-1">{addr.additional_details}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
