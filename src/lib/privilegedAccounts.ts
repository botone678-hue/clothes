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
    throw new Error(error.message || 'Unable to create privileged account.');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Unable to create privileged account.');
  }

  return data.account;
}
