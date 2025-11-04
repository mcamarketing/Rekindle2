# Agent Monitoring Dashboard - API Integration Guide

## Overview

This guide provides comprehensive instructions for integrating external agents with the Agent Monitoring Dashboard. The dashboard uses Supabase as its backend, providing real-time data synchronization through PostgreSQL's built-in replication features.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Integration Examples](#integration-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Supabase account and project
- API key (Anon key or Service Role key)
- HTTP client library (fetch, axios, requests, etc.)

### Environment Variables

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
# Optional: Use service role key for server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Base URL

All API requests should be made to:
```
https://YOUR_PROJECT_ID.supabase.co/rest/v1/
```

---

## Authentication

Include the API key in your request headers:

```http
Authorization: Bearer YOUR_ANON_KEY
apikey: YOUR_ANON_KEY
Content-Type: application/json
Prefer: return=representation
```

---

## API Endpoints

### 1. Agent Registration

Register a new agent in the monitoring system.

**Endpoint:** `POST /agents`

**Request Body:**
```json
{
  "name": "Agent-001",
  "description": "Data processing agent",
  "agent_type": "data_processor",
  "status": "active",
  "metadata": {
    "version": "1.0.0",
    "environment": "production"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Agent-001",
  "status": "active",
  "created_at": "2025-11-04T10:00:00Z"
}
```

### 2. Update Agent Status

Update agent status and heartbeat.

**Endpoint:** `PATCH /agents?id=eq.{agent_id}`

**Request Body:**
```json
{
  "status": "active",
  "last_heartbeat": "2025-11-04T10:05:00Z"
}
```

### 3. Send Metrics

Submit performance metrics for an agent.

**Endpoint:** `POST /agent_metrics`

**Request Body:**
```json
{
  "agent_id": "uuid",
  "cpu_usage": 45.2,
  "memory_usage": 512.5,
  "response_time": 150.3,
  "active_tasks": 3,
  "completed_tasks": 127,
  "error_count": 2
}
```

### 4. Create Task

Register a new task for an agent.

**Endpoint:** `POST /agent_tasks`

**Request Body:**
```json
{
  "agent_id": "uuid",
  "name": "Process Dataset Alpha",
  "description": "Processing customer data from source A",
  "status": "pending",
  "priority": "high",
  "estimated_duration": 300,
  "metadata": {
    "dataset_id": "alpha-001",
    "record_count": 10000
  }
}
```

### 5. Update Task Progress

Update task status and progress.

**Endpoint:** `PATCH /agent_tasks?id=eq.{task_id}`

**Request Body:**
```json
{
  "status": "in_progress",
  "progress": 65.5,
  "started_at": "2025-11-04T10:00:00Z"
}
```

### 6. Complete Task

Mark a task as completed.

**Endpoint:** `PATCH /agent_tasks?id=eq.{task_id}`

**Request Body:**
```json
{
  "status": "completed",
  "progress": 100,
  "completed_at": "2025-11-04T10:15:00Z",
  "actual_duration": 285
}
```

### 7. Log Events

Create log entries for debugging and monitoring.

**Endpoint:** `POST /agent_logs`

**Request Body:**
```json
{
  "agent_id": "uuid",
  "task_id": "uuid",
  "level": "error",
  "message": "Failed to process record #5432",
  "error_code": "PARSE_ERROR",
  "stack_trace": "Error: Invalid format\n  at parseRecord...",
  "metadata": {
    "record_id": 5432,
    "retry_count": 3
  }
}
```

---

## Data Models

### Agent Status Values
- `active` - Agent is running and processing tasks
- `idle` - Agent is running but not processing tasks
- `warning` - Agent has non-critical issues
- `error` - Agent has critical errors
- `offline` - Agent is not responding

### Task Status Values
- `pending` - Task is waiting to be processed
- `in_progress` - Task is currently being processed
- `completed` - Task finished successfully
- `failed` - Task failed to complete
- `cancelled` - Task was cancelled

### Task Priority Values
- `low` - Non-urgent task
- `medium` - Standard priority
- `high` - Important task
- `critical` - Urgent task requiring immediate attention

### Log Level Values
- `info` - Informational messages
- `warning` - Warning messages
- `error` - Error messages
- `critical` - Critical system errors

---

## Integration Examples

### Python Example

```python
import requests
from datetime import datetime

class AgentMonitor:
    def __init__(self, supabase_url, api_key):
        self.base_url = f"{supabase_url}/rest/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "apikey": api_key,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self.agent_id = None

    def register_agent(self, name, agent_type, description=""):
        """Register agent with the monitoring system"""
        response = requests.post(
            f"{self.base_url}/agents",
            headers=self.headers,
            json={
                "name": name,
                "agent_type": agent_type,
                "description": description,
                "status": "active"
            }
        )
        data = response.json()
        self.agent_id = data[0]["id"]
        return self.agent_id

    def send_heartbeat(self):
        """Send heartbeat to show agent is alive"""
        if not self.agent_id:
            raise ValueError("Agent not registered")

        requests.patch(
            f"{self.base_url}/agents?id=eq.{self.agent_id}",
            headers=self.headers,
            json={
                "last_heartbeat": datetime.utcnow().isoformat(),
                "status": "active"
            }
        )

    def send_metrics(self, cpu, memory, response_time, active_tasks, completed_tasks, errors):
        """Send performance metrics"""
        if not self.agent_id:
            raise ValueError("Agent not registered")

        requests.post(
            f"{self.base_url}/agent_metrics",
            headers=self.headers,
            json={
                "agent_id": self.agent_id,
                "cpu_usage": cpu,
                "memory_usage": memory,
                "response_time": response_time,
                "active_tasks": active_tasks,
                "completed_tasks": completed_tasks,
                "error_count": errors
            }
        )

    def create_task(self, name, description="", priority="medium", estimated_duration=None):
        """Create a new task"""
        if not self.agent_id:
            raise ValueError("Agent not registered")

        response = requests.post(
            f"{self.base_url}/agent_tasks",
            headers=self.headers,
            json={
                "agent_id": self.agent_id,
                "name": name,
                "description": description,
                "priority": priority,
                "status": "pending",
                "estimated_duration": estimated_duration
            }
        )
        return response.json()[0]["id"]

    def update_task_progress(self, task_id, progress, status="in_progress"):
        """Update task progress"""
        requests.patch(
            f"{self.base_url}/agent_tasks?id=eq.{task_id}",
            headers=self.headers,
            json={
                "progress": progress,
                "status": status
            }
        )

    def log(self, level, message, error_code=None, stack_trace=None):
        """Create a log entry"""
        if not self.agent_id:
            raise ValueError("Agent not registered")

        requests.post(
            f"{self.base_url}/agent_logs",
            headers=self.headers,
            json={
                "agent_id": self.agent_id,
                "level": level,
                "message": message,
                "error_code": error_code,
                "stack_trace": stack_trace
            }
        )

# Usage example
monitor = AgentMonitor(
    supabase_url="https://your-project.supabase.co",
    api_key="your-anon-key"
)

# Register agent
agent_id = monitor.register_agent("DataProcessor-001", "data_processor")

# Create and track a task
task_id = monitor.create_task("Process Customer Data", priority="high")
monitor.update_task_progress(task_id, 50)
monitor.update_task_progress(task_id, 100, status="completed")

# Send metrics periodically
monitor.send_metrics(
    cpu=45.2,
    memory=512.5,
    response_time=150,
    active_tasks=2,
    completed_tasks=100,
    errors=1
)

# Log events
monitor.log("info", "Processing started")
monitor.log("error", "Failed to connect to database", error_code="DB_CONN_ERROR")
```

### JavaScript/Node.js Example

```javascript
class AgentMonitor {
  constructor(supabaseUrl, apiKey) {
    this.baseUrl = `${supabaseUrl}/rest/v1`;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'apikey': apiKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    this.agentId = null;
  }

  async registerAgent(name, agentType, description = '') {
    const response = await fetch(`${this.baseUrl}/agents`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        name,
        agent_type: agentType,
        description,
        status: 'active'
      })
    });
    const data = await response.json();
    this.agentId = data[0].id;
    return this.agentId;
  }

  async sendHeartbeat() {
    if (!this.agentId) throw new Error('Agent not registered');

    await fetch(`${this.baseUrl}/agents?id=eq.${this.agentId}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({
        last_heartbeat: new Date().toISOString(),
        status: 'active'
      })
    });
  }

  async sendMetrics(metrics) {
    if (!this.agentId) throw new Error('Agent not registered');

    await fetch(`${this.baseUrl}/agent_metrics`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        agent_id: this.agentId,
        ...metrics
      })
    });
  }

  async createTask(name, options = {}) {
    if (!this.agentId) throw new Error('Agent not registered');

    const response = await fetch(`${this.baseUrl}/agent_tasks`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        agent_id: this.agentId,
        name,
        status: 'pending',
        ...options
      })
    });
    const data = await response.json();
    return data[0].id;
  }

  async updateTaskProgress(taskId, progress, status = 'in_progress') {
    await fetch(`${this.baseUrl}/agent_tasks?id=eq.${taskId}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ progress, status })
    });
  }

  async log(level, message, options = {}) {
    if (!this.agentId) throw new Error('Agent not registered');

    await fetch(`${this.baseUrl}/agent_logs`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        agent_id: this.agentId,
        level,
        message,
        ...options
      })
    });
  }
}

// Usage
const monitor = new AgentMonitor(
  'https://your-project.supabase.co',
  'your-anon-key'
);

(async () => {
  await monitor.registerAgent('WebScraper-001', 'web_scraper');

  const taskId = await monitor.createTask('Scrape Product Data', {
    priority: 'high',
    estimated_duration: 600
  });

  await monitor.updateTaskProgress(taskId, 50);
  await monitor.log('info', 'Scraping in progress');
})();
```

---

## Best Practices

### 1. Heartbeat Frequency
Send heartbeats every 30-60 seconds to maintain accurate agent status:

```python
import time
import threading

def heartbeat_worker(monitor):
    while True:
        try:
            monitor.send_heartbeat()
        except Exception as e:
            print(f"Heartbeat failed: {e}")
        time.sleep(30)

# Start heartbeat in background
threading.Thread(target=heartbeat_worker, args=(monitor,), daemon=True).start()
```

### 2. Metrics Collection
Collect and send metrics every 5-10 seconds for smooth real-time visualization:

```python
import psutil
import time

def collect_metrics(monitor):
    while True:
        monitor.send_metrics(
            cpu=psutil.cpu_percent(),
            memory=psutil.virtual_memory().used / (1024 * 1024),
            response_time=get_average_response_time(),
            active_tasks=len(active_task_list),
            completed_tasks=completed_count,
            errors=error_count
        )
        time.sleep(5)
```

### 3. Task Progress Updates
Update task progress at meaningful milestones (every 10-25%):

```python
def process_items(monitor, task_id, items):
    total = len(items)
    for i, item in enumerate(items):
        process_item(item)

        # Update every 10%
        if i % (total // 10) == 0:
            progress = (i / total) * 100
            monitor.update_task_progress(task_id, progress)

    # Mark as completed
    monitor.update_task_progress(task_id, 100, status='completed')
```

### 4. Error Handling
Always wrap API calls in try-except blocks:

```python
def safe_log(monitor, level, message):
    try:
        monitor.log(level, message)
    except Exception as e:
        print(f"Failed to log: {e}")
        # Fallback to local logging
```

### 5. Connection Pooling
For high-frequency updates, use connection pooling:

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=1)
adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)
session.mount('https://', adapter)
```

---

## Troubleshooting

### Issue: 401 Unauthorized
**Solution:** Verify your API key is correct and included in headers.

### Issue: Real-time updates not appearing
**Solution:** Ensure Row Level Security (RLS) policies allow authenticated users to read data.

### Issue: High latency
**Solution:** Reduce update frequency or batch multiple operations.

### Issue: Task progress not updating
**Solution:** Check that task_id is correct and task exists in database.

### Issue: Metrics not showing in charts
**Solution:** Verify metrics are being sent with correct agent_id and valid numeric values.

---

## Rate Limits

- **Heartbeats:** Maximum 1 per second per agent
- **Metrics:** Maximum 1 per second per agent
- **Task Updates:** Maximum 10 per second per agent
- **Logs:** Maximum 100 per minute per agent

---

## Support

For issues or questions:
- Check the dashboard's real-time logs
- Review Supabase project logs
- Verify API key permissions
- Check network connectivity

---

## Security Notes

1. Never commit API keys to version control
2. Use environment variables for sensitive data
3. Use service role key only in secure server environments
4. Implement rate limiting in production
5. Monitor API usage to detect anomalies
