import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { apiClient, checkBackendHealth } from '../lib/api';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MetricsData {
  timestamp: string;
  cpu: number;
  memory: number;
  responseTime: number;
  errors: number;
}

interface TasksData {
  date: string;
  completed: number;
  failed: number;
  pending: number;
}

export function Analytics() {
  const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
  const [tasksHistory, setTasksHistory] = useState<TasksData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [useBackend, setUseBackend] = useState(false);

  useEffect(() => {
    checkBackend();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, useBackend]);

  const checkBackend = async () => {
    const isHealthy = await checkBackendHealth();
    setUseBackend(isHealthy);
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMetricsHistory(), loadTasksHistory()]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetricsHistory = async () => {
    const hoursBack = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const timeAgo = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('agent_metrics')
      .select('*')
      .gte('recorded_at', timeAgo)
      .order('recorded_at', { ascending: true });

    if (error) throw error;

    const aggregated = aggregateMetrics(data || [], timeRange);
    setMetricsHistory(aggregated);
  };

  const loadTasksHistory = async () => {
    const daysBack = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    const timeAgo = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('agent_tasks')
      .select('status, created_at')
      .gte('created_at', timeAgo);

    if (error) throw error;

    const aggregated = aggregateTasks(data || [], timeRange);
    setTasksHistory(aggregated);
  };

  const aggregateMetrics = (data: any[], range: string): MetricsData[] => {
    if (data.length === 0) return [];

    const bucketSize = range === '24h' ? 3600000 : range === '7d' ? 3600000 * 4 : 86400000;
    const buckets: Record<number, any[]> = {};

    data.forEach(item => {
      const time = new Date(item.recorded_at).getTime();
      const bucketKey = Math.floor(time / bucketSize) * bucketSize;
      if (!buckets[bucketKey]) buckets[bucketKey] = [];
      buckets[bucketKey].push(item);
    });

    return Object.entries(buckets).map(([key, items]) => ({
      timestamp: new Date(parseInt(key)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: items.reduce((sum, i) => sum + Number(i.cpu_usage || 0), 0) / items.length,
      memory: items.reduce((sum, i) => sum + Number(i.memory_usage || 0), 0) / items.length,
      responseTime: items.reduce((sum, i) => sum + Number(i.response_time || 0), 0) / items.length,
      errors: items.reduce((sum, i) => sum + (i.error_count || 0), 0)
    }));
  };

  const aggregateTasks = (data: any[], range: string): TasksData[] => {
    const days = range === '24h' ? 1 : range === '7d' ? 7 : 30;
    const result: TasksData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayTasks = data.filter(t => {
        const taskDate = new Date(t.created_at);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });

      result.push({
        date: dateStr,
        completed: dayTasks.filter(t => t.status === 'completed').length,
        failed: dayTasks.filter(t => t.status === 'failed').length,
        pending: dayTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
      });
    }

    return result;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="analytics" />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="analytics" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Agent performance metrics and insights</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === '24h'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === '7d'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === '30d'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {metricsHistory.length > 0 && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[#FF6B35]" />
                  <h2 className="text-xl font-bold text-gray-900">CPU & Memory Usage</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metricsHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stackId="1"
                      stroke="#FF6B35"
                      fill="#FF6B35"
                      fillOpacity={0.6}
                      name="CPU %"
                    />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      stackId="2"
                      stroke="#F7931E"
                      fill="#F7931E"
                      fillOpacity={0.6}
                      name="Memory MB"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                  <h2 className="text-xl font-bold text-gray-900">Response Time</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricsHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#FF6B35"
                      strokeWidth={2}
                      dot={false}
                      name="Response Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {tasksHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B35]" />
                <h2 className="text-xl font-bold text-gray-900">Task Completion</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {metricsHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#FF6B35]" />
                <h2 className="text-xl font-bold text-gray-900">Error Count</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="errors" fill="#ef4444" name="Errors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {metricsHistory.length === 0 && tasksHistory.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">
                Analytics data will appear here once agents start reporting metrics
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
