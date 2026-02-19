import { useState, useEffect, useCallback } from 'react';
import { fetchExposureMetrics, ExposureMetricsData } from '../services/exposureService';

const DEFAULT_METRICS: ExposureMetricsData = {
  profileViews: { value: 0, change: 0, trend: 'neutral' },
  saves: { value: 0, change: 0, trend: 'neutral' },
  leadOpens: { value: 0, change: 0, trend: 'neutral' },
  quoteAcceptRate: { value: 0, change: 0, trend: 'neutral' },
};

export function useExposureMetrics(dealerId: string | undefined) {
  const [metrics, setMetrics] = useState<ExposureMetricsData>(DEFAULT_METRICS);
  const [period, setPeriod] = useState<'7' | '30'>('30');
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!dealerId) return;
    setLoading(true);
    try {
      const data = await fetchExposureMetrics(dealerId, period);
      setMetrics(data);
    } catch {
      setMetrics(DEFAULT_METRICS);
    } finally {
      setLoading(false);
    }
  }, [dealerId, period]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { metrics, period, setPeriod, loading, refetch };
}
