import React from 'react';
import { Eye, Bookmark, Mail, CheckCircle, TrendingUp, TrendingDown, Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

interface MetricData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

interface ExposureMetricsProps {
  profileViews: MetricData;
  saves: MetricData;
  leadOpens: MetricData;
  quoteAcceptRate: MetricData;
  period: '7' | '30';
  onPeriodChange: (p: '7' | '30') => void;
  loading?: boolean;
  onTipsClick?: () => void;
  className?: string;
}

export function ExposureMetrics({
  profileViews,
  saves,
  leadOpens,
  quoteAcceptRate,
  period,
  onPeriodChange,
  loading = false,
  onTipsClick,
  className,
}: ExposureMetricsProps) {

  const metrics = [
    {
      label: 'Profile Views',
      icon: Eye,
      data: profileViews,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Saves',
      icon: Bookmark,
      data: saves,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Lead Opens',
      icon: Mail,
      data: leadOpens,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Quote Accept',
      icon: CheckCircle,
      data: quoteAcceptRate,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      suffix: '%',
    },
  ];

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Exposure metrics</h2>
          <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            <button
              onClick={() => onPeriodChange('7')}
              disabled={loading}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                period === '7'
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              7 days
            </button>
            <button
              onClick={() => onPeriodChange('30')}
              disabled={loading}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                period === '30'
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              30 days
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border border-gray-100 transition-colors",
                "hover:border-gray-200 hover:bg-gray-50/50"
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", metric.bgColor)}>
                <metric.icon className={cn("w-4 h-4", metric.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 truncate">{metric.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900 tabular-nums">
                    {metric.data.value.toLocaleString()}
                    {metric.suffix ?? ''}
                  </span>
                  {metric.data.trend !== 'neutral' && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-xs font-medium",
                        metric.data.trend === 'up' ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {metric.data.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(metric.data.change)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {onTipsClick && !loading && (
          <button
            onClick={onTipsClick}
            className="w-full h-10 rounded-xl border border-dashed border-gray-300 text-gray-600 text-sm font-medium hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            Tips to improve visibility
          </button>
        )}
      </div>
    </div>
  );
}
