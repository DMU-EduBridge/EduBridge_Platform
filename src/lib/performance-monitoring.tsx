'use client';

import { PerformanceMetrics } from '@/lib/performance';
import { useEffect, useState } from 'react';

// Web Vitals 측정
export class WebVitalsMonitor {
  private static metrics: Record<string, number> = {};

  // Core Web Vitals 측정
  static measureWebVitals() {
    if (typeof window === 'undefined') return;

    // LCP (Largest Contentful Paint)
    this.measureLCP();

    // FID (First Input Delay)
    this.measureFID();

    // CLS (Cumulative Layout Shift)
    this.measureCLS();

    // FCP (First Contentful Paint)
    this.measureFCP();

    // TTFB (Time to First Byte)
    this.measureTTFB();
  }

  private static measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
          PerformanceMetrics.record('web_vitals_lcp', lastEntry.startTime);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private static measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            this.metrics.fid = fid;
            PerformanceMetrics.record('web_vitals_fid', fid);
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private static measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        this.metrics.cls = clsValue;
        PerformanceMetrics.record('web_vitals_cls', clsValue);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private static measureFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            PerformanceMetrics.record('web_vitals_fcp', entry.startTime);
          }
        });
      });

      observer.observe({ entryTypes: ['paint'] });
    }
  }

  private static measureTTFB() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            const ttfb = entry.responseStart - entry.requestStart;
            this.metrics.ttfb = ttfb;
            PerformanceMetrics.record('web_vitals_ttfb', ttfb);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  static getMetrics() {
    return { ...this.metrics };
  }

  static getMetricsReport() {
    const metrics = this.getMetrics();

    return {
      lcp: {
        value: metrics.lcp || 0,
        rating: this.getLCPRating(metrics.lcp || 0),
      },
      fid: {
        value: metrics.fid || 0,
        rating: this.getFIDRating(metrics.fid || 0),
      },
      cls: {
        value: metrics.cls || 0,
        rating: this.getCLSRating(metrics.cls || 0),
      },
      fcp: {
        value: metrics.fcp || 0,
        rating: this.getFCPRating(metrics.fcp || 0),
      },
      ttfb: {
        value: metrics.ttfb || 0,
        rating: this.getTTFBRating(metrics.ttfb || 0),
      },
    };
  }

  private static getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private static getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private static getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private static getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private static getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }
}

// 성능 모니터링 훅
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState(WebVitalsMonitor.getMetrics());
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsMonitoring(true);
    WebVitalsMonitor.measureWebVitals();

    // 주기적으로 메트릭 업데이트
    const interval = setInterval(() => {
      setMetrics(WebVitalsMonitor.getMetrics());
    }, 5000);

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, []);

  return {
    metrics,
    isMonitoring,
    report: WebVitalsMonitor.getMetricsReport(),
  };
}

// 리소스 로딩 모니터링
export class ResourceMonitor {
  private static resources: Array<{
    name: string;
    type: string;
    duration: number;
    size: number;
    timestamp: number;
  }> = [];

  static startMonitoring() {
    if (typeof window === 'undefined') return;

    // 리소스 로딩 모니터링
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry: any) => {
          if (entry.entryType === 'resource') {
            this.resources.push({
              name: entry.name,
              type: entry.initiatorType,
              duration: entry.duration,
              size: entry.transferSize || 0,
              timestamp: Date.now(),
            });

            PerformanceMetrics.record('resource_load_time', entry.duration);
            PerformanceMetrics.record('resource_size', entry.transferSize || 0);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  static getResources() {
    return [...this.resources];
  }

  static getResourceStats() {
    const resources = this.getResources();

    if (resources.length === 0) {
      return {
        totalResources: 0,
        totalSize: 0,
        averageLoadTime: 0,
        slowestResource: null,
        largestResource: null,
      };
    }

    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    const averageLoadTime = resources.reduce((sum, r) => sum + r.duration, 0) / resources.length;

    const slowestResource = resources.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest,
    );

    const largestResource = resources.reduce((largest, current) =>
      current.size > largest.size ? current : largest,
    );

    return {
      totalResources: resources.length,
      totalSize,
      averageLoadTime,
      slowestResource,
      largestResource,
    };
  }

  static getSlowResources(threshold: number = 1000) {
    return this.resources.filter((r) => r.duration > threshold);
  }

  static getLargeResources(threshold: number = 100000) {
    return this.resources.filter((r) => r.size > threshold);
  }
}

// 메모리 사용량 모니터링
export class MemoryMonitor {
  private static memoryHistory: Array<{
    timestamp: number;
    used: number;
    total: number;
    limit: number;
  }> = [];

  static startMonitoring() {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;

        this.memoryHistory.push({
          timestamp: Date.now(),
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });

        PerformanceMetrics.record('memory_used', memory.usedJSHeapSize);
        PerformanceMetrics.record('memory_total', memory.totalJSHeapSize);

        // 메모리 사용량이 80%를 초과하면 경고
        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
          console.warn('High memory usage detected:', {
            used: memory.usedJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
          });
        }

        // 최근 100개 기록만 유지
        if (this.memoryHistory.length > 100) {
          this.memoryHistory.shift();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }

  static getMemoryStats() {
    const history = this.memoryHistory;

    if (history.length === 0) {
      return {
        current: null,
        average: 0,
        peak: 0,
        trend: 'stable',
      };
    }

    const current = history[history.length - 1];
    const average = history.reduce((sum, h) => sum + h.used, 0) / history.length;
    const peak = Math.max(...history.map((h) => h.used));

    // 트렌드 계산 (최근 10개 vs 이전 10개)
    const recent = history.slice(-10);
    const previous = history.slice(-20, -10);

    const recentAvg = recent.reduce((sum, h) => sum + h.used, 0) / recent.length;
    const previousAvg = previous.reduce((sum, h) => sum + h.used, 0) / previous.length;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > previousAvg * 1.1) trend = 'increasing';
    else if (recentAvg < previousAvg * 0.9) trend = 'decreasing';

    return {
      current,
      average,
      peak,
      trend,
      history: history.slice(-20), // 최근 20개 기록
    };
  }
}

// 성능 알림 시스템
export class PerformanceAlert {
  private static alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: number;
    data?: any;
  }> = [];

  static checkPerformanceThresholds() {
    const webVitals = WebVitalsMonitor.getMetricsReport();
    const memoryStats = MemoryMonitor.getMemoryStats();
    // const resourceStats = ResourceMonitor.getResourceStats();

    // LCP 경고
    if (webVitals.lcp.rating === 'poor') {
      this.addAlert('warning', `Poor LCP: ${webVitals.lcp.value}ms`, {
        metric: 'lcp',
        value: webVitals.lcp.value,
        rating: webVitals.lcp.rating,
      });
    }

    // FID 경고
    if (webVitals.fid.rating === 'poor') {
      this.addAlert('warning', `Poor FID: ${webVitals.fid.value}ms`, {
        metric: 'fid',
        value: webVitals.fid.value,
        rating: webVitals.fid.rating,
      });
    }

    // CLS 경고
    if (webVitals.cls.rating === 'poor') {
      this.addAlert('warning', `Poor CLS: ${webVitals.cls.value}`, {
        metric: 'cls',
        value: webVitals.cls.value,
        rating: webVitals.cls.rating,
      });
    }

    // 메모리 사용량 경고
    if (memoryStats.current && memoryStats.current.used / memoryStats.current.limit > 0.9) {
      this.addAlert('error', 'High memory usage detected', {
        used: memoryStats.current.used,
        limit: memoryStats.current.limit,
        percentage: (memoryStats.current.used / memoryStats.current.limit) * 100,
      });
    }

    // 느린 리소스 경고
    const slowResources = ResourceMonitor.getSlowResources(2000);
    if (slowResources.length > 0) {
      this.addAlert('warning', `${slowResources.length} slow resources detected`, {
        resources: slowResources,
      });
    }
  }

  private static addAlert(type: 'warning' | 'error' | 'info', message: string, data?: any) {
    this.alerts.push({
      type,
      message,
      timestamp: Date.now(),
      data,
    });

    // 최근 50개 알림만 유지
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }
  }

  static getAlerts() {
    return [...this.alerts];
  }

  static getRecentAlerts(minutes: number = 10) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.alerts.filter((alert) => alert.timestamp > cutoff);
  }

  static clearAlerts() {
    this.alerts = [];
  }
}

// 성능 모니터링 초기화
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Web Vitals 측정 시작
  WebVitalsMonitor.measureWebVitals();

  // 리소스 모니터링 시작
  ResourceMonitor.startMonitoring();

  // 메모리 모니터링 시작
  const stopMemoryMonitoring = MemoryMonitor.startMonitoring();

  // 성능 알림 체크 (30초마다)
  const alertInterval = setInterval(() => {
    PerformanceAlert.checkPerformanceThresholds();
  }, 30000);

  // 정리 함수
  return () => {
    if (stopMemoryMonitoring) {
      stopMemoryMonitoring();
    }
    clearInterval(alertInterval);
  };
}

// 성능 대시보드 데이터
export function getPerformanceDashboardData() {
  return {
    webVitals: WebVitalsMonitor.getMetricsReport(),
    memory: MemoryMonitor.getMemoryStats(),
    resources: ResourceMonitor.getResourceStats(),
    alerts: PerformanceAlert.getRecentAlerts(60), // 최근 1시간
    timestamp: Date.now(),
  };
}
