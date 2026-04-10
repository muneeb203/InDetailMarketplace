import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Eye, 
  Bookmark, 
  Mail, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Info,
  Calendar
} from 'lucide-react';
import { ExposureMetrics as ExposureMetricsType } from '../types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ExposureMetricsProps {
  metrics?: ExposureMetricsType;
}

export function ExposureMetrics({ metrics }: ExposureMetricsProps) {
  const [period, setPeriod] = useState<'7' | '30'>('30');

  // Mock data if no metrics provided
  const data: ExposureMetricsType = metrics || {
    profileViews: 1243,
    profileViewsTrend: 12.5,
    saves: 89,
    savesTrend: 8.2,
    leadOpens: 156,
    leadOpensTrend: -3.1,
    quoteAcceptRate: 68,
    quoteAcceptRateTrend: 5.4,
    period: '30',
  };

  const metricCards = [
    {
      icon: Eye,
      label: 'Profile Views',
      value: data.profileViews.toLocaleString(),
      trend: data.profileViewsTrend,
      tooltip: 'Number of times your profile has been viewed by potential customers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Bookmark,
      label: 'Saves',
      value: data.saves.toLocaleString(),
      trend: data.savesTrend,
      tooltip: 'Number of customers who saved your profile for later',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Mail,
      label: 'Lead Opens',
      value: data.leadOpens.toLocaleString(),
      trend: data.leadOpensTrend,
      tooltip: 'Number of quote requests you received',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: CheckCircle,
      label: 'Quote Accept Rate',
      value: `${data.quoteAcceptRate}%`,
      trend: data.quoteAcceptRateTrend,
      tooltip: 'Percentage of your quotes that were accepted by customers',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3>Your Exposure Metrics</h3>
            <p className="text-sm text-gray-500 mt-1">Track how customers discover and engage with your profile</p>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            <Button
              variant={period === '7' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('7')}
              className="gap-1"
            >
              <Calendar className="w-3 h-3" />
              7 days
            </Button>
            <Button
              variant={period === '30' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('30')}
              className="gap-1"
            >
              <Calendar className="w-3 h-3" />
              30 days
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricCards.map((metric) => (
            <Card key={metric.label} className={`p-5 border-2 hover:border-blue-200 transition-colors ${metric.bgColor}/30`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <Info className="w-4 h-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{metric.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-3xl">{metric.value}</h2>
                  
                  {metric.trend !== 0 && (
                    <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                      <span className="text-sm font-medium">
                        {Math.abs(metric.trend).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Insights */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4>Performance Insight</h4>
              <p className="text-sm text-gray-700 mt-1">
                Your profile views are up {data.profileViewsTrend.toFixed(1)}% compared to the previous period. 
                Keep your portfolio updated to maintain this momentum!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
