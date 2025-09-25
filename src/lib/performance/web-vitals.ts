'use client';

import { useEffect } from 'react';
import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric } from 'web-vitals';

// Web Vitals 메트릭 타입 정의
export type WebVitalsMetric = Metric;

// 성능 메트릭을 서버로 전송하는 함수
const sendToAnalytics = (metric: Metric) => {
  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vitals:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  }

  // 프로덕션 환경에서는 분석 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics 4로 전송
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }

    // 자체 분석 API로 전송
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch((error) => {
      console.error('Failed to send web vitals:', error);
    });
  }
};

// 성능 메트릭 수집 및 보고
export const reportWebVitals = () => {
  try {
    // Core Web Vitals
    getCLS(sendToAnalytics); // Cumulative Layout Shift
    getFID(sendToAnalytics); // First Input Delay
    getLCP(sendToAnalytics); // Largest Contentful Paint

    // Other Important Metrics
    getFCP(sendToAnalytics); // First Contentful Paint
    getTTFB(sendToAnalytics); // Time to First Byte
  } catch (error) {
    console.error('Error collecting web vitals:', error);
  }
};

// React 컴포넌트용 훅
export function useWebVitals() {
  useEffect(() => {
    reportWebVitals();
  }, []);
}

// 성능 메트릭 평가 함수
export const evaluateMetric = (
  name: string,
  value: number,
): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// 성능 점수 계산 (0-100)
export const calculatePerformanceScore = (metrics: Record<string, number>): number => {
  const weights = {
    LCP: 0.25,
    FID: 0.25,
    CLS: 0.25,
    FCP: 0.15,
    TTFB: 0.1,
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([metric, weight]) => {
    if (metrics[metric] !== undefined) {
      const rating = evaluateMetric(metric, metrics[metric]);
      const score = rating === 'good' ? 100 : rating === 'needs-improvement' ? 75 : 50;
      totalScore += score * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
};

// 성능 리포트 생성
export const generatePerformanceReport = (
  metrics: Metric[],
): {
  score: number;
  metrics: Record<string, { value: number; rating: string }>;
  recommendations: string[];
} => {
  const metricMap: Record<string, number> = {};
  const ratingMap: Record<string, string> = {};

  metrics.forEach((metric) => {
    metricMap[metric.name] = metric.value;
    ratingMap[metric.name] = evaluateMetric(metric.name, metric.value);
  });

  const score = calculatePerformanceScore(metricMap);
  const recommendations: string[] = [];

  // 개선 권장사항 생성
  if (ratingMap.LCP === 'poor') {
    recommendations.push('이미지 최적화 및 지연 로딩을 구현하세요');
    recommendations.push('서버 응답 시간을 개선하세요');
  }

  if (ratingMap.FID === 'poor') {
    recommendations.push('JavaScript 번들 크기를 줄이세요');
    recommendations.push('코드 분할을 적용하세요');
  }

  if (ratingMap.CLS === 'poor') {
    recommendations.push('이미지와 광고에 명시적인 크기를 지정하세요');
    recommendations.push('동적 콘텐츠 삽입을 최소화하세요');
  }

  return {
    score,
    metrics: Object.entries(metricMap).reduce(
      (acc, [key, value]) => {
        acc[key] = { value, rating: ratingMap[key] };
        return acc;
      },
      {} as Record<string, { value: number; rating: string }>,
    ),
    recommendations,
  };
};
