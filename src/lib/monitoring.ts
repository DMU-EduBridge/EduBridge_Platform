import { prisma } from '@/lib/core/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMetrics } from './performance';

// ============================================================================
// 기본 모니터링 기능
// ============================================================================

// 로그 레벨 정의
/* eslint-disable no-unused-vars */
export enum LogLevel {
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
/* eslint-enable no-unused-vars */

// 구조화된 로거
export class StructuredLogger {
  private static instance: StructuredLogger;
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = this.getLogLevelFromEnv();
  }

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatLog(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      service: 'edubridge-api', // cspell:disable-line
      environment: process.env.NODE_ENV,
      ...meta,
    };

    return JSON.stringify(logEntry);
  }

  info(message: string, meta?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatLog('INFO', message, meta));
    }
  }

  warn(message: string, meta?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatLog('WARN', message, meta));
    }
  }

  error(message: string, error?: Error, meta?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMeta = {
        ...meta,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      };
      console.error(this.formatLog('ERROR', message, errorMeta));
    }
  }
}

// API 요청/응답 로깅
export class RequestLogger {
  static async logRequest(request: NextRequest, response: NextResponse, duration: number) {
    const logger = StructuredLogger.getInstance();

    const logData = {
      method: request.method,
      url: request.url,
      status: response.status,
      duration: `${duration}ms`,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      contentLength: response.headers.get('content-length'),
    };

    if (response.status >= 400) {
      logger.error('API Request Error', undefined, logData);
    } else {
      logger.info('API Request', logData);
    }
  }
}

// 성능 모니터링
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static startTimer(label: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);

      const logger = StructuredLogger.getInstance();
      logger.info(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  static recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // 최근 1000개 값만 유지
    if (values.length > 1000) {
      values.shift();
    }
  }

  static getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};

    this.metrics.forEach((values, name) => {
      if (values.length === 0) return;

      const sorted = [...values].sort((a: number, b: number) => a - b);
      const sum = values.reduce((a: number, b: number) => a + b, 0);

      result[name] = {
        count: values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: sum / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
    });

    return result;
  }
}

// 에러 추적
export class ErrorTracker {
  private static errors = new Map<string, number>();

  static trackError(error: Error, context?: any) {
    const errorKey = `${error.name}:${error.message}`;
    const count = this.errors.get(errorKey) || 0;
    this.errors.set(errorKey, count + 1);

    const logger = StructuredLogger.getInstance();
    logger.error('Error tracked', error, {
      context,
      errorCount: count + 1,
    });
  }

  static getErrorStats(): Record<string, number> {
    const result: Record<string, number> = {};
    this.errors.forEach((count, key) => {
      result[key] = count;
    });
    return result;
  }
}

// 시스템 상태 모니터링
export class SystemMonitor {
  static async getSystemStatus() {
    const logger = StructuredLogger.getInstance();

    try {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      const status = {
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        environment: process.env.NODE_ENV,
      };

      logger.info('System status', status);
      return status;
    } catch (error) {
      logger.error('Failed to get system status', error as Error);
      throw error;
    }
  }
}

// 헬스 체크 엔드포인트용 데이터
export class HealthChecker {
  static async checkDatabase(): Promise<{ status: string; responseTime: number }> {
    const timer = PerformanceMonitor.startTimer('database-health-check');

    try {
      await prisma.$queryRaw`SELECT 1`;
      timer();
      return { status: 'healthy', responseTime: 0 };
    } catch (error) {
      timer();
      throw new Error('Database connection failed');
    }
  }

  static async checkExternalServices(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    // AI 서비스 체크 (향후 구현)
    if (process.env.OPENAI_API_KEY) {
      results.openai = { status: 'configured' };
    }

    if (process.env.ANTHROPIC_API_KEY) {
      results.anthropic = { status: 'configured' };
    }

    return results;
  }

  static async getHealthStatus() {
    const logger = StructuredLogger.getInstance();

    try {
      const [database, externalServices, systemStatus] = await Promise.all([
        this.checkDatabase(),
        this.checkExternalServices(),
        SystemMonitor.getSystemStatus(),
      ]);

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database,
          external: externalServices,
        },
        system: systemStatus,
        performance: PerformanceMonitor.getMetrics(),
        errors: ErrorTracker.getErrorStats(),
      };

      logger.info('Health check completed', healthStatus);
      return healthStatus;
    } catch (error) {
      logger.error('Health check failed', error as Error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      };
    }
  }
}

// 로그 수집 및 전송 (향후 확장)
export class LogCollector {
  private static logs: any[] = [];
  private static maxLogs = 1000;

  static addLog(log: any) {
    this.logs.push({
      ...log,
      timestamp: new Date().toISOString(),
    });

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  static getLogs(limit: number = 100): any[] {
    return this.logs.slice(-limit);
  }

  static clearLogs() {
    this.logs = [];
  }

  // 향후 외부 로깅 서비스로 전송
  static async sendToExternalService() {
    // Sentry, LogRocket, DataDog 등으로 전송
    const logger = StructuredLogger.getInstance();
    logger.info('Sending logs to external service', { count: this.logs.length });
  }
}

// ============================================================================
// 고급 모니터링 기능
// ============================================================================

// 실시간 알림 시스템
export class AlertManager {
  private static alerts = new Map<string, AlertConfig>();
  private static notificationChannels: NotificationChannel[] = [];

  static registerAlert(id: string, config: AlertConfig) {
    this.alerts.set(id, config);
  }

  static addNotificationChannel(channel: NotificationChannel) {
    this.notificationChannels.push(channel);
  }

  static async checkAlerts() {
    const metrics = PerformanceMetrics.getAllMetrics();

    this.alerts.forEach((config, alertId) => {
      const value = this.getMetricValue(metrics, config.metric);

      if (this.shouldTriggerAlert(value, config)) {
        this.sendAlert(alertId, config, value).catch(console.error);
      }
    });
  }

  private static getMetricValue(metrics: any, metricPath: string): number {
    const parts = metricPath.split('.');
    let value = metrics;

    for (const part of parts) {
      value = value?.[part];
    }

    return typeof value === 'number' ? value : 0;
  }

  private static shouldTriggerAlert(value: number, config: AlertConfig): boolean {
    switch (config.condition) {
      case 'greater_than':
        return value > config.threshold;
      case 'less_than':
        return value < config.threshold;
      case 'equals':
        return value === config.threshold;
      default:
        return false;
    }
  }

  private static async sendAlert(alertId: string, config: AlertConfig, value: number) {
    const alert = {
      id: alertId,
      title: config.title,
      message: `${config.description}: ${value}`,
      severity: config.severity,
      timestamp: new Date().toISOString(),
      value,
      threshold: config.threshold,
    };

    // 모든 알림 채널로 전송
    for (const channel of this.notificationChannels) {
      try {
        await channel.send(alert);
      } catch (error) {
        console.error(`Failed to send alert via ${channel.name}:`, error);
      }
    }
  }
}

interface AlertConfig {
  title: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationChannel {
  name: string;
  send: (alert: any) => Promise<void>; // eslint-disable-line no-unused-vars
}

// Slack 알림 채널
export class SlackNotificationChannel implements NotificationChannel {
  name = 'slack';
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async send(alert: any): Promise<void> {
    const message = {
      text: `🚨 *${alert.title}*`,
      attachments: [
        {
          color: this.getColor(alert.severity),
          fields: [
            { title: 'Message', value: alert.message, short: false },
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Value', value: alert.value.toString(), short: true },
            { title: 'Threshold', value: alert.threshold.toString(), short: true },
            { title: 'Time', value: alert.timestamp, short: true },
          ],
        },
      ],
    };

    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  }

  private getColor(severity: string): string {
    const colors = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff0000',
      critical: '#8b0000',
    };
    return colors[severity as keyof typeof colors] || '#36a64f';
  }
}

// 이메일 알림 채널
export class EmailNotificationChannel implements NotificationChannel {
  name = 'email';
  private smtpConfig: any;

  constructor(smtpConfig: any) {
    this.smtpConfig = smtpConfig;
  }

  async send(alert: any): Promise<void> {
    // 실제 구현에서는 nodemailer 등 사용
    logger.warn(`Email alert: ${alert.title} - ${alert.message}`);
    logger.warn(`Severity: ${alert.severity}, Value: ${alert.value}`);
  }
}

// 실시간 대시보드 데이터
export class DashboardDataProvider {
  static async getSystemOverview() {
    const [userCount, problemCount, studentCount, reportCount, recentActivity, performanceMetrics] =
      await Promise.all([
        prisma.user.count(),
        prisma.problem.count(),
        prisma.user.count({ where: { role: 'STUDENT' } }), // 학생 수 계산
        prisma.analysisReport.count(),
        this.getRecentActivity(),
        PerformanceMetrics.getAllMetrics(),
      ]);

    return {
      counts: {
        users: userCount,
        problems: problemCount,
        students: studentCount,
        reports: reportCount,
      },
      recentActivity,
      performance: performanceMetrics,
      timestamp: new Date().toISOString(),
    };
  }

  static async getRecentActivity(limit: number = 10) {
    // 최근 활동 조회 (예시)
    const activities = [
      {
        id: '1',
        type: 'user_login',
        message: '사용자가 로그인했습니다',
        timestamp: new Date().toISOString(),
        userId: 'user1',
      },
      {
        id: '2',
        type: 'problem_created',
        message: '새로운 문제가 생성되었습니다',
        timestamp: new Date().toISOString(),
        problemId: 'problem1',
      },
    ];

    return activities.slice(0, limit);
  }

  static async getPerformanceTrends(hours: number = 24) {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // 실제 구현에서는 시계열 데이터베이스 사용
    return {
      requestCount: Array.from({ length: hours }, (_, i) => ({
        time: new Date(startTime.getTime() + i * 60 * 60 * 1000).toISOString(),
        count: Math.floor(Math.random() * 100),
      })),
      responseTime: Array.from({ length: hours }, (_, i) => ({
        time: new Date(startTime.getTime() + i * 60 * 60 * 1000).toISOString(),
        avgTime: Math.floor(Math.random() * 200) + 50,
      })),
      errorRate: Array.from({ length: hours }, (_, i) => ({
        time: new Date(startTime.getTime() + i * 60 * 60 * 1000).toISOString(),
        rate: Math.random() * 5,
      })),
    };
  }
}

// 로그 분석 시스템
export class LogAnalyzer {
  static async analyzeLogs(timeRange: { start: Date; end: Date }) {
    // 실제 구현에서는 ELK Stack, Fluentd 등 사용
    const logs = await this.getLogs(timeRange);

    return {
      totalLogs: logs.length,
      errorLogs: logs.filter((log) => log.level === 'error').length,
      warningLogs: logs.filter((log) => log.level === 'warn').length,
      infoLogs: logs.filter((log) => log.level === 'info').length,
      topErrors: this.getTopErrors(logs),
      logTrends: this.getLogTrends(logs),
    };
  }

  private static async getLogs(timeRange: { start: Date; end: Date }) {
    // 실제 로그 조회 로직 - timeRange를 사용하여 필터링
    const logs = [
      { level: 'info', message: 'User login', timestamp: new Date() },
      { level: 'error', message: 'Database connection failed', timestamp: new Date() },
      { level: 'warn', message: 'High memory usage', timestamp: new Date() },
    ];

    // timeRange에 따라 필터링 (실제 구현에서는 데이터베이스 쿼리 사용)
    return logs.filter((log) => log.timestamp >= timeRange.start && log.timestamp <= timeRange.end);
  }

  private static getTopErrors(logs: any[]): Array<{ error: string; count: number }> {
    const errorCounts = new Map<string, number>();

    logs
      .filter((log) => log.level === 'error')
      .forEach((log) => {
        const count = errorCounts.get(log.message) || 0;
        errorCounts.set(log.message, count + 1);
      });

    return Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private static getLogTrends(logs: any[]) {
    const trends = new Map<string, number>();

    logs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours();
      const key = `${hour}:00`;
      trends.set(key, (trends.get(key) || 0) + 1);
    });

    return Array.from(trends.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }
}

// 고급 헬스 체크 시스템
export class AdvancedHealthChecker {
  static async performHealthCheck() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkDiskSpace(),
      this.checkExternalServices(),
    ]);

    const results = checks.map((result, index) => ({
      name: ['database', 'memory', 'disk', 'external'][index],
      status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: result.status === 'fulfilled' ? result.value : result.reason,
    }));

    const overallStatus = results.every((r) => r.status === 'healthy') ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
    };
  }

  private static async checkDatabase() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { message: 'Database connection successful' };
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  private static async checkMemory() {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const usagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (usagePercent > 90) {
      throw new Error(`High memory usage: ${usagePercent.toFixed(2)}%`);
    }

    return {
      heapUsed: `${heapUsedMB.toFixed(2)}MB`,
      heapTotal: `${heapTotalMB.toFixed(2)}MB`,
      usagePercent: `${usagePercent.toFixed(2)}%`,
    };
  }

  private static async checkDiskSpace() {
    // 실제 구현에서는 fs.stat 사용
    return { message: 'Disk space check not implemented' };
  }

  private static async checkExternalServices() {
    // 외부 서비스 상태 확인
    return { message: 'External services check not implemented' };
  }
}

// 모니터링 설정 초기화
export function initializeMonitoring() {
  // 기본 알림 설정
  AlertManager.registerAlert('high_response_time', {
    title: 'High Response Time',
    description: 'API 응답 시간이 임계값을 초과했습니다',
    metric: 'request_duration.avg',
    condition: 'greater_than',
    threshold: 1000, // 1초
    severity: 'high',
  });

  AlertManager.registerAlert('high_error_rate', {
    title: 'High Error Rate',
    description: '에러 발생률이 높습니다',
    metric: 'request_error.count',
    condition: 'greater_than',
    threshold: 10,
    severity: 'critical',
  });

  AlertManager.registerAlert('high_memory_usage', {
    title: 'High Memory Usage',
    description: '메모리 사용량이 높습니다',
    metric: 'memory_usage.avg',
    condition: 'greater_than',
    threshold: 500 * 1024 * 1024, // 500MB
    severity: 'medium',
  });

  // 알림 채널 설정 (환경변수에서)
  if (process.env.SLACK_WEBHOOK_URL) {
    AlertManager.addNotificationChannel(
      new SlackNotificationChannel(process.env.SLACK_WEBHOOK_URL),
    );
  }

  // 주기적 알림 체크 (5분마다)
  setInterval(
    () => {
      AlertManager.checkAlerts().catch(console.error);
    },
    5 * 60 * 1000,
  );
}

// 기본 logger 인스턴스 export
export const logger = StructuredLogger.getInstance();
