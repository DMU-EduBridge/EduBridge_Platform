import { NextRequest, NextResponse } from "next/server";
import { AlertManager, SlackNotificationChannel } from "@/lib/monitoring";
import { securityMiddleware } from "@/lib/security";
import { performanceMiddleware } from "@/lib/performance";

// 알림 관리 엔드포인트
export const GET = performanceMiddleware(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';
    
    let data;
    
    switch (action) {
      case 'status':
        data = {
          alerts: Array.from(AlertManager['alerts'].entries()).map(([id, config]) => ({
            id,
            ...config
          })),
          channels: AlertManager['notificationChannels'].map(channel => ({
            name: channel.name,
            status: 'active'
          })),
          timestamp: new Date().toISOString()
        };
        break;
      case 'test':
        // 테스트 알림 전송
        const testAlert = {
          id: 'test-alert',
          title: 'Test Alert',
          message: 'This is a test alert',
          severity: 'low',
          timestamp: new Date().toISOString(),
          value: 0,
          threshold: 0
        };
        
        // 모든 채널로 테스트 알림 전송
        for (const channel of AlertManager['notificationChannels']) {
          try {
            await channel.send(testAlert);
          } catch (error) {
            console.error(`Test alert failed for ${channel.name}:`, error);
          }
        }
        
        data = {
          message: 'Test alerts sent',
          timestamp: new Date().toISOString()
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    const response = NextResponse.json(data);
    
    // 보안 헤더 적용
    const securedResponse = securityMiddleware(request);
    securedResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to process alert request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
});

// 알림 설정 업데이트
export const POST = performanceMiddleware(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { action, alertId, config, channelConfig } = body;
    
    switch (action) {
      case 'register_alert':
        if (!alertId || !config) {
          return NextResponse.json(
            { error: 'Missing alertId or config' },
            { status: 400 }
          );
        }
        AlertManager.registerAlert(alertId, config);
        break;
        
      case 'add_channel':
        if (!channelConfig) {
          return NextResponse.json(
            { error: 'Missing channel config' },
            { status: 400 }
          );
        }
        
        if (channelConfig.type === 'slack' && channelConfig.webhookUrl) {
          AlertManager.addNotificationChannel(
            new SlackNotificationChannel(channelConfig.webhookUrl)
          );
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    const response = NextResponse.json({
      message: 'Alert configuration updated',
      timestamp: new Date().toISOString()
    });
    
    // 보안 헤더 적용
    const securedResponse = securityMiddleware(request);
    securedResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to update alert configuration',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
});
