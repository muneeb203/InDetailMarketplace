import React, { useState } from 'react';
import { Eye, Bookmark, Mail, CheckCircle, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { cn } from '../ui/utils';

interface MetricData {
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'neutral';
}

interface ExposureMetricsProps {
  profileViews: MetricData;
  saves: MetricData;
  leadOpens: MetricData;
  quoteAcceptRate: MetricData;
  onTipsClick?: () => void;
  className?: string;
}

export function ExposureMetrics({
  profileViews,
  saves,
  leadOpens,
  quoteAcceptRate,
  onTipsClick,
  className,
}: ExposureMetricsProps) {
  const [period, setPeriod] = useState<'7' | '30'>('7');

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
    <div className={cn("bg-white rounded-2xl shadow-sm border", className)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-gray-900">Exposure Metrics</h3>
          
          {/* Period toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setPeriod('7')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                period === '7'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              7 days
            </button>
            <button
              onClick={() => setPeriod('30')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                period === '30'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              30 days
            </button>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", metric.bgColor)}>
                  <metric.icon className={cn("w-4 h-4", metric.color)} />
                </div>
                <span className="text-sm text-gray-600">{metric.label}</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.data.value.toLocaleString()}
                  {metric.suffix}
                </span>
                
                {metric.data.trend !== 'neutral' && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-sm font-medium",
                    metric.data.trend === 'up' ? "text-green-600" : "text-red-600"
                  )}>
                    {metric.data.trend === 'up' ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{Math.abs(metric.data.change)}%</span>
                  </div>
                )}
              </div>

              {/* Sparkline placeholder */}
              <div className="h-8 flex items-end gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn("flex-1 rounded-sm", metric.bgColor)}
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tips button */}
        <button
          onClick={onTipsClick}
          className="w-full h-12 rounded-xl border-2 border-dashed border-gray-300 text-gray-700 font-medium hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Lightbulb className="w-4 h-4" />
          <span>Tips to Improve</span>
        </button>
      </div>
    </div>
  );
}
