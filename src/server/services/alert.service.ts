export class AlertService {
  status() {
    return {
      status: 'healthy',
      alerts: [],
      channels: [],
    };
  }

  async testAll() {
    return {
      success: true,
      results: [],
    };
  }

  registerAlert(alertId: string, config: any) {
    // 간단한 구현
    console.log(`Alert registered: ${alertId}`, config);
  }

  addChannel(channelConfig: any) {
    // 간단한 구현
    console.log('Channel added:', channelConfig);
  }
}

export const alertService = new AlertService();
