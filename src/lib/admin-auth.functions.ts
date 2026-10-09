import { createHmac, timingSafeEqual } from 'node:crypto';
import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { deleteCookie, getCookie, getRequestIP, getRequestProtocol, setCookie } from '@tanstack/react-start/server';
import { z } from 'zod';
import { getServerEnv } from '@/lib/server-env';

const sessionCookie = 'studio_admin';
const sessionLifetimeSeconds = 8 * 60 * 60;
const loginAttempts = new Map<string, { count: number; resetAt: number; lockedUntil: number }>();
const loginWindowMs = 15 * 60 * 1000;
const loginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(128),
});

function getSessionSecret(): string {
  const secret = getServerEnv('ADMIN_SESSION_SECRET');
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('Admin sign-in is not configured. Set ADMIN_SESSION_SECRET to a random value of at least 32 bytes.');
  }
  return secret;
}

function createSignature(username: string, expiry: string, secret: string): string {
  return createHmac('sha256', secret).update(`${username}:${expiry}`).digest('hex');
}

function hasValidAdminSession(): boolean {
  const value = getCookie(sessionCookie);
  if (!value) return false;
  const separator = value.indexOf('.');
  if (separator < 1) return false;

  const expiry = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!/^\d{10,16}$/.test(expiry) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  if (Number(expiry) <= Date.now()) return false;

  const username = getServerEnv('ADMIN_USERNAME');
  if (!username) throw new Error('Admin sign-in is not configured. Set ADMIN_USERNAME in the server environment.');
  const expected = createSignature(username, expiry, getSessionSecret());
  return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}

export const requireAdminSession = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  if (!hasValidAdminSession()) throw new Error('Unauthorized. Sign in to access the studio.');
  return next({ context: { isAdmin: true } });
});

export const getAdminSession = createServerFn({ method: 'GET' }).handler(async () => ({
  authenticated: hasValidAdminSession(),
}));

export const loginAdmin = createServerFn({ method: 'POST' })
  .inputValidator((data) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const username = getServerEnv('ADMIN_USERNAME');
    const password = getServerEnv('ADMIN_PASSWORD');
    if (!username || !password) {
      throw new Error(
        'Admin sign-in is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in the server environment.',
      );
    }

    const now = Date.now();
    const address = getRequestIP() ?? 'unknown';
    let attempts = loginAttempts.get(address);
    if (!attempts || attempts.resetAt <= now) {
      attempts = { count: 0, resetAt: now + loginWindowMs, lockedUntil: 0 };
      loginAttempts.set(address, attempts);
    }
    if (attempts.lockedUntil > now) return { success: false };

    const normalizedUsername = Buffer.from(data.username.toLowerCase());
    const expectedUsername = Buffer.from(username.toLowerCase());
    const providedPassword = Buffer.from(data.password);
    const expectedPassword = Buffer.from(password);
    const usernameMatches = normalizedUsername.length === expectedUsername.length
      && timingSafeEqual(normalizedUsername, expectedUsername);
    const passwordMatches = providedPassword.length === expectedPassword.length
      && timingSafeEqual(providedPassword, expectedPassword);
    if (!usernameMatches || !passwordMatches) {
      attempts.count += 1;
      if (attempts.count >= 5) attempts.lockedUntil = now + loginWindowMs;
      if (loginAttempts.size > 1000) {
        for (const [key, value] of loginAttempts) {
          if (value.resetAt <= now && value.lockedUntil <= now) loginAttempts.delete(key);
        }
      }
      return { success: false };
    }

    loginAttempts.delete(address);
    const secret = getSessionSecret();
    const expiry = String(Date.now() + sessionLifetimeSeconds * 1000);
    setCookie(sessionCookie, `${expiry}.${createSignature(username, expiry, secret)}`, {
      httpOnly: true,
      secure: getRequestProtocol() === 'https',
      sameSite: 'lax',
      path: '/',
      maxAge: sessionLifetimeSeconds,
    });
    return { success: true };
  });

export const logoutAdmin = createServerFn({ method: 'POST' }).handler(async () => {
  deleteCookie(sessionCookie, {
    httpOnly: true,
    secure: getRequestProtocol() === 'https',
    sameSite: 'lax',
    path: '/',
  });
  return { success: true };
});
