// In-memory AlertManager를 그대로 사용하되, 레포지토리 인터페이스로 캡슐화
import { AlertManager, SlackNotificationChannel } from '@/lib/monitoring';

export class AlertRepository {
  getStatus() {
    const alerts = Array.from((AlertManager as any)['alerts'].entries()).map(
      ([id, config]: any) => ({ id, ...config }),
    );
    const channels = (AlertManager as any)['notificationChannels'].map((channel: any) => ({
      name: channel.name,
      status: 'active',
    }));
    return { alerts, channels, timestamp: new Date().toISOString() };
  }

  registerAlert(alertId: string, config: any) {
    (AlertManager as any).registerAlert(alertId, config);
  }

  addSlackChannel(webhookUrl: string) {
    (AlertManager as any).addNotificationChannel(new SlackNotificationChannel(webhookUrl));
  }

  async sendTestToAllChannels(alert: any) {
    const channels = (AlertManager as any)['notificationChannels'];
    for (const channel of channels) {
      try {
        await channel.send(alert);
      } catch (error) {
        console.error(`Test alert failed for ${channel.name}:`, error);
      }
    }
  }
}

export const alertRepository = new AlertRepository();
