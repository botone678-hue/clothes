import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck, Truck, UserPlus, X } from 'lucide-react';
import { createPrivilegedAccount, PrivilegedRole } from '../../lib/privilegedAccounts';
import { normalizeKenyanPhone } from '../../lib/mpesa';

interface Props { onCreated?: () => void; }

export const PrivilegedAccountManager: React.FC<Props> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<PrivilegedRole>('driver');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [vehicleRegistration, setVehicleRegistration] = useState('');
  const [zone, setZone] = useState('Hawaii Area & Eldoret');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setFullName(''); setEmail(''); setPhone(''); setPassword(''); setVehicle(''); setVehicleRegistration('');
    setError(null); setSuccess(null); setShowPassword(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null);
    if (password.length < 8) { setError('Use a password of at least 8 characters.'); return; }
    setLoading(true);
    try {
      await createPrivilegedAccount({
        role,
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        phone: phone ? normalizeKenyanPhone(phone) : undefined,
        vehicle_type: role === 'driver' ? vehicle.trim() : undefined,
        vehicle_registration: role === 'driver' ? vehicleRegistration.trim() : undefined,
        zone: role === 'driver' ? zone.trim() : undefined,
      });
      setSuccess(`${role === 'driver' ? 'Driver' : 'Administrator'} account created successfully.`);
      reset();
      setSuccess(`${role === 'driver' ? 'Driver' : 'Administrator'} account created successfully.`);
      onCreated?.();
    } catch (err: any) {
      setError(err?.message || 'Unable to create account.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
          <div><h3 className="font-bold text-slate-900">Privileged Accounts</h3><p className="text-xs text-slate-500">Create secure Admin and Driver login accounts.</p></div>
        </div>
        <button type="button" onClick={() => { reset(); setOpen(true); }} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2"><UserPlus className="w-4 h-4" /> Create Account</button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100"><div><h3 className="font-bold text-lg text-slate-900">Create Privileged Account</h3><p className="text-xs text-slate-500">The account is created through the secure Supabase function.</p></div><button type="button" onClick={() => setOpen(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            {error && <div className="flex gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
            {success && <div className="flex gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>}

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRole('driver')} className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${role === 'driver' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600'}`}><Truck className="w-4 h-4" /> Driver</button>
              <button type="button" onClick={() => setRole('admin')} className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${role === 'admin' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}><KeyRound className="w-4 h-4" /> Admin</button>
            </div>

            <label className="block text-xs font-semibold text-slate-700">Full Name<input required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Full name" /></label>
            <label className="block text-xs font-semibold text-slate-700">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="name@clothesspa.co.ke" /></label>
            <label className="block text-xs font-semibold text-slate-700">Phone<input required={role === 'driver'} type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="07XXXXXXXX" /></label>
            <label className="block text-xs font-semibold text-slate-700">Password<div className="relative mt-1"><input required type={showPassword ? 'text' : 'password'} minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-2.5 text-slate-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></label>

            {role === 'driver' && <>
              <label className="block text-xs font-semibold text-slate-700">Vehicle Type<input required value={vehicle} onChange={e => setVehicle(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Motorcycle / Van" /></label>
              <label className="block text-xs font-semibold text-slate-700">Vehicle Registration<input required value={vehicleRegistration} onChange={e => setVehicleRegistration(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="KDK 412A" /></label>
              <label className="block text-xs font-semibold text-slate-700">Operating Zone<input value={zone} onChange={e => setZone(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></label>
            </>}

            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button><button disabled={loading} type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50">{loading ? 'Creating…' : `Create ${role === 'driver' ? 'Driver' : 'Admin'}`}</button></div>
          </form>
        </div>
      )}
    </>
  );
};
