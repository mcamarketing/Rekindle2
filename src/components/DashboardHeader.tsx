import { Activity, Search, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  agentCount: number;
  activeCount: number;
  errorCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
}

export function DashboardHeader({
  agentCount,
  activeCount,
  errorCount,
  searchQuery,
  onSearchChange,
  onRefresh
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b-2 border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Monitoring Dashboard</h1>
            <p className="text-sm text-gray-600">Real-time autonomous agent tracking system</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search agents by name, type, or status..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-gray-50 px-6 py-3 rounded-lg border-2 border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{agentCount}</div>
            <div className="text-xs text-gray-600">Total Agents</div>
          </div>
          <div className="bg-green-50 px-6 py-3 rounded-lg border-2 border-green-200">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="bg-red-50 px-6 py-3 rounded-lg border-2 border-red-200">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-xs text-gray-600">Errors</div>
          </div>
        </div>
      </div>
    </div>
  );
}
