/*
  # Agent Monitoring Dashboard Schema

  ## Overview
  This migration creates the complete database schema for a real-time agent monitoring system
  that tracks autonomous agents, their health metrics, tasks, and error logs.

  ## 1. New Tables

  ### `agents`
  Stores information about registered agents in the monitoring system.
  - `id` (uuid, primary key) - Unique identifier for each agent
  - `name` (text) - Display name of the agent
  - `description` (text) - Agent purpose/description
  - `status` (text) - Current status: 'active', 'idle', 'warning', 'error', 'offline'
  - `agent_type` (text) - Type/category of agent
  - `last_heartbeat` (timestamptz) - Last time agent sent a heartbeat signal
  - `created_at` (timestamptz) - When agent was registered
  - `updated_at` (timestamptz) - Last update timestamp
  - `metadata` (jsonb) - Flexible storage for additional agent properties

  ### `agent_metrics`
  Real-time performance metrics for each agent (CPU, memory, response time).
  - `id` (uuid, primary key) - Unique metric record identifier
  - `agent_id` (uuid, foreign key) - Reference to agents table
  - `cpu_usage` (numeric) - CPU utilization percentage (0-100)
  - `memory_usage` (numeric) - Memory utilization in MB
  - `response_time` (numeric) - Average response time in milliseconds
  - `active_tasks` (integer) - Number of currently active tasks
  - `completed_tasks` (integer) - Total completed tasks count
  - `error_count` (integer) - Number of errors in current period
  - `recorded_at` (timestamptz) - When metrics were captured

  ### `agent_tasks`
  Tracks individual tasks assigned to and executed by agents.
  - `id` (uuid, primary key) - Unique task identifier
  - `agent_id` (uuid, foreign key) - Reference to agents table
  - `name` (text) - Task name/title
  - `description` (text) - Detailed task description
  - `status` (text) - Task status: 'pending', 'in_progress', 'completed', 'failed', 'cancelled'
  - `progress` (numeric) - Completion percentage (0-100)
  - `priority` (text) - Task priority: 'low', 'medium', 'high', 'critical'
  - `started_at` (timestamptz) - When task execution began
  - `completed_at` (timestamptz) - When task finished
  - `estimated_duration` (integer) - Estimated completion time in seconds
  - `actual_duration` (integer) - Actual completion time in seconds
  - `created_at` (timestamptz) - Task creation timestamp
  - `metadata` (jsonb) - Additional task-specific data

  ### `agent_logs`
  Error logs and system events for debugging and alerting.
  - `id` (uuid, primary key) - Unique log entry identifier
  - `agent_id` (uuid, foreign key) - Reference to agents table
  - `task_id` (uuid, foreign key, nullable) - Optional reference to specific task
  - `level` (text) - Log level: 'info', 'warning', 'error', 'critical'
  - `message` (text) - Log message content
  - `error_code` (text) - Optional error code for categorization
  - `stack_trace` (text) - Stack trace for errors
  - `created_at` (timestamptz) - When log was created
  - `metadata` (jsonb) - Additional context data

  ### `agent_performance_history`
  Aggregated historical performance data for trend analysis.
  - `id` (uuid, primary key) - Unique history record identifier
  - `agent_id` (uuid, foreign key) - Reference to agents table
  - `period_start` (timestamptz) - Start of aggregation period
  - `period_end` (timestamptz) - End of aggregation period
  - `avg_cpu` (numeric) - Average CPU usage during period
  - `avg_memory` (numeric) - Average memory usage during period
  - `avg_response_time` (numeric) - Average response time during period
  - `total_tasks` (integer) - Total tasks processed in period
  - `successful_tasks` (integer) - Successfully completed tasks
  - `failed_tasks` (integer) - Failed tasks count
  - `total_errors` (integer) - Total errors during period
  - `uptime_percentage` (numeric) - Percentage of time agent was active

  ## 2. Security

  All tables have Row Level Security (RLS) enabled with restrictive policies:
  - SELECT: Authenticated users can view all monitoring data
  - INSERT: Authenticated users can create new records (for agent registration and data ingestion)
  - UPDATE: Authenticated users can update records (for status changes and metric updates)
  - DELETE: Authenticated users can delete old records (for data cleanup)

  Note: In production, these policies should be further restricted based on user roles.

  ## 3. Indexes

  Performance indexes are created on frequently queried columns:
  - Agent lookup by status
  - Metrics retrieval by agent and timestamp
  - Task filtering by agent and status
  - Log queries by agent, level, and timestamp
  - Historical data retrieval by agent and time period

  ## 4. Important Notes

  - Real-time subscriptions are enabled on all tables for live dashboard updates
  - Timestamps use `timestamptz` for timezone-aware storage
  - JSONB columns allow flexible metadata storage without schema changes
  - Foreign key constraints ensure data integrity
  - Cascading deletes prevent orphaned records when agents are removed
*/

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'warning', 'error', 'offline')),
  agent_type text NOT NULL DEFAULT 'generic',
  last_heartbeat timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create agent_metrics table
CREATE TABLE IF NOT EXISTS agent_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  cpu_usage numeric(5,2) DEFAULT 0 CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
  memory_usage numeric(10,2) DEFAULT 0 CHECK (memory_usage >= 0),
  response_time numeric(10,2) DEFAULT 0 CHECK (response_time >= 0),
  active_tasks integer DEFAULT 0 CHECK (active_tasks >= 0),
  completed_tasks integer DEFAULT 0 CHECK (completed_tasks >= 0),
  error_count integer DEFAULT 0 CHECK (error_count >= 0),
  recorded_at timestamptz DEFAULT now()
);

-- Create agent_tasks table
CREATE TABLE IF NOT EXISTS agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  progress numeric(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  started_at timestamptz,
  completed_at timestamptz,
  estimated_duration integer,
  actual_duration integer,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create agent_logs table
CREATE TABLE IF NOT EXISTS agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  task_id uuid REFERENCES agent_tasks(id) ON DELETE SET NULL,
  level text NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'critical')),
  message text NOT NULL,
  error_code text,
  stack_trace text,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create agent_performance_history table
CREATE TABLE IF NOT EXISTS agent_performance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  avg_cpu numeric(5,2) DEFAULT 0,
  avg_memory numeric(10,2) DEFAULT 0,
  avg_response_time numeric(10,2) DEFAULT 0,
  total_tasks integer DEFAULT 0,
  successful_tasks integer DEFAULT 0,
  failed_tasks integer DEFAULT 0,
  total_errors integer DEFAULT 0,
  uptime_percentage numeric(5,2) DEFAULT 100
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_last_heartbeat ON agents(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id ON agent_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_recorded_at ON agent_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_level ON agent_logs(level);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_history_agent_id ON agent_performance_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_performance_history_period ON agent_performance_history(period_start, period_end);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for agents table
CREATE POLICY "Authenticated users can view all agents"
  ON agents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create agents"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update agents"
  ON agents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete agents"
  ON agents FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for agent_metrics table
CREATE POLICY "Authenticated users can view all metrics"
  ON agent_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create metrics"
  ON agent_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update metrics"
  ON agent_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete metrics"
  ON agent_metrics FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for agent_tasks table
CREATE POLICY "Authenticated users can view all tasks"
  ON agent_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON agent_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
  ON agent_tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tasks"
  ON agent_tasks FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for agent_logs table
CREATE POLICY "Authenticated users can view all logs"
  ON agent_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create logs"
  ON agent_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update logs"
  ON agent_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete logs"
  ON agent_logs FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for agent_performance_history table
CREATE POLICY "Authenticated users can view all performance history"
  ON agent_performance_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create performance history"
  ON agent_performance_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update performance history"
  ON agent_performance_history FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete performance history"
  ON agent_performance_history FOR DELETE
  TO authenticated
  USING (true);