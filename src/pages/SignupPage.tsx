import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Lock, Mail, Phone, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { normalizeKenyanPhone } from '../lib/mpesa';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signUp(email, password, fullName, normalizeKenyanPhone(phone), 'customer');
      if (!result.success) {
        setError(result.error || 'Registration failed. Please try again.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/'), 900);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="px-6 pt-7 pb-5 bg-gradient-to-r from-sky-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-sky-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-100">Clothes Spa Laundry • Eldoret</span>
          </div>
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-sm text-sky-100 mt-1">Join Clothes Spa and manage your laundry orders online.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
          {success && <div className="flex gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm"><CheckCircle2 className="w-5 h-5" /><span>Account created successfully. Redirecting…</span></div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative"><User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" /><input id="signup-page-name" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" /></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (M-Pesa)</label>
            <div className="relative"><Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" /><input id="signup-page-phone" required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0741775878" className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" /></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" /><input id="signup-page-email" required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" /></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" /><input id="signup-page-password" required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" /></div>
          </div>

          <button disabled={loading || success} type="submit" className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition disabled:opacity-50">{loading ? 'Creating Account…' : 'Create My Account'}</button>
          <p className="text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">Sign In</Link></p>
        </form>
      </div>
    </div>
  );
};
