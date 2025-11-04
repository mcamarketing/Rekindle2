// API Client for Backend Communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // Agents
  async getAgents() {
    return this.request('/agents');
  }

  async getAgent(id: string) {
    return this.request(`/agents/${id}`);
  }

  async getAgentMetrics(id: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/agents/${id}/metrics${params}`);
  }

  // Metrics
  async getMetrics(hours?: number) {
    const params = hours ? `?hours=${hours}` : '';
    return this.request(`/metrics${params}`);
  }

  // Tasks
  async getTasks(filters?: { agent_id?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Alerts
  async getAlerts(isResolved?: boolean) {
    const params = isResolved !== undefined ? `?is_resolved=${isResolved}` : '';
    return this.request(`/alerts${params}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Health check function
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    console.log('Backend not available, using direct Supabase connection');
    return false;
  }
}
