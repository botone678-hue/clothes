import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  const [isSupabaseOnline] = useState(isSupabaseConfigured);

  const clearLocalAuth = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  const loadProfileForSession = async (authUserId: string): Promise<Profile | null> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (error) {
      console.error('Unable to load authenticated profile:', error);
      return null;
    }

    return profile ? (profile as Profile) : null;
  };

  // The database trigger normally creates the profile immediately after signup.
  // A short retry protects the client from the trigger/profile transaction not
  // being visible yet when Supabase returns from signUp.
  const waitForProfile = async (authUserId: string, attempts = 5): Promise<Profile | null> => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const profile = await loadProfileForSession(authUserId);
      if (profile) return profile;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setIsLoading(true);
      localStorage.removeItem(AUTH_USER_KEY);

      if (!isSupabaseConfigured) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session?.user) {
          if (mounted) setUser(null);
          return;
        }

        const profile = await loadProfileForSession(session.user.id);
        if (mounted) {
          if (profile && profile.status === 'active') {
            setUser(profile);
          } else {
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      } catch (e) {
        console.error('Supabase session load error:', e);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    if (!isSupabaseConfigured) return () => { mounted = false; };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        clearLocalAuth();
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const profile = await loadProfileForSession(session.user.id);
        if (!mounted) return;
        if (profile && profile.status === 'active') {
          setUser(profile);
        } else {
          await supabase.auth.signOut();
          clearLocalAuth();
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password?: string, _role?: UserRole): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication is not configured. Please connect Supabase Auth.' };
    }
    if (!password) return { success: false, error: 'Password is required.' };

    setIsLoading(true);
    clearLocalAuth();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) {
        setIsLoading(false);
        return { success: false, error: error?.message || 'Invalid email or password.' };
      }

      const profile = await waitForProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        setIsLoading(false);
        return { success: false, error: 'Your account profile is not available yet. Please contact an administrator.' };
      }

      if (profile.status && profile.status !== 'active') {
        await supabase.auth.signOut();
        setIsLoading(false);
        return { success: false, error: 'Your account is not active. Contact an administrator.' };
      }

      setUser(profile);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Unable to sign in.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    _role: UserRole = 'customer'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication is not configured. Please connect Supabase Auth.' };
    }

    setIsLoading(true);
    clearLocalAuth();

    try {
      // Public registration is ALWAYS a customer. Privileged roles are never
      // accepted from the browser. The Supabase trigger creates the profile.
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim(), phone, role: 'customer' } },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        setIsLoading(false);
        return { success: false, error: 'Unable to create your account.' };
      }

      // Do not write the profile a second time from the browser. The database
      // trigger is the authoritative profile creator and always forces customer
      // registration to the customer role.
      const newProfile = data.session ? await waitForProfile(data.user.id) : null;

      if (data.session && newProfile) setUser(newProfile);
      else setUser(null);

      setIsLoading(false);
      return {
        success: true,
        ...(data.session ? {} : { error: 'Account created. Please verify your email, then sign in.' }),
      };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Unable to create your account.' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signout error', e);
    } finally {
      clearLocalAuth();
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!isSupabaseConfigured) return { success: false, error: 'Authentication is not configured.' };

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, message: `Password reset instructions have been sent to ${email}. Check your inbox.` };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unable to send password reset instructions.' };
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<Profile | null> => {
    if (!user || !isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('auth_user_id', user.auth_user_id)
      .select('*')
      .single();

    if (error || !data) {
      console.error('Unable to update profile:', error);
      return null;
    }

    setUser(data as Profile);
    return data as Profile;
  };

  const switchUserRole = (_targetRole: UserRole) => {
    console.warn('Client-side role switching is disabled. Roles come only from Supabase profiles.');
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || 'customer',
      isLoading,
      isSupabaseOnline,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      switchUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
