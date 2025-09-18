import { z } from 'zod';

export const ProblemStatsSchema = z.object({
  totalProblems: z.number(),
  activeProblems: z.number(),
  bySubject: z.record(z.string(), z.number()),
  byDifficulty: z.record(z.string(), z.number()),
});

export type ProblemStats = z.infer<typeof ProblemStatsSchema>;
