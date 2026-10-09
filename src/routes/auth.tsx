import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { KeyRound, LoaderCircle, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginAdmin } from '@/lib/admin-auth.functions';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Owner sign in — Hugues B.' },
    { name: 'description', content: 'Secure owner access for the Hugues B. portfolio.' },
    { property: 'og:title', content: 'Owner sign in — Hugues B.' },
    { property: 'og:description', content: 'Private portfolio management.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const result = await loginAdmin({
        data: {
          username: String(form.get('username') ?? ''),
          password: String(form.get('password') ?? ''),
        },
      });
      if (!result.success) {
        setError('The username or password is incorrect.');
        return;
      }
      await navigate({ to: '/admin' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign-in could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="owner-auth section-container">
    <Link className="brand" to="/">Hugues B.</Link>
    <span className="eyebrow">Private studio / Secure access</span>
    <LockKeyhole className="auth-mark" aria-hidden="true" />
    <h1 className="section-title">Welcome <em>back.</em></h1>
    <p>Sign in to manage project packages and client inquiries.</p>
    <form className="inquiry-form auth-form" onSubmit={handleSubmit}>
      <label>Username<Input name="username" required autoComplete="username" maxLength={80} /></label>
      <label>Password<Input name="password" type="password" required autoComplete="current-password" maxLength={128} /></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <Button type="submit" disabled={busy} className="portfolio-button">{busy ? <LoaderCircle className="animate-spin" /> : <KeyRound />}{busy ? 'Signing in…' : 'Sign in securely'}</Button>
    </form>
    <Link to="/">Return to portfolio</Link>
  </main>;
}
