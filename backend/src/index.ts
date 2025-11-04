import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes

// Get all agents
app.get('/api/agents', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get agent by ID
app.get('/api/agents/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get agent metrics
app.get('/api/agents/:id/metrics', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;

    const { data, error } = await supabase
      .from('agent_metrics')
      .select('*')
      .eq('agent_id', req.params.id)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all metrics (for analytics)
app.get('/api/metrics', async (req: Request, res: Response) => {
  try {
    const hoursBack = parseInt(req.query.hours as string) || 24;
    const timeAgo = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('agent_metrics')
      .select('*')
      .gte('recorded_at', timeAgo)
      .order('recorded_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all tasks
app.get('/api/tasks', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agent_id as string;
    const status = req.query.status as string;

    let query = supabase.from('agent_tasks').select('*');

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard stats
app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const { data: agents } = await supabase.from('agents').select('status');
    const { data: tasks } = await supabase.from('agent_tasks').select('status');
    const { data: metrics } = await supabase
      .from('agent_metrics')
      .select('cpu_usage, memory_usage, response_time, error_count')
      .order('recorded_at', { ascending: false })
      .limit(100);

    const activeAgents = agents?.filter(a => a.status === 'active').length || 0;
    const activeTasks = tasks?.filter(t => t.status === 'in_progress').length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
    const failedTasks = tasks?.filter(t => t.status === 'failed').length || 0;

    const avgCpuUsage = metrics?.length
      ? metrics.reduce((sum, m) => sum + (Number(m.cpu_usage) || 0), 0) / metrics.length
      : 0;

    const avgMemoryUsage = metrics?.length
      ? metrics.reduce((sum, m) => sum + (Number(m.memory_usage) || 0), 0) / metrics.length
      : 0;

    const avgResponseTime = metrics?.length
      ? metrics.reduce((sum, m) => sum + (Number(m.response_time) || 0), 0) / metrics.length
      : 0;

    const totalErrors = metrics?.reduce((sum, m) => sum + (Number(m.error_count) || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        totalAgents: agents?.length || 0,
        activeAgents,
        totalTasks: tasks?.length || 0,
        activeTasks,
        completedTasks,
        failedTasks,
        totalErrors,
        avgResponseTime: Math.round(avgResponseTime),
        avgCpuUsage: Math.round(avgCpuUsage * 10) / 10,
        avgMemoryUsage: Math.round(avgMemoryUsage * 10) / 10
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get alerts
app.get('/api/alerts', async (req: Request, res: Response) => {
  try {
    const isResolved = req.query.is_resolved;

    let query = supabase.from('system_alerts').select('*');

    if (isResolved !== undefined) {
      query = query.eq('is_resolved', isResolved === 'true');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
