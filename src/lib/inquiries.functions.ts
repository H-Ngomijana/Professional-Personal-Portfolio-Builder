import { createServerFn } from '@tanstack/react-start';
import { inquirySchema } from './inquiry-schema';

export const submitInquiry = createServerFn({ method: 'POST' })
  .inputValidator((data) => inquirySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { count, error: limitError } = await supabaseAdmin.from('portfolio_inquiries')
      .select('id', { count: 'exact', head: true }).eq('email', data.email)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if (limitError) throw new Error('We could not save your inquiry. Please try again.');
    if ((count ?? 0) >= 3) throw new Error('Please wait before sending another inquiry.');
    const { error } = await supabaseAdmin.from('portfolio_inquiries').insert({
      name: data.name, email: data.email, company: data.company, message: data.message,
    });
    if (error) throw new Error('We could not save your inquiry. Please try again.');
    return { success: true };
  });