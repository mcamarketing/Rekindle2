import { AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type AgentLog = Database['public']['Tables']['agent_logs']['Row'];

interface LogViewerProps {
  logs: AgentLog[];
  onFilterChange?: (level: string | null) => void;
  selectedFilter?: string | null;
}

const levelConfig = {
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'INFO'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'WARNING'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'ERROR'
  },
  critical: {
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    label: 'CRITICAL'
  }
};

export function LogViewer({ logs, onFilterChange, selectedFilter }: LogViewerProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange?.(null)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              !selectedFilter
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(levelConfig).map(([level, config]) => (
            <button
              key={level}
              onClick={() => onFilterChange?.(level)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedFilter === level
                  ? `${config.bgColor} ${config.color}`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No logs to display
          </div>
        ) : (
          logs.map((log) => {
            const config = levelConfig[log.level];
            const LogIcon = config.icon;

            return (
              <div
                key={log.id}
                className={`border ${config.borderColor} ${config.bgColor} rounded-lg p-3 transition-all hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <LogIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-xs font-bold ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 break-words">{log.message}</p>
                    {log.error_code && (
                      <div className="mt-1 text-xs text-gray-600">
                        Code: <span className="font-mono">{log.error_code}</span>
                      </div>
                    )}
                    {log.stack_trace && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                          Show stack trace
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                          {log.stack_trace}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
