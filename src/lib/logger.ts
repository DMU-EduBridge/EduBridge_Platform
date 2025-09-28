// 구조화된 로깅 시스템
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  service?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(
    level: keyof LogLevel,
    message: string,
    data?: any,
    service?: string,
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      service,
    };
  }

  private output(entry: LogEntry) {
    if (this.isDevelopment) {
      // 개발 환경: 콘솔에 색상과 함께 출력
      const colors = {
        error: '\x1b[31m', // 빨간색
        warn: '\x1b[33m', // 노란색
        info: '\x1b[36m', // 청록색
        debug: '\x1b[90m', // 회색
      };

      const reset = '\x1b[0m';
      const color = colors[entry.level.toLowerCase() as keyof typeof colors] || '';

      console.log(
        `${color}[${entry.level}]${reset} ${entry.timestamp} ${entry.service ? `[${entry.service}]` : ''} ${entry.message}`,
        entry.data ? entry.data : '',
      );
    } else if (this.isProduction) {
      // 프로덕션 환경: JSON 형태로 출력 (로그 수집 시스템용)
      console.log(JSON.stringify(entry));
    }
  }

  error(message: string, data?: any, service?: string) {
    const entry = this.formatLog('ERROR', message, data, service);
    this.output(entry);
  }

  warn(message: string, data?: any, service?: string) {
    const entry = this.formatLog('WARN', message, data, service);
    this.output(entry);
  }

  info(message: string, data?: any, service?: string) {
    const entry = this.formatLog('INFO', message, data, service);
    this.output(entry);
  }

  debug(message: string, data?: any, service?: string) {
    if (this.isDevelopment) {
      const entry = this.formatLog('DEBUG', message, data, service);
      this.output(entry);
    }
  }
}

// 싱글톤 인스턴스
export const logger = new Logger();

// 편의 함수들
export const logError = (message: string, data?: any, service?: string) =>
  logger.error(message, data, service);

export const logWarn = (message: string, data?: any, service?: string) =>
  logger.warn(message, data, service);

export const logInfo = (message: string, data?: any, service?: string) =>
  logger.info(message, data, service);

export const logDebug = (message: string, data?: any, service?: string) =>
  logger.debug(message, data, service);
