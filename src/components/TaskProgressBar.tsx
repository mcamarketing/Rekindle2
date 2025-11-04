import { CheckCircle, Circle, AlertCircle, XCircle, Loader } from 'lucide-react';
import type { Database } from '../lib/database.types';

type AgentTask = Database['public']['Tables']['agent_tasks']['Row'];

interface TaskProgressBarProps {
  task: AgentTask;
}

const statusConfig = {
  pending: {
    icon: Circle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    progressColor: 'bg-gray-400'
  },
  in_progress: {
    icon: Loader,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    progressColor: 'bg-blue-500',
    animate: true
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    progressColor: 'bg-green-500'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    progressColor: 'bg-red-500'
  },
  cancelled: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    progressColor: 'bg-orange-500'
  }
};

const priorityConfig = {
  low: { color: 'text-gray-600', badge: 'bg-gray-100' },
  medium: { color: 'text-blue-600', badge: 'bg-blue-100' },
  high: { color: 'text-orange-600', badge: 'bg-orange-100' },
  critical: { color: 'text-red-600', badge: 'bg-red-100' }
};

export function TaskProgressBar({ task }: TaskProgressBarProps) {
  const config = statusConfig[task.status];
  const priorityStyle = priorityConfig[task.priority];
  const StatusIcon = config.icon;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className={`border-2 border-gray-200 rounded-lg p-4 ${config.bgColor} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
            <h4 className="font-semibold text-gray-900">{task.name}</h4>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${priorityStyle.color} ${priorityStyle.badge}`}>
          {task.priority.toUpperCase()}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Progress</span>
          <span className="text-xs font-bold text-gray-900">{task.progress.toFixed(0)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(task.progress, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Status:</span>
          <span className={`ml-1 font-medium ${config.color}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Duration:</span>
          <span className="ml-1 font-medium text-gray-900">
            {task.actual_duration ? formatDuration(task.actual_duration) : formatDuration(task.estimated_duration)}
          </span>
        </div>
      </div>

      {task.started_at && (
        <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-500">
          Started: {new Date(task.started_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}
