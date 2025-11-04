import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type AgentLog = Database['public']['Tables']['agent_logs']['Row'];

export function useRealtimeLogs(agentId?: string, level?: string) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('logs-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_logs',
          ...(agentId && { filter: `agent_id=eq.${agentId}` })
        },
        (payload) => {
          const newLog = payload.new as AgentLog;
          if (!level || newLog.level === level) {
            setLogs(prev => [newLog, ...prev].slice(0, 100));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, level]);

  async function fetchLogs() {
    try {
      setLoading(true);
      let query = supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }
      if (level) {
        query = query.eq('level', level);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }

  return { logs, loading, error, refetch: fetchLogs };
}
