import { X } from 'lucide-react';
import { useRealtimeMetrics } from '../hooks/useRealtimeMetrics';
import { useRealtimeTasks } from '../hooks/useRealtimeTasks';
import { useRealtimeLogs } from '../hooks/useRealtimeLogs';
import { PerformanceChart } from './PerformanceChart';
import { TaskProgressBar } from './TaskProgressBar';
import { LogViewer } from './LogViewer';
import type { Database } from '../lib/database.types';
import { useState } from 'react';

type Agent = Database['public']['Tables']['agents']['Row'];

interface AgentDetailModalProps {
  agent: Agent;
  onClose: () => void;
}

export function AgentDetailModal({ agent, onClose }: AgentDetailModalProps) {
  const { metrics } = useRealtimeMetrics(agent.id);
  const { tasks } = useRealtimeTasks(agent.id);
  const [logFilter, setLogFilter] = useState<string | null>(null);
  const { logs } = useRealtimeLogs(agent.id, logFilter || undefined);

  const activeTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
            <p className="text-sm text-gray-600">{agent.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PerformanceChart
                  metrics={metrics}
                  type="cpu"
                  title="CPU Usage"
                />
                <PerformanceChart
                  metrics={metrics}
                  type="memory"
                  title="Memory Usage"
                />
                <PerformanceChart
                  metrics={metrics}
                  type="response_time"
                  title="Response Time"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Active Tasks ({activeTasks.length})
              </h3>
              {activeTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTasks.map(task => (
                    <TaskProgressBar key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                  No active tasks
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Tasks ({Math.min(completedTasks.length, 6)})
              </h3>
              {completedTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedTasks.slice(0, 6).map(task => (
                    <TaskProgressBar key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                  No completed tasks
                </div>
              )}
            </div>

            <div>
              <LogViewer
                logs={logs}
                onFilterChange={setLogFilter}
                selectedFilter={logFilter}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Agent Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Agent ID</div>
                  <div className="font-mono text-xs text-gray-900 break-all">{agent.id}</div>
                </div>
                <div>
                  <div className="text-gray-600">Type</div>
                  <div className="font-medium text-gray-900">{agent.agent_type}</div>
                </div>
                <div>
                  <div className="text-gray-600">Status</div>
                  <div className="font-medium text-gray-900">{agent.status}</div>
                </div>
                <div>
                  <div className="text-gray-600">Last Heartbeat</div>
                  <div className="font-medium text-gray-900">
                    {new Date(agent.last_heartbeat).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
