import { DashboardDataProvider, LogAnalyzer } from '@/lib/monitoring';
import { AdvancedCacheManager } from '@/lib/performance';

export class MetricService {
  async overview() {
    return DashboardDataProvider.getSystemOverview();
  }

  async trends(hours: number) {
    return DashboardDataProvider.getPerformanceTrends(hours);
  }

  async logs() {
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endTime = new Date();
    return LogAnalyzer.analyzeLogs({ start: startTime, end: endTime });
  }

  cache() {
    return AdvancedCacheManager.getStats();
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const metricService = wrapService(new MetricService(), 'MetricService');
