import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db, INITIAL_ADMIN, INITIAL_DRIVERS } from '../lib/storage';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isSupabaseOnline: boolean;
  signIn: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | null>;
  switchUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_KEY = 'csl_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(isSupabaseConfigured);

  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (!error && session?.user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('auth_user_id', session.user.id).single();
            if (profile) { setUser(profile); setIsLoading(false); return; }
          }
        } catch (e) { console.warn('Supabase session load error:', e); }
      }

      try {
        const stored = localStorage.getItem(AUTH_USER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } else {
          const defaultCustomer: Profile = {
            id: 'cust-demo-1', full_name: 'Wanjiku Mwangi', email: 'wanjiku.mwangi@gmail.com', phone: '0741775878',
            role: 'customer', status: 'active',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          };
          setUser(defaultCustomer);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultCustomer));
        }
      } catch (e) { console.error('Error loading stored user:', e); }
      finally { setIsLoading(false); }
    }

    initAuth();
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('auth_user_id', session.user.id).single();
          if (profile) { setUser(profile); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile)); }
        }
      });
      return () => authListener.subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password?: string, role?: UserRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setIsLoading(false); return { success: false, error: error.message }; }
        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('auth_user_id', data.user.id).single();
          if (profile) { setUser(profile); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile)); setIsLoading(false); return { success: true }; }
        }
      } catch (err: any) { console.warn('Supabase signin error, checking local profiles:', err); }
    }

    const profiles = await db.getProfiles();
    let matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      matched = await db.saveProfile({
        full_name: email.split('@')[0].replace('.', ' '), email, phone: '0741775878',
        role: 'customer', status: 'active',
      });
    }
    setUser(matched); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matched)); setIsLoading(false);
    return { success: true };
  };

  const signUp = async (
    email: string, password: string, fullName: string, phone: string, _role: UserRole = 'customer'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const customerRole: UserRole = 'customer';

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, phone, role: customerRole } },
        });
        if (error) { setIsLoading(false); return { success: false, error: error.message }; }
        if (data.user) {
          const newProfile = await db.saveProfile({ auth_user_id: data.user.id, full_name: fullName, email, phone, role: customerRole, status: 'active' });
          setUser(newProfile); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newProfile)); setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) { console.warn('Supabase signup fallback to database profile:', err); }
    }

    const newProfile = await db.saveProfile({ full_name: fullName, email, phone, role: customerRole, status: 'active' });
    setUser(newProfile); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newProfile)); setIsLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try { await supabase.auth.signOut(); } catch (e) { console.error('Supabase signout error', e); }
    }
    const guestCustomer: Profile = {
      id: `cust-${Date.now()}`, full_name: 'Guest Customer', email: 'guest@clothesspa.co.ke', phone: '0741775878',
      role: 'customer', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    setUser(guestCustomer); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestCustomer));
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) return { success: false, error: error.message };
        return { success: true, message: `Password reset instructions have been sent to ${email}. Check your inbox.` };
      } catch (err: any) { return { success: false, error: err.message }; }
    }
    return { success: true, message: `Password reset link generated for ${email}. (In production with Supabase, an email with a secure token is dispatched).` };
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<Profile | null> => {
    if (!user) return null;
    const updated = await db.saveProfile({ ...user, ...updates });
    setUser(updated); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    return updated;
  };

  const switchUserRole = (targetRole: UserRole) => {
    // Role switching is a development-only tester feature. Never allow it in production.
    if (!import.meta.env.DEV) return;
    if (targetRole === 'admin') {
      setUser(INITIAL_ADMIN); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(INITIAL_ADMIN));
    } else if (targetRole === 'driver') {
      const driver = INITIAL_DRIVERS[0]; setUser(driver); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(driver));
    } else {
      const cust: Profile = {
        id: 'cust-demo-1', full_name: 'Wanjiku Mwangi', email: 'wanjiku.mwangi@gmail.com', phone: '0741775878', role: 'customer', status: 'active',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      setUser(cust); localStorage.setItem(AUTH_USER_KEY, JSON.stringify(cust));
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || 'customer', isLoading, isSupabaseOnline, signIn, signUp, signOut, resetPassword, updateProfile, switchUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
