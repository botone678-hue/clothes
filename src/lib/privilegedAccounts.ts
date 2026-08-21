import { supabase } from './supabase';

export type PrivilegedRole = 'admin' | 'driver';

export interface CreatePrivilegedAccountInput {
  role: PrivilegedRole;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  vehicle_type?: string;
  vehicle_registration?: string;
  zone?: string;
}

export async function createPrivilegedAccount(input: CreatePrivilegedAccountInput) {
  const { data, error } = await supabase.functions.invoke('create-privileged-account', {
    body: input,
  });

  if (error) {
    let detail = '';
    try {
      const context = (error as any).context;
      if (context?.clone) {
        const response = context.clone();
        const text = await response.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            detail = parsed?.error || parsed?.message || text;
          } catch {
            detail = text;
          }
        }
      }
    } catch {
      // Keep the SDK error when the response body cannot be read.
    }

    throw new Error(detail || error.message || 'Unable to create privileged account.');
  }

  if (!data?.success) {
    throw new Error(data?.error || data?.message || 'Unable to create privileged account.');
  }

  return data.account;
}
