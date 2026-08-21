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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseOnline] = useState(isSupabaseConfigured);

  const clearLocalAuth = () => setUser(null);

  const loadProfileForSession = async (authUserId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (error) {
      console.error('Unable to load authenticated profile:', error);
      return null;
    }
    return data ? (data as Profile) : null;
  };

  const waitForProfile = async (authUserId: string, attempts = 8): Promise<Profile | null> => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const profile = await loadProfileForSession(authUserId);
      if (profile) return profile;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300 + attempt * 250));
      }
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) setIsLoading(false);
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
        if (!mounted) return;

        if (profile && profile.status === 'active') {
          setUser(profile);
        } else {
          await supabase.auth.signOut();
          setUser(null);
        }
      } catch (error) {
        console.error('Supabase session load error:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    setIsLoading(true);
    initAuth();

    if (!isSupabaseConfigured) {
      return () => { mounted = false; };
    }

    // Do not perform async profile/database work directly inside the Supabase
    // auth callback. Queue it after the callback returns to avoid auth-lock/race
    // conditions that can make the customer page appear to crash after login.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        clearLocalAuth();
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setTimeout(async () => {
          if (!mounted) return;
          try {
            const profile = await loadProfileForSession(session.user.id);
            if (!mounted) return;

            if (profile && profile.status === 'active') {
              setUser(profile);
            } else {
              await supabase.auth.signOut();
              setUser(null);
            }
          } catch (error) {
            console.error('Authenticated profile load failed:', error);
            if (mounted) setUser(null);
          } finally {
            if (mounted) setIsLoading(false);
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password?: string, _role?: UserRole) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication is not configured. Please connect Supabase Auth.' };
    }
    if (!password) return { success: false, error: 'Password is required.' };

    setIsLoading(true);
    clearLocalAuth();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        setIsLoading(false);
        const message = error?.message || 'Invalid email or password.';
        return { success: false, error: message };
      }

      const profile = await waitForProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        setIsLoading(false);
        return {
          success: false,
          error: 'Your account was found, but your customer profile is still being created. Please wait a moment and try again.',
        };
      }

      if (profile.status !== 'active') {
        await supabase.auth.signOut();
        setIsLoading(false);
        return { success: false, error: 'Your account is not active. Contact an administrator.' };
      }

      setUser(profile);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error?.message || 'Unable to sign in.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    _role: UserRole = 'customer'
  ) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication is not configured. Please connect Supabase Auth.' };
    }

    setIsLoading(true);
    clearLocalAuth();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone,
            role: 'customer',
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        setIsLoading(false);
        return { success: false, error: 'Unable to create your account.' };
      }

      // When email confirmation is enabled Supabase returns no session. Keep
      // the user logged out and tell the UI to verify the email before login.
      if (!data.session) {
        setIsLoading(false);
        return {
          success: true,
          error: 'Account created. Please confirm your email address, then sign in.',
        };
      }

      const profile = await waitForProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        setIsLoading(false);
        return {
          success: false,
          error: 'Account created, but your customer profile is still being prepared. Please sign in again in a moment.',
        };
      }

      setUser(profile);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error?.message || 'Unable to create your account.' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase signout error:', error);
    } finally {
      clearLocalAuth();
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Authentication is not configured.' };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, message: `Password reset instructions have been sent to ${email}. Check your inbox.` };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Unable to send password reset instructions.' };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
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
