import { z } from 'zod';

export const AlertConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  severity: z.enum(['low', 'medium', 'high']).or(z.string()),
  threshold: z.number().optional(),
  value: z.number().optional(),
  timestamp: z.string().optional(),
});

export const AlertChannelSchema = z.object({
  name: z.string(),
  status: z.string(),
});

export const AlertStatusResponseSchema = z.object({
  alerts: z.array(AlertConfigSchema),
  channels: z.array(AlertChannelSchema),
  timestamp: z.string(),
});

export const AlertTestResponseSchema = z.object({
  message: z.string(),
  timestamp: z.string(),
});

export const AlertPostBodySchema = z.object({
  action: z.enum(['register_alert', 'add_channel']).or(z.string()),
  alertId: z.string().optional(),
  config: z.any().optional(),
  channelConfig: z
    .object({
      type: z.string(),
      webhookUrl: z.string().url().optional(),
    })
    .optional(),
});

export type AlertStatusResponse = z.infer<typeof AlertStatusResponseSchema>;
export type AlertTestResponse = z.infer<typeof AlertTestResponseSchema>;
