import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
export const Route = createFileRoute('/auth')({ head: () => ({ meta: [{ title: 'Owner sign in — Hugues B.' }, { name: 'description', content: 'Secure owner access for the Hugues B. portfolio.' }, { property: 'og:title', content: 'Owner sign in — Hugues B.' }, { property: 'og:description', content: 'Private portfolio management.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }), component: Auth });
function Auth() {
  const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { let live = true; void supabase.auth.getUser().then(({ data }) => { if (live && data.user) void navigate({ to: '/admin' }); }); return () => { live = false; }; }, [navigate]);
  async function signIn() { setBusy(true); setError(''); try { const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/auth` }); if (result.error) throw result.error; if (!result.redirected) { const { data } = await supabase.auth.getUser(); if (data.user) await navigate({ to: '/admin' }); } } catch { setError('Sign-in could not be completed. Please try again.'); } finally { setBusy(false); } }
  return <main className="owner-auth section-container"><Link className="brand" to="/">Hugues B.</Link><span className="eyebrow">Private studio</span><h1 className="section-title">Welcome <em>back.</em></h1><p>Sign in with your portfolio owner account.</p><Button onClick={signIn} disabled={busy}>{busy ? 'Connecting…' : 'Continue with Google'}</Button>{error && <p role="alert">{error}</p>}<Link to="/">Return to portfolio</Link></main>;
}
