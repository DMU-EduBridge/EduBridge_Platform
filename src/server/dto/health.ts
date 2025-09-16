import { z } from 'zod';

export const HealthResponseSchema = z.object({
  status: z.string(),
  checks: z.any().optional(),
  timestamp: z.string().optional(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
