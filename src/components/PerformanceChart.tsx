import { useMemo } from 'react';
import type { Database } from '../lib/database.types';

type AgentMetric = Database['public']['Tables']['agent_metrics']['Row'];

interface PerformanceChartProps {
  metrics: AgentMetric[];
  type: 'cpu' | 'memory' | 'response_time';
  title: string;
}

export function PerformanceChart({ metrics, type, title }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const sorted = [...metrics].sort((a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    ).slice(-20);

    const values = sorted.map(m => {
      switch (type) {
        case 'cpu':
          return m.cpu_usage;
        case 'memory':
          return m.memory_usage;
        case 'response_time':
          return m.response_time;
        default:
          return 0;
      }
    });

    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);

    return {
      values,
      max,
      min,
      normalized: values.map(v => ((v - min) / (max - min || 1)) * 100)
    };
  }, [metrics, type]);

  const getColor = () => {
    switch (type) {
      case 'cpu':
        return 'stroke-blue-500 fill-blue-100';
      case 'memory':
        return 'stroke-green-500 fill-green-100';
      case 'response_time':
        return 'stroke-purple-500 fill-purple-100';
      default:
        return 'stroke-gray-500 fill-gray-100';
    }
  };

  const createPath = () => {
    if (chartData.normalized.length === 0) return '';

    const width = 100;
    const height = 100;
    const step = width / (chartData.normalized.length - 1 || 1);

    let path = `M 0,${height - chartData.normalized[0]}`;

    for (let i = 1; i < chartData.normalized.length; i++) {
      const x = i * step;
      const y = height - chartData.normalized[i];
      path += ` L ${x},${y}`;
    }

    return path;
  };

  const createAreaPath = () => {
    if (chartData.normalized.length === 0) return '';

    const linePath = createPath();
    const width = 100;
    const lastX = width;

    return `${linePath} L ${lastX},100 L 0,100 Z`;
  };

  const getUnit = () => {
    switch (type) {
      case 'cpu':
        return '%';
      case 'memory':
        return 'MB';
      case 'response_time':
        return 'ms';
      default:
        return '';
    }
  };

  const currentValue = chartData.values[chartData.values.length - 1] || 0;
  const avgValue = chartData.values.reduce((a, b) => a + b, 0) / (chartData.values.length || 1);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-end gap-4">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {currentValue.toFixed(1)}{getUnit()}
            </div>
            <div className="text-xs text-gray-500">Current</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-600">
              {avgValue.toFixed(1)}{getUnit()}
            </div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
        </div>
      </div>

      <div className="relative h-48 bg-gray-50 rounded-lg overflow-hidden">
        {chartData.values.length > 0 ? (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d={createAreaPath()}
              className={`${getColor()} opacity-30`}
            />
            <path
              d={createPath()}
              className={`${getColor().split(' ')[0]} fill-none`}
              strokeWidth="2"
            />
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No data available
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Last {chartData.values.length} readings</span>
        <span>Min: {chartData.min.toFixed(1)}{getUnit()} | Max: {chartData.max.toFixed(1)}{getUnit()}</span>
      </div>
    </div>
  );
}
