import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type AgentMetric = Database['public']['Tables']['agent_metrics']['Row'];

export function useRealtimeMetrics(agentId?: string) {
  const [metrics, setMetrics] = useState<AgentMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('metrics-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_metrics',
          ...(agentId && { filter: `agent_id=eq.${agentId}` })
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMetrics(prev => [payload.new as AgentMetric, ...prev].slice(0, 50));
          } else if (payload.eventType === 'UPDATE') {
            setMetrics(prev => prev.map(metric =>
              metric.id === payload.new.id ? payload.new as AgentMetric : metric
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  async function fetchMetrics() {
    try {
      setLoading(true);
      let query = supabase
        .from('agent_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setMetrics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }

  return { metrics, loading, error, refetch: fetchMetrics };
}
