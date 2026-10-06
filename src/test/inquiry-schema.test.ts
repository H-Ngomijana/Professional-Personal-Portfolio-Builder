import { describe, expect, it } from 'vitest';
import { inquirySchema } from '@/lib/inquiry-schema';

const valid = { name: 'Alex Example', email: 'alex@example.com', company: 'Example', message: 'We are launching a new project.' };
describe('Inquiry validation', () => {
  it('accepts a complete inquiry', () => expect(inquirySchema.parse(valid).name).toBe('Alex Example'));
  it('rejects invalid email addresses', () => expect(inquirySchema.safeParse({ ...valid, email: 'invalid' }).success).toBe(false));
  it('rejects empty messages', () => expect(inquirySchema.safeParse({ ...valid, message: '' }).success).toBe(false));
  it('rejects filled bot honeypots', () => expect(inquirySchema.safeParse({ ...valid, website: 'spam.example' }).success).toBe(false));
});