import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitInquiry } from '@/lib/inquiries.functions';

export function InquiryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      await submitInquiry({ data: { name: String(form.get('name')), email: String(form.get('email')), company: String(form.get('company') ?? ''), message: String(form.get('message')), website: String(form.get('website') ?? '') } });
      setSent(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={(value) => { onOpenChange(value); if (!value) { setSent(false); setError(''); } }}>
    <DialogContent className="max-h-[90svh] overflow-y-auto">
      <DialogTitle className="font-display text-4xl font-normal">Let’s ascend together.</DialogTitle>
      <DialogDescription>Tell us about your next chapter.</DialogDescription>
      {sent ? <div className="form-success" role="status"><CheckCircle2 /><h3>Your next chapter starts here.</h3><p>Your inquiry has been received. Thank you for reaching out.</p><Button variant="secondary" onClick={() => onOpenChange(false)}>Back to Ascend</Button></div> :
      <form className="inquiry-form" onSubmit={handleSubmit}>
        <div className="form-row"><label>Your name<Input name="name" placeholder="Full name" required minLength={2} maxLength={100} autoComplete="name" /></label><label>Email address<Input name="email" type="email" placeholder="you@company.com" required maxLength={254} autoComplete="email" /></label></div>
        <label>Company / project<Input name="company" placeholder="Your brand or project" maxLength={150} autoComplete="organization" /></label>
        <label>What are you building?<Textarea name="message" placeholder="Tell us about your vision…" required minLength={10} maxLength={5000} /></label>
        <label className="form-honeypot" aria-hidden="true">Website<Input name="website" tabIndex={-1} autoComplete="off" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button disabled={busy} type="submit" className="portfolio-button">{busy ? <Loader2 className="animate-spin" /> : <ArrowUpRight />} {busy ? 'Sending…' : 'Send inquiry'}</Button>
      </form>}
    </DialogContent>
  </Dialog>;
}