import { memo, ComponentType, useEffect, createElement } from 'react';

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

interface PerformanceThreshold {
  warning: number;
  error: number;
}

class PerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private observers: Set<(entry: PerformanceEntry) => void> = new Set();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    // Default thresholds (in milliseconds)
    this.setThreshold('render', { warning: 16, error: 50 });
    this.setThreshold('api', { warning: 1000, error: 5000 });
    this.setThreshold('hook', { warning: 10, error: 30 });
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  setThreshold(name: string, threshold: PerformanceThreshold): void {
    this.thresholds.set(name, threshold);
  }

  observe(callback: (entry: PerformanceEntry) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  mark(name: string, metadata?: Record<string, any>): () => void {
    if (!this.isEnabled) return () => {};

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const entry: PerformanceEntry = {
        name,
        startTime,
        duration,
        metadata,
      };

      this.entries.push(entry);
      this.checkThreshold(entry);
      this.notifyObservers(entry);

      // Keep only last 1000 entries
      if (this.entries.length > 1000) {
        this.entries.shift();
      }
    };
  }

  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    const end = this.mark(name, metadata);
    try {
      const result = fn();
      end();
      return result;
    } catch (error) {
      end();
      throw error;
    }
  }

  async measureAsync<T>(
    name: string, 
    fn: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    const end = this.mark(name, metadata);
    try {
      const result = await fn();
      end();
      return result;
    } catch (error) {
      end();
      throw error;
    }
  }

  getEntries(filter?: (entry: PerformanceEntry) => boolean): PerformanceEntry[] {
    return filter ? this.entries.filter(filter) : [...this.entries];
  }

  getAverageTime(name: string): number {
    const entries = this.entries.filter(entry => entry.name === name);
    if (entries.length === 0) return 0;
    
    const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return total / entries.length;
  }

  getSlowEntries(threshold: number = 16): PerformanceEntry[] {
    return this.entries.filter(entry => entry.duration > threshold);
  }

  generateReport(): {
    summary: {
      totalEntries: number;
      averageTime: number;
      slowEntries: number;
    };
    byName: Record<string, {
      count: number;
      averageTime: number;
      minTime: number;
      maxTime: number;
      totalTime: number;
    }>;
    slowest: PerformanceEntry[];
  } {
    const byName: Record<string, any> = {};
    
    this.entries.forEach(entry => {
      if (!byName[entry.name]) {
        byName[entry.name] = {
          count: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0,
        };
      }
      
      const stats = byName[entry.name];
      stats.count++;
      stats.totalTime += entry.duration;
      stats.minTime = Math.min(stats.minTime, entry.duration);
      stats.maxTime = Math.max(stats.maxTime, entry.duration);
      stats.averageTime = stats.totalTime / stats.count;
    });

    const slowest = [...this.entries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const totalTime = this.entries.reduce((sum, entry) => sum + entry.duration, 0);

    return {
      summary: {
        totalEntries: this.entries.length,
        averageTime: this.entries.length > 0 ? totalTime / this.entries.length : 0,
        slowEntries: this.getSlowEntries().length,
      },
      byName,
      slowest,
    };
  }

  clear(): void {
    this.entries = [];
  }

  private checkThreshold(entry: PerformanceEntry): void {
    const threshold = this.thresholds.get(entry.name);
    if (!threshold) return;

    if (entry.duration > threshold.error) {
      console.error(`🚨 Performance Error: ${entry.name} took ${entry.duration.toFixed(2)}ms (threshold: ${threshold.error}ms)`, entry);
    } else if (entry.duration > threshold.warning) {
      console.warn(`⚠️ Performance Warning: ${entry.name} took ${entry.duration.toFixed(2)}ms (threshold: ${threshold.warning}ms)`, entry);
    }
  }

  private notifyObservers(entry: PerformanceEntry): void {
    this.observers.forEach(callback => {
      try {
        callback(entry);
      } catch (error) {
        console.error('Performance observer error:', error);
      }
    });
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hooks for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    mark: performanceMonitor.mark.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
  };
};

// HOC for component performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: ComponentType<P>,
  componentName?: string
) => {
  const name = componentName || Component.displayName || Component.name;
  
  const WrappedComponent = memo((props: P) => {
    const end = performanceMonitor.mark(`render:${name}`);
    
    useEffect(() => {
      end();
    });

    return createElement(Component, props);
  });
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${name})`;
  
  return WrappedComponent;
};

// Performance debugging utilities
export const debugPerformance = {
  logReport: () => console.table(performanceMonitor.generateReport()),
  logSlowEntries: (threshold = 16) => console.table(performanceMonitor.getSlowEntries(threshold)),
  logAverages: () => {
    const report = performanceMonitor.generateReport();
    console.table(report.byName);
  },
  clear: () => performanceMonitor.clear(),
};

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugPerformance = debugPerformance;
  (window as any).performanceMonitor = performanceMonitor;
}