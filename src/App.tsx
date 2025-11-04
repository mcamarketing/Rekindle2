import { useState, useMemo } from 'react';
import { useRealtimeAgents } from './hooks/useRealtimeAgents';
import { useRealtimeMetrics } from './hooks/useRealtimeMetrics';
import { DashboardHeader } from './components/DashboardHeader';
import { AgentCard } from './components/AgentCard';
import { AgentDetailModal } from './components/AgentDetailModal';
import type { Database } from './lib/database.types';

type Agent = Database['public']['Tables']['agents']['Row'];

function App() {
  const { agents, loading, refetch } = useRealtimeAgents();
  const { metrics } = useRealtimeMetrics();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.agent_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.status.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agents, searchQuery, statusFilter]);

  const agentMetricsMap = useMemo(() => {
    const map = new Map();
    metrics.forEach(metric => {
      if (!map.has(metric.agent_id) ||
          new Date(metric.recorded_at) > new Date(map.get(metric.agent_id).recorded_at)) {
        map.set(metric.agent_id, metric);
      }
    });
    return map;
  }, [metrics]);

  const stats = useMemo(() => {
    const activeCount = agents.filter(a => a.status === 'active').length;
    const errorCount = agents.filter(a => a.status === 'error').length;
    return { activeCount, errorCount };
  }, [agents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        agentCount={agents.length}
        activeCount={stats.activeCount}
        errorCount={stats.errorCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refetch}
      />

      <div className="px-8 py-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex gap-2">
            {['all', 'active', 'idle', 'warning', 'error', 'offline'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">No agents found</p>
            <p className="text-gray-500 text-sm">
              {agents.length === 0
                ? 'Register your first agent to start monitoring'
                : 'Try adjusting your search or filter criteria'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                metrics={agentMetricsMap.get(agent.id)}
                onClick={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

export default App;
