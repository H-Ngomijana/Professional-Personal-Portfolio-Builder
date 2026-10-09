import { z } from 'zod';

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(150).default(''),
  message: z.string().trim().min(10).max(5000),
  packageId: z.string().uuid().optional().or(z.literal('')),
  packageName: z.string().trim().max(100).default(''),
  phone: z.string().trim().max(40).default(''),
  country: z.string().trim().max(100).default(''),
  paymentOption: z.enum(['once', 'milestones']).optional(),
  orderSubmission: z.boolean().default(false),
  agreement: z.boolean().default(false),
  website: z.string().max(0).default(''),
}).superRefine((value, context) => {
  if (value.orderSubmission && !value.agreement) {
    context.addIssue({ code: 'custom', path: ['agreement'], message: 'Please accept the project agreement to continue.' });
  }
});
