import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const result = await signIn(email.trim(), password);
    if (!result.success) {
      setError(result.error || 'Unable to sign in. Please check your details.');
      return;
    }
    navigate('/');
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <button type="button" onClick={() => navigate('/')} className="mb-6 text-sm text-slate-500 hover:text-slate-900">← Back to home</button>
        <h1 className="text-3xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 text-slate-600">Access your Clothes Spa Laundry account.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={isLoading} type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60">
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don’t have an account? <button type="button" onClick={() => navigate('/signup')} className="font-semibold text-slate-900">Create one</button>
        </p>
      </section>
    </main>
  );
};

export default SignInPage;
