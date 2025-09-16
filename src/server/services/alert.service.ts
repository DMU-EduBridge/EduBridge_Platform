import { alertRepository } from '../repositories/alert.repository';

export class AlertService {
  status() {
    return alertRepository.getStatus();
  }

  async testAll() {
    const alert = {
      id: 'test-alert',
      title: 'Test Alert',
      message: 'This is a test alert',
      severity: 'low',
      timestamp: new Date().toISOString(),
      value: 0,
      threshold: 0,
    };
    await alertRepository.sendTestToAllChannels(alert);
    return { message: 'Test alerts sent', timestamp: new Date().toISOString() };
  }

  registerAlert(alertId: string, config: any) {
    return alertRepository.registerAlert(alertId, config);
  }

  addChannel(channelConfig: { type: string; webhookUrl?: string }) {
    if (channelConfig.type === 'slack' && channelConfig.webhookUrl) {
      alertRepository.addSlackChannel(channelConfig.webhookUrl);
    }
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const alertService = wrapService(new AlertService(), 'AlertService');
