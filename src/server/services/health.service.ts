import { AdvancedHealthChecker } from '@/lib/monitoring';

export class HealthService {
  async check() {
    return AdvancedHealthChecker.performHealthCheck();
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const healthService = wrapService(new HealthService(), 'HealthService');
