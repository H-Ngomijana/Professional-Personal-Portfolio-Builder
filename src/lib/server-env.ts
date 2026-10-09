import { getRequest } from '@tanstack/react-start/server';

interface CloudflareRequest extends Request {
  runtime?: {
    cloudflare?: {
      env?: Record<string, unknown>;
    };
  };
}

export function getServerEnv(name: string): string | undefined {
  const runtimeEnv = (getRequest() as CloudflareRequest).runtime?.cloudflare?.env;
  const runtimeValue = runtimeEnv?.[name];
  return typeof runtimeValue === 'string' ? runtimeValue : process.env[name];
}

export function getSupabaseAdminKey(): string | undefined {
  return getServerEnv('SUPABASE_SERVICE_ROLE_KEY') || getServerEnv('SUPABASE_SECRET_KEY');
}
