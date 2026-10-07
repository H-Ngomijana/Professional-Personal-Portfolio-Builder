import { z } from 'zod';
export const packageSchema = z.object({
  id: z.string().uuid().optional(), name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2000),
  features: z.array(z.string().trim().min(1).max(150)).max(20),
  price: z.number().finite().positive().max(9999999999),
  currency: z.enum(['RWF', 'USD']), published: z.boolean(),
});
