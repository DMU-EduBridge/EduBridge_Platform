import { z } from 'zod';

export const MaterialItemSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  subject: z.string(),
  difficulty: z.string(),
  estimatedTime: z.number().optional(),
  content: z.string(),
  files: z.any().optional(),
  status: z.string(),
});

export const MaterialListResponseSchema = z.object({
  materials: z.array(MaterialItemSchema.partial({ content: true })),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type MaterialItem = z.infer<typeof MaterialItemSchema>;
export type MaterialListResponse = z.infer<typeof MaterialListResponseSchema>;
