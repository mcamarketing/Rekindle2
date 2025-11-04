import { Activity, AlertCircle, CheckCircle, Clock, Cpu, HardDrive } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Agent = Database['public']['Tables']['agents']['Row'];
type AgentMetric = Database['public']['Tables']['agent_metrics']['Row'];

interface AgentCardProps {
  agent: Agent;
  metrics?: AgentMetric;
  onClick?: () => void;
}

const statusConfig = {
  active: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    label: 'Active'
  },
  idle: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Clock,
    label: 'Idle'
  },
  warning: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertCircle,
    label: 'Warning'
  },
  error: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    label: 'Error'
  },
  offline: {
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: Activity,
    label: 'Offline'
  }
};

export function AgentCard({ agent, metrics, onClick }: AgentCardProps) {
  const config = statusConfig[agent.status];
  const StatusIcon = config.icon;

  const getHealthLevel = () => {
    if (!metrics) return 'unknown';
    const avgHealth = (100 - metrics.cpu_usage + (metrics.memory_usage > 0 ? 50 : 100)) / 2;
    if (avgHealth > 80) return 'excellent';
    if (avgHealth > 60) return 'good';
    if (avgHealth > 40) return 'fair';
    return 'poor';
  };

  const healthLevel = getHealthLevel();

  return (
    <div
      onClick={onClick}
      className={`bg-white border-2 ${config.borderColor} rounded-lg p-6 transition-all hover:shadow-lg cursor-pointer hover:scale-105 duration-200`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{agent.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{agent.description || 'No description'}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor}`}>
          <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`}></div>
          <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
        </div>
      </div>

      <div className="space-y-3">
        {metrics && (
          <>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Cpu className="w-4 h-4" />
                <span>CPU</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metrics.cpu_usage > 80 ? 'bg-red-500' : metrics.cpu_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'} transition-all`}
                    style={{ width: `${Math.min(metrics.cpu_usage, 100)}%` }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900 w-12 text-right">{metrics.cpu_usage.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <HardDrive className="w-4 h-4" />
                <span>Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min((metrics.memory_usage / 1024) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900 w-12 text-right">{metrics.memory_usage.toFixed(0)}MB</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-gray-900">{metrics.active_tasks}</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{metrics.completed_tasks}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{metrics.error_count}</div>
                <div className="text-xs text-gray-500">Errors</div>
              </div>
            </div>
          </>
        )}

        {!metrics && (
          <div className="text-center py-4 text-sm text-gray-500">
            No metrics available
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>Type: {agent.agent_type}</span>
        <span className={`font-medium ${
          healthLevel === 'excellent' ? 'text-green-600' :
          healthLevel === 'good' ? 'text-blue-600' :
          healthLevel === 'fair' ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          Health: {healthLevel}
        </span>
      </div>
    </div>
  );
}
