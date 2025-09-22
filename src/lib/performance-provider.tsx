'use client';

import { QueryProvider } from '@/lib/cache';
import { initializePerformanceMonitoring } from '@/lib/performance-monitoring';
import { createContext, ReactNode, useContext, useEffect } from 'react';

interface PerformanceContextType {
  isInitialized: boolean;
  initializeMonitoring: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const initializeMonitoring = () => {
    if (typeof window !== 'undefined') {
      initializePerformanceMonitoring();
    }
  };

  useEffect(() => {
    initializeMonitoring();
  }, []);

  return (
    <PerformanceContext.Provider value={{ isInitialized: true, initializeMonitoring }}>
      <QueryProvider>{children}</QueryProvider>
    </PerformanceContext.Provider>
  );
}
