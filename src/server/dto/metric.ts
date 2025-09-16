import { z } from 'zod';

export const MetricsOverviewSchema = z.record(z.any());
export const MetricsTrendsSchema = z.record(z.any());
export const MetricsLogsSchema = z.record(z.any());
export const MetricsCacheSchema = z.record(z.any());

export type MetricsOverview = z.infer<typeof MetricsOverviewSchema>;
export type MetricsTrends = z.infer<typeof MetricsTrendsSchema>;
export type MetricsLogs = z.infer<typeof MetricsLogsSchema>;
export type MetricsCache = z.infer<typeof MetricsCacheSchema>;
