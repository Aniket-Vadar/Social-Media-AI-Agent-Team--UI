export type AgentId = 'master' | 'researcher' | 'creator' | 'scheduler' | 'analytics';

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'waiting_approval' | 'error' | 'done';

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  shortDesc: string;
  description: string;
  color: string;
  badgeBg: string;
  avatar: string;
  status: AgentStatus;
  currentTask?: string;
  taskDuration?: string;
  filesCount?: number;
  deskPosition: {
    top: string;
    left: string;
  };
}

export type OfficeTheme = 'wooden' | 'modern';

export interface Campaign {
  id: string;
  name: string;
  logo: string; // emoji or icon identifier
  color: string;
  status: 'active' | 'in_progress' | 'paused' | 'completed';
  officeTheme: OfficeTheme;
  postsPublished: number;
  totalPosts: number;
  progressPercent: number;
  brandVoice?: string;
  targetAudience?: string;
  approvalMode: 'manual' | 'auto';
  timezone: string;
}

export type PlatformType = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'linkedin';

export type PostStatus = 'draft' | 'pending_approval' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface Post {
  id: string;
  campaignId: string;
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrl: string;
  status: PostStatus;
  platform: PlatformType;
  scheduledAt: string;
  scheduledDisplay: string;
  publishedAt?: string;
  createdBy: 'agent' | 'user';
  blotatoSynced: boolean;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
}

export interface PlanStep {
  id: string;
  agentId: AgentId;
  title: string;
  instruction: string;
  status: 'pending' | 'running' | 'done' | 'failed' | 'scheduled';
  subtext?: string;
  duration?: string;
}

export interface AgentPlan {
  id: string;
  title: string;
  planNumber: number;
  timeAgo: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  steps: PlanStep[];
  progress: string; // e.g. "0/2 done", "2/2 done"
}

export interface ChatMessage {
  id: string;
  sender: AgentId | 'user';
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  plan?: AgentPlan;
  postPreview?: Partial<Post>;
  quickReplies?: string[];
}

export interface ConnectedAccount {
  id: string;
  platform: PlatformType;
  accountHandle: string;
  displayName: string;
  connected: boolean;
  avatarUrl?: string;
  checkedAgo?: string;
}

export interface AnalyticsMetric {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  iconBg: string;
  color: string;
  change?: string;
}

export interface DailyActivityPoint {
  date: string;
  label: string;
  count: number;
  isBusiest?: boolean;
}

export interface EngagementPoint {
  date: string;
  views: number;
  engagement: number;
}
