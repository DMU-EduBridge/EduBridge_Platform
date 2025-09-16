import { z } from 'zod';

export const UploadResponseSchema = z.object({
  success: z.boolean(),
  filename: z.string(),
  url: z.string(),
  size: z.number(),
  type: z.string(),
});

export type UploadResponse = z.infer<typeof UploadResponseSchema>;
