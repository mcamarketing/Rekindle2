export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          name: string
          description: string
          status: 'active' | 'idle' | 'warning' | 'error' | 'offline'
          agent_type: string
          last_heartbeat: string
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          name: string
          description?: string
          status?: 'active' | 'idle' | 'warning' | 'error' | 'offline'
          agent_type?: string
          last_heartbeat?: string
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          name?: string
          description?: string
          status?: 'active' | 'idle' | 'warning' | 'error' | 'offline'
          agent_type?: string
          last_heartbeat?: string
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      agent_metrics: {
        Row: {
          id: string
          agent_id: string
          cpu_usage: number
          memory_usage: number
          response_time: number
          active_tasks: number
          completed_tasks: number
          error_count: number
          recorded_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          cpu_usage?: number
          memory_usage?: number
          response_time?: number
          active_tasks?: number
          completed_tasks?: number
          error_count?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          cpu_usage?: number
          memory_usage?: number
          response_time?: number
          active_tasks?: number
          completed_tasks?: number
          error_count?: number
          recorded_at?: string
        }
      }
      agent_tasks: {
        Row: {
          id: string
          agent_id: string
          name: string
          description: string
          status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          progress: number
          priority: 'low' | 'medium' | 'high' | 'critical'
          started_at: string | null
          completed_at: string | null
          estimated_duration: number | null
          actual_duration: number | null
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          agent_id: string
          name: string
          description?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          priority?: 'low' | 'medium' | 'high' | 'critical'
          started_at?: string | null
          completed_at?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          agent_id?: string
          name?: string
          description?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          priority?: 'low' | 'medium' | 'high' | 'critical'
          started_at?: string | null
          completed_at?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          created_at?: string
          metadata?: Json
        }
      }
      agent_logs: {
        Row: {
          id: string
          agent_id: string
          task_id: string | null
          level: 'info' | 'warning' | 'error' | 'critical'
          message: string
          error_code: string | null
          stack_trace: string | null
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          agent_id: string
          task_id?: string | null
          level?: 'info' | 'warning' | 'error' | 'critical'
          message: string
          error_code?: string | null
          stack_trace?: string | null
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          agent_id?: string
          task_id?: string | null
          level?: 'info' | 'warning' | 'error' | 'critical'
          message?: string
          error_code?: string | null
          stack_trace?: string | null
          created_at?: string
          metadata?: Json
        }
      }
      agent_performance_history: {
        Row: {
          id: string
          agent_id: string
          period_start: string
          period_end: string
          avg_cpu: number
          avg_memory: number
          avg_response_time: number
          total_tasks: number
          successful_tasks: number
          failed_tasks: number
          total_errors: number
          uptime_percentage: number
        }
        Insert: {
          id?: string
          agent_id: string
          period_start: string
          period_end: string
          avg_cpu?: number
          avg_memory?: number
          avg_response_time?: number
          total_tasks?: number
          successful_tasks?: number
          failed_tasks?: number
          total_errors?: number
          uptime_percentage?: number
        }
        Update: {
          id?: string
          agent_id?: string
          period_start?: string
          period_end?: string
          avg_cpu?: number
          avg_memory?: number
          avg_response_time?: number
          total_tasks?: number
          successful_tasks?: number
          failed_tasks?: number
          total_errors?: number
          uptime_percentage?: number
        }
      }
    }
  }
}
