import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { Cpu, Activity, AlertCircle, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  agent_type: string;
  last_heartbeat: string;
  metadata: any;
}

interface AgentMetrics {
  agent_id: string;
  cpu_usage: number;
  memory_usage: number;
  response_time: number;
  active_tasks: number;
  completed_tasks: number;
  error_count: number;
  recorded_at: string;
}

export function AIAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<Record<string, AgentMetrics>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (agentsError) throw agentsError;

      const { data: metricsData, error: metricsError } = await supabase
        .from('agent_metrics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (metricsError) throw metricsError;

      const latestMetrics: Record<string, AgentMetrics> = {};
      metricsData?.forEach(metric => {
        if (!latestMetrics[metric.agent_id]) {
          latestMetrics[metric.agent_id] = metric;
        }
      });

      setAgents(agentsData || []);
      setMetrics(latestMetrics);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'offline':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      idle: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      offline: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAgentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      researcher: 'bg-purple-100 text-purple-800',
      writer: 'bg-blue-100 text-blue-800',
      scorer: 'bg-green-100 text-green-800',
      sourcer: 'bg-yellow-100 text-yellow-800',
      analyzer: 'bg-pink-100 text-pink-800',
      optimizer: 'bg-indigo-100 text-indigo-800',
      tracker: 'bg-teal-100 text-teal-800',
      sender: 'bg-orange-100 text-orange-800',
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatUptime = (lastHeartbeat: string) => {
    const diff = Date.now() - new Date(lastHeartbeat).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const agentsByType = agents.reduce((acc, agent) => {
    const type = agent.agent_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="agents" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage your autonomous AI agents
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Cpu className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No agents found
            </h3>
            <p className="text-gray-600">
              AI agents will appear here once they are initialized
            </p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Agents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{agents.length}</p>
                  </div>
                  <Cpu className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {agents.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Idle</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {agents.filter(a => a.status === 'idle').length}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Issues</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {agents.filter(a => a.status === 'error' || a.status === 'warning').length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Agents Grid by Type */}
            {Object.entries(agentsByType).map(([type, typeAgents]) => (
              <div key={type} className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                  {type} Agents ({typeAgents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {typeAgents.map((agent) => {
                    const metric = metrics[agent.id];
                    return (
                      <div
                        key={agent.id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200"
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(agent.status)}
                                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {agent.description || 'No description'}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex gap-2 mb-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(agent.status)}`}>
                              {agent.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${getAgentTypeColor(agent.agent_type)}`}>
                              {agent.agent_type}
                            </span>
                          </div>

                          {/* Metrics */}
                          {metric && (
                            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-2">
                                  <Zap className="w-4 h-4" />
                                  CPU Usage
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {metric.cpu_usage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-2">
                                  <Activity className="w-4 h-4" />
                                  Active Tasks
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {metric.active_tasks}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" />
                                  Completed
                                </span>
                                <span className="font-semibold text-green-600">
                                  {metric.completed_tasks}
                                </span>
                              </div>
                              {metric.error_count > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Errors
                                  </span>
                                  <span className="font-semibold text-red-600">
                                    {metric.error_count}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Last Heartbeat */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Last seen</span>
                            <span>{formatUptime(agent.last_heartbeat)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
