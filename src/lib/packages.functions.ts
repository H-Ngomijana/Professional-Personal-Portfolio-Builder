import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { packageSchema } from './packages-schema';
import type { Database } from '@/integrations/supabase/types';

export const listPackages = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Packages are unavailable. Please try again.');
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.from('developer_packages').select('id,name,description,features,price,currency').eq('published', true).order('created_at');
  if (error) throw new Error('Packages could not be loaded.');
  return data ?? [];
});

export const ownerDashboard = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: identity, error: identityError } = await context.supabase.auth.getUser();
  const user = identity.user;
  if (identityError || !user?.email_confirmed_at || user.email?.toLowerCase() !== 'huguesblessy@gmail.com') throw new Error('This area is reserved for the portfolio owner.');
  const { data: hasRole, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (roleError) throw new Error('Owner access could not be verified.');
  if (!hasRole) {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.from('user_roles').upsert({ user_id: context.userId, role: 'admin' }, { onConflict: 'user_id,role' });
    if (error) throw new Error('Owner access could not be activated.');
  }
  const [packages, inquiries] = await Promise.all([
    context.supabase.from('developer_packages').select('*').order('created_at'),
    context.supabase.from('portfolio_inquiries').select('*').order('created_at', { ascending: false }).limit(100),
  ]);
  if (packages.error || inquiries.error) throw new Error('Your dashboard could not be loaded.');
  return { packages: packages.data ?? [], inquiries: inquiries.data ?? [] };
});

export const savePackage = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((data) => packageSchema.parse(data)).handler(async ({ data, context }) => {
  const { data: admin, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (roleError || !admin) throw new Error('Only the portfolio owner can manage packages.');
  const { id, ...values } = data;
  const result = id ? await context.supabase.from('developer_packages').update(values).eq('id', id).select('id').single() : await context.supabase.from('developer_packages').insert(values).select('id').single();
  if (result.error) throw new Error('Package could not be saved.');
  return { id: result.data.id };
});
