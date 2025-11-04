const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

class ApiClient {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }>;
  private cacheDuration: number = 30000;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.requestCache = new Map();
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getCacheKey(endpoint: string, options?: RequestInit): string {
    return `${endpoint}-${JSON.stringify(options)}`;
  }

  private getFromCache<T>(key: string): ApiResponse<T> | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.requestCache.set(key, { data, timestamp: Date.now() });
  }

  private async request<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options || {};

    const cacheKey = this.getCacheKey(endpoint, fetchOptions);
    if (fetchOptions.method === 'GET' || !fetchOptions.method) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions?.headers,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status >= 500 && attempt < retries) {
            await this.sleep(retryDelay * Math.pow(2, attempt));
            continue;
          }
          throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        if (fetchOptions.method === 'GET' || !fetchOptions.method) {
          this.setCache(cacheKey, data);
        }

        return data;
      } catch (error: any) {
        lastError = error;

        if (attempt < retries && (error.name === 'TypeError' || error.message.includes('fetch'))) {
          await this.sleep(retryDelay * Math.pow(2, attempt));
          continue;
        }

        if (attempt === retries) {
          break;
        }
      }
    }

    console.error('API Error after retries:', lastError);
    return {
      success: false,
      error: lastError?.message || 'Network error',
    };
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

  async createCampaign(campaignData: any) {
    return this.request('/campaigns/create', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async startCampaign(campaignId: string) {
    return this.request(`/campaigns/${campaignId}/start`, {
      method: 'POST',
    });
  }

  async pauseCampaign(campaignId: string) {
    return this.request(`/campaigns/${campaignId}/pause`, {
      method: 'POST',
    });
  }

  async generateMessage(data: { leadName: string; company?: string; tone: string; context?: string }) {
    return this.request('/messages/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async importLeads(leads: any[]) {
    return this.request('/leads/import', {
      method: 'POST',
      body: JSON.stringify({ leads }),
    });
  }

  async scoreLeads(leadIds: string[]) {
    return this.request('/leads/score', {
      method: 'POST',
      body: JSON.stringify({ leadIds }),
    });
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
