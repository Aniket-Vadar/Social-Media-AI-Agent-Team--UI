/**
 * Socialix AI Agent Office - Backend API Client
 * Connects frontend UI to deployed FastAPI + LangGraph agent service at:
 * https://social-media-ai-agent-team-backend.onrender.com
 */

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://social-media-ai-agent-team-backend.onrender.com';

export const BACKEND_DOCS_URL =
  process.env.NEXT_PUBLIC_BACKEND_DOCS_URL || `${BACKEND_URL}/docs`;

export interface ApiAgentStatus {
  id: 'master' | 'researcher' | 'creator' | 'scheduler' | 'analytics';
  name: string;
  role: string;
  status: 'idle' | 'working' | 'thinking' | 'waiting_approval' | 'error' | 'done';
  current_task?: string;
  avatar?: string;
  color?: string;
}

export interface ApiAgentRun {
  id: string;
  workspace_id?: string;
  campaign_id?: string;
  thread_id?: string;
  user_message: string;
  status: 'running' | 'completed' | 'interrupted' | 'failed';
  plan?: {
    id?: string;
    title?: string;
    planNumber?: number;
    steps?: Array<{
      id: string;
      agentId: string;
      title: string;
      instruction: string;
      status: 'pending' | 'running' | 'done' | 'failed' | 'scheduled';
      subtext?: string;
      duration?: string;
    }>;
    progress?: string;
  };
  tokens_in?: number;
  tokens_out?: number;
  cost_usd?: number;
  started_at?: string;
  finished_at?: string;
}

export interface ApiCampaign {
  id: string;
  workspace_id?: string;
  name: string;
  goal?: string;
  brand_voice?: Record<string, any>;
  audience?: string;
  timezone?: string;
  approval_mode?: 'manual' | 'auto';
  status?: string;
  logo?: string;
  color?: string;
  posts_published?: number;
  total_posts?: number;
  progress_percent?: number;
  created_at?: string;
}

export interface ApiPost {
  id: string;
  workspace_id?: string;
  campaign_id: string;
  title?: string;
  caption: string;
  hashtags?: string[];
  status: 'draft' | 'pending_approval' | 'scheduled' | 'publishing' | 'published' | 'failed';
  media_url?: string;
  scheduled_at?: string;
  published_at?: string;
  created_by?: 'agent' | 'user';
  agent_run_id?: string;
  rejection_feedback?: string;
  targets?: Array<{
    id: string;
    platform: string;
    status: string;
    published_url?: string;
  }>;
}

export interface ApiSocialAccount {
  id: string;
  workspace_id?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'x' | 'linkedin';
  display_name: string;
  handle?: string;
  avatar_url?: string;
  blotato_account_id: string;
  status: string;
  connected_at: string;
}

export interface ApiAnalyticsDashboard {
  kpis?: {
    posts_this_week?: number;
    scheduled_posts?: number;
    published_posts?: number;
    completion_rate_percent?: number;
    engagement_rate?: number;
    impressions?: number;
    reach?: number;
    follower_growth?: number;
    total_reach?: number;
    total_reach_change?: string;
    avg_engagement_rate?: number;
    engagement_rate_change?: string;
    active_posts?: number;
    agent_tasks_completed?: number;
  };
  timeseries?: Array<{
    date: string;
    impressions?: number;
    engagement?: number;
    clicks?: number;
  }>;
  insights?: Array<{
    id?: string;
    agent?: string;
    title?: string;
    summary?: string;
    recommendation?: string;
    recommendations?: string[];
    impact_score?: 'high' | 'medium' | 'low';
    impact?: 'high' | 'medium' | 'low';
    category?: string;
    created_at?: string;
  }>;
}

export interface ImageKitAuth {
  token: string;
  expire: number;
  signature: string;
}

export interface RunEventPayload {
  runId: string;
  seq?: number;
  type:
    | 'run_started'
    | 'node_started'
    | 'token'
    | 'task_updated'
    | 'approval_required'
    | 'run_completed'
    | 'run_failed';
  agent?: string;
  payload?: any;
  ts?: string;
}

export interface ApiErrorEvent {
  message: string;
  status?: number;
  endpoint?: string;
  details?: any;
}

export type ApiErrorListener = (error: ApiErrorEvent) => void;

class BackendApiClient {
  private customBaseUrl?: string;
  private errorListeners: ApiErrorListener[] = [];

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.customBaseUrl = baseUrl.replace(/\/+$/, '');
    }
  }

  public getBaseUrl(): string {
    if (this.customBaseUrl) return this.customBaseUrl;
    if (typeof window !== 'undefined') {
      // In the browser, route through the Next.js same-origin API proxy to completely eliminate CORS & adblocker errors
      return '/api/backend';
    }
    return (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://social-media-ai-agent-team-backend.onrender.com').replace(/\/+$/, '');
  }

  public onError(listener: ApiErrorListener): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  public notifyError(error: ApiErrorEvent) {
    this.errorListeners.forEach(fn => {
      try {
        fn(error);
      } catch (e) {
        console.error('Error listener threw an error', e);
      }
    });
  }

  private getHeaders(customHeaders: Record<string, string> = {}) {
    let workspaceId = '00000000-0000-0000-0000-000000000001';
    let userId = '00000000-0000-0000-0000-000000000001';

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('socialix_demo_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u.id) userId = u.id;
        }
        const activeCamp = localStorage.getItem('socialix_active_campaign_id');
        if (activeCamp) {
          customHeaders['X-Campaign-Id'] = activeCamp;
        }
      } catch {}
    }

    return {
      'Content-Type': 'application/json',
      'X-Workspace-Id': workspaceId,
      'X-User-Id': userId,
      ...customHeaders,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const activeBaseUrl = this.getBaseUrl();
    let url = `${activeBaseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = this.getHeaders((options.headers as Record<string, string>) || {});

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      let response: Response;
      try {
        response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });
      } catch (fetchErr) {
        // Fallback to direct backend URL if proxy fails or in case of local network variance
        if (activeBaseUrl === '/api/backend') {
          const directUrl = `https://social-media-ai-agent-team-backend.onrender.com${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
          response = await fetch(directUrl, {
            ...options,
            headers,
            signal: controller.signal,
          });
        } else {
          throw fetchErr;
        }
      }

      clearTimeout(timeout);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          (typeof data?.detail === 'string' ? data.detail : null) ||
          data?.error?.message ||
          (data?.detail && Array.isArray(data.detail) ? data.detail.map((d: any) => d.msg || d).join(', ') : null) ||
          `API error ${response.status}: ${response.statusText || 'Request failed'}`;

        const errorObj: ApiErrorEvent = {
          message: errorMsg,
          status: response.status,
          endpoint,
          details: data,
        };
        this.notifyError(errorObj);
        const err = new Error(errorMsg) as any;
        err.status = response.status;
        err.alreadyNotified = true;
        throw err;
      }

      // Backend wraps responses in { success: true, data: ... } or returns directly
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return data.data as T;
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeout);
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout
        ? 'Backend request timed out (Render service may be waking up, please retry)'
        : (err.message || 'Network error connecting to backend service');

      if (!err.alreadyNotified) {
        this.notifyError({
          message: errorMsg,
          status: isTimeout ? 504 : 0,
          endpoint,
        });
      }
      throw err;
    }
  }

  // ==========================================
  // Health & Diagnostics
  // ==========================================
  async getHealth(): Promise<{ status: string; service: string; version: string; environment?: string }> {
    try {
      const activeBase = this.getBaseUrl();
      const res = await fetch(`${activeBase}/health`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Health status ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return {
        status: 'unreachable',
        service: 'Socialix Backend',
        version: '1.0.0',
        environment: e.message || 'offline',
      };
    }
  }

  // ==========================================
  // AI Agents & Runs
  // ==========================================
  async getAgents(): Promise<ApiAgentStatus[]> {
    return this.request<ApiAgentStatus[]>('/api/v1/agents');
  }

  async getAgent(agentId: string): Promise<ApiAgentStatus> {
    return this.request<ApiAgentStatus>(`/api/v1/agents/${agentId}`);
  }

  async getThreadMessages(threadId: string): Promise<any[]> {
    return this.request<any[]>(`/api/v1/agents/threads/${threadId}/messages`);
  }

  async startRun(params: {
    message: string;
    campaign_id?: string;
    thread_id?: string;
  }): Promise<ApiAgentRun> {
    return this.request<ApiAgentRun>('/api/v1/runs', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async resumeRun(runId: string, payload: {
    approved_post_ids?: string[];
    rejected_posts?: Array<{ id: string; feedback: string }>;
    edited_posts?: Array<Record<string, any>>;
  }): Promise<ApiAgentRun> {
    return this.request<ApiAgentRun>(`/api/v1/runs/${runId}/resume`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Listen to real-time agent execution stream via Server-Sent Events (SSE)
   */
  streamRunEvents(
    runId: string,
    onEvent: (event: RunEventPayload) => void,
    onError?: (error: any) => void,
    onComplete?: () => void
  ): () => void {
    const sseUrl = `${this.getBaseUrl()}/api/v1/runs/${runId}/events`;
    
    // In browser, create native EventSource
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      const eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          onEvent(parsed);
          if (parsed.type === 'run_completed' || parsed.type === 'run_failed') {
            eventSource.close();
            onComplete?.();
          }
        } catch (err) {
          console.warn('Failed to parse SSE event data', err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn('EventSource error or closed', err);
        eventSource.close();
        onError?.(err);
      };

      return () => {
        eventSource.close();
      };
    }

    return () => {};
  }

  // ==========================================
  // Campaigns
  // ==========================================
  async getCampaigns(): Promise<ApiCampaign[]> {
    return this.request<ApiCampaign[]>('/api/v1/campaigns');
  }

  async createCampaign(data: {
    name: string;
    goal?: string;
    brand_voice?: Record<string, any>;
    audience?: string;
    timezone?: string;
    approval_mode?: 'manual' | 'auto';
  }): Promise<ApiCampaign> {
    return this.request<ApiCampaign>('/api/v1/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(campaignId: string, updates: Partial<ApiCampaign>): Promise<ApiCampaign> {
    return this.request<ApiCampaign>(`/api/v1/campaigns/${campaignId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCampaign(campaignId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/v1/campaigns/${campaignId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // Posts & Approvals
  // ==========================================
  async getPosts(filters?: { status?: string; platform?: string; limit?: number }): Promise<ApiPost[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<ApiPost[]>(`/api/v1/posts${query}`);
  }

  async createPost(data: {
    caption: string;
    title?: string;
    hashtags?: string[];
    platforms?: string[];
    media_url?: string;
    scheduled_at?: string;
    status?: string;
  }): Promise<ApiPost> {
    const sanitizedData = {
      ...data,
      title: data.title
        ? data.title.length > 150
          ? `${data.title.slice(0, 147).trim()}...`
          : data.title.trim()
        : undefined,
    };
    return this.request<ApiPost>('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  }

  async approvePost(postId: string, edits?: { caption?: string; scheduled_at?: string }): Promise<ApiPost> {
    return this.request<ApiPost>(`/api/v1/posts/${postId}/approve`, {
      method: 'POST',
      body: JSON.stringify(edits || {}),
    });
  }

  async rejectPost(postId: string, feedback: string): Promise<ApiPost> {
    return this.request<ApiPost>(`/api/v1/posts/${postId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  async reschedulePost(postId: string, scheduledAt: string): Promise<ApiPost> {
    return this.request<ApiPost>(`/api/v1/posts/${postId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduled_at: scheduledAt }),
    });
  }

  async deletePost(postId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/v1/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // Social Accounts & Blotato
  // ==========================================
  async getSocialAccounts(): Promise<ApiSocialAccount[]> {
    return this.request<ApiSocialAccount[]>('/api/v1/social-accounts');
  }

  async connectSocialAccount(data: {
    platform: string;
    display_name: string;
    blotato_account_id: string;
    handle?: string;
    avatar_url?: string;
  }): Promise<ApiSocialAccount> {
    return this.request<ApiSocialAccount>('/api/v1/social-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async disconnectSocialAccount(accountId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/v1/social-accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // Calendar & Analytics
  // ==========================================
  async getCalendarEvents(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/api/v1/calendar/events${query}`);
  }

  async getAnalyticsDashboard(timeframe: string = '7d'): Promise<ApiAnalyticsDashboard> {
    return this.request<ApiAnalyticsDashboard>(`/api/v1/analytics/dashboard?timeframe=${timeframe}`);
  }

  // ==========================================
  // Media & ImageKit
  // ==========================================
  async getImageKitAuth(): Promise<ImageKitAuth> {
    return this.request<ImageKitAuth>('/api/v1/media/imagekit-auth', {
      method: 'POST',
    });
  }

  async uploadImage(params: {
    file_or_url: string;
    file_name?: string;
    folder?: string;
    tags?: string[];
    post_id?: string;
  }): Promise<{ url: string; file_id: string; thumbnail_url?: string; variants?: Record<string, string> }> {
    return this.request<{ url: string; file_id: string; thumbnail_url?: string; variants?: Record<string, string> }>(
      '/api/v1/media/upload',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  }

  async transformImage(params: {
    image_url: string;
    width?: number;
    height?: number;
    crop_mode?: string;
  }): Promise<{ transformed_url: string }> {
    return this.request<{ transformed_url: string }>('/api/v1/media/transform', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async aiEditImage(params: {
    prompt: string;
    image_url: string;
    mask_url?: string;
  }): Promise<{ result_url: string }> {
    return this.request<{ result_url: string }>('/api/v1/media/ai-edit', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const backendApi = new BackendApiClient();

