'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Agent,
  AgentId,
  AgentStatus,
  Campaign,
  Post,
  AgentPlan,
  ChatMessage,
  ConnectedAccount,
  OfficeTheme,
  UserActivity,
} from '@/types';
import {
  initialAgents,
  initialCampaigns,
  initialPosts,
  initialActivePlan,
  initialChatMessages,
  initialConnectedAccounts,
} from '@/data/mockData';
import { createClient } from '@/lib/supabase/client';
import { backendApi, BACKEND_URL } from '@/lib/api/backend';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

const defaultEmptyCampaign: Campaign = {
  id: '',
  name: 'No Campaign',
  logo: '✨',
  color: '#6D5EF5',
  status: 'active',
  officeTheme: 'wooden',
  postsPublished: 0,
  totalPosts: 0,
  progressPercent: 0,
  approvalMode: 'manual',
  timezone: 'America/New_York',
};

interface AppContextType {
  // Auth
  user: AuthUser | null;
  isLoadingUser: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;

  // Campaign
  campaigns: Campaign[];
  activeCampaign: Campaign;
  setActiveCampaignId: (id: string) => void;
  createCampaign: (data: { name: string; logo: string; officeTheme: OfficeTheme; color?: string }) => Campaign;
  
  // Agents
  agents: Agent[];
  activeAgent: Agent;
  setActiveAgentId: (id: AgentId) => void;
  updateAgentStatus: (agentId: AgentId, status: AgentStatus, task?: string) => void;
  pauseResumeAgent: (agentId: AgentId) => void;
  
  // Posts
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'campaignId' | 'createdBy' | 'blotatoSynced'>) => Post;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  reschedulePost: (id: string, newDate: string, newDisplay: string) => void;
  unschedulePost: (id: string) => void;
  
  // Chat & Plans
  chatMessages: ChatMessage[];
  activePlan: AgentPlan | null;
  sendMessage: (content: string) => void;
  cancelPlan: () => void;

  // Activities & Template Controls
  activities: UserActivity[];
  logActivity: (actionType: UserActivity['actionType'], title: string, description: string, icon?: string) => void;
  loadDemoTemplate: () => void;
  resetToFresh: () => void;
  
  // Accounts / Settings
  accounts: ConnectedAccount[];
  toggleAccountConnection: (platform: string) => void;
  blotatoApiKey: string;
  setBlotatoApiKey: (key: string) => void;
  
  // Modals & Navigation
  isCreateCampaignOpen: boolean;
  setIsCreateCampaignOpen: (open: boolean) => void;
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
  isImageEditorOpen: boolean;
  setIsImageEditorOpen: (open: boolean) => void;
  editingImage: string;
  setEditingImage: (img: string) => void;
  selectedPostForDetail: Post | null;
  setSelectedPostForDetail: (post: Post | null) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  
  // Notifications
  notificationsCount: number;

  // Production Backend & AI Agent Gateway
  backendStatus: 'online' | 'offline' | 'checking';
  backendUrl: string;
  refreshBackendStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // User workspace state (Clean for new users)
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string>('');
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [activeAgentId, setActiveAgentId] = useState<AgentId>('master');
  const [posts, setPosts] = useState<Post[]>([]);
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(initialConnectedAccounts);
  const [blotatoApiKey, setBlotatoApiKey] = useState('blot_live_a98f41398c2dfa9387e0Gmk=');

  // Modals state
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [editingImage, setEditingImage] = useState('/images/coffee-latte.jpg');
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  // Backend connection status
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const refreshBackendStatus = async () => {
    try {
      const health = await backendApi.getHealth();
      if (health.status === 'healthy' || health.status === 'online') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  const syncBackendAgents = async () => {
    try {
      const liveAgents = await backendApi.getAgents();
      if (Array.isArray(liveAgents) && liveAgents.length > 0) {
        setAgents(prev =>
          prev.map(localAg => {
            const remote = liveAgents.find(r => r.id === localAg.id);
            if (remote) {
              return {
                ...localAg,
                status: (remote.status as AgentStatus) || localAg.status,
                currentTask: remote.current_task || localAg.currentTask,
              };
            }
            return localAg;
          })
        );
        setBackendStatus('online');
      }
    } catch (e) {
      console.warn('Backend agents sync deferred:', e);
    }
  };

  useEffect(() => {
    refreshBackendStatus();
    syncBackendAgents();
    const interval = setInterval(() => {
      syncBackendAgents();
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const supabase = createClient();

  const isSupabaseConfigured =
    typeof process !== 'undefined' &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://mock-project.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'mock-anon-key' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-public-key';

  // 1. Authenticate user (Supabase or Demo fallback)
  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('socialix_demo_user');
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            setUser(null);
          }
        }
      }
      setIsLoadingUser(false);
      return;
    }

    // Exchange OAuth code if present
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (!error && data?.session?.user) {
            const meta = data.session.user.user_metadata || {};
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: meta.full_name || meta.name || data.session.user.email?.split('@')[0] || 'User',
              avatarUrl: meta.avatar_url || meta.picture,
            });
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        });
      }
    }

    // Fetch initial user
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const meta = data.user.user_metadata || {};
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: meta.full_name || meta.name || data.user.email?.split('@')[0] || 'User',
          avatarUrl: meta.avatar_url || meta.picture,
        });
      } else {
        setUser(null);
      }
      setIsLoadingUser(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
          avatarUrl: meta.avatar_url || meta.picture,
        });
      } else {
        setUser(null);
      }
      setIsLoadingUser(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseConfigured]);

  // 2. Load User-Specific Workspace (Storage Persistence)
  useEffect(() => {
    if (!user) {
      setCampaigns([]);
      setActiveCampaignId('');
      setPosts([]);
      setActivePlan(null);
      setChatMessages([]);
      setActivities([]);
      return;
    }

    const key = `socialix_workspace_${user.id}`;
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setCampaigns(data.campaigns || []);
        setActiveCampaignId(data.activeCampaignId || data.campaigns?.[0]?.id || '');
        setPosts(data.posts || []);
        setActivePlan(data.activePlan || null);
        setChatMessages(data.chatMessages || []);
        setActivities(data.activities || []);
        return;
      } catch (e) {
        console.error('Failed to parse saved user workspace', e);
      }
    }

    // Fresh New User Initialization
    const welcomeChat: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'master',
      role: 'assistant',
      content: `Hi ${user.name.split(' ')[0]}! 👋 I'm your Master Agent. I coordinate your AI creative team (Researcher, Creator, Scheduler, and Analyst).\n\nTo get started, tell me what brand or campaign you'd like to launch, or ask me to draft social media posts for you!`,
      timestamp: 'Just now',
    };

    const initialActivity: UserActivity = {
      id: `act-${Date.now()}`,
      actionType: 'campaign_created',
      title: 'Workspace Initialized',
      description: `Welcome ${user.name}! Your autonomous AI Agent Office is ready.`,
      timestamp: 'Just now',
      icon: '✨',
    };

    setCampaigns([]);
    setActiveCampaignId('');
    setPosts([]);
    setActivePlan(null);
    setChatMessages([welcomeChat]);
    setActivities([initialActivity]);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        key,
        JSON.stringify({
          campaigns: [],
          activeCampaignId: '',
          posts: [],
          activePlan: null,
          chatMessages: [welcomeChat],
          activities: [initialActivity],
        })
      );
    }
  }, [user?.id]);

  // Persistence helper
  const persistWorkspace = (updates: {
    campaigns?: Campaign[];
    activeCampaignId?: string;
    posts?: Post[];
    activePlan?: AgentPlan | null;
    chatMessages?: ChatMessage[];
    activities?: UserActivity[];
  }) => {
    if (!user || typeof window === 'undefined') return;
    const key = `socialix_workspace_${user.id}`;
    const existingRaw = localStorage.getItem(key);
    let existing: any = {};
    if (existingRaw) {
      try {
        existing = JSON.parse(existingRaw);
      } catch {}
    }
    const merged = {
      ...existing,
      ...updates,
    };
    localStorage.setItem(key, JSON.stringify(merged));
  };

  const logActivity = (actionType: UserActivity['actionType'], title: string, description: string, icon?: string) => {
    const newAct: UserActivity = {
      id: `act-${Date.now()}`,
      actionType,
      title,
      description,
      timestamp: 'Just now',
      icon: icon || '⚡',
    };
    setActivities(prev => {
      const next = [newAct, ...prev.slice(0, 49)];
      persistWorkspace({ activities: next });
      return next;
    });
  };

  const loadDemoTemplate = () => {
    setCampaigns(initialCampaigns);
    setActiveCampaignId(initialCampaigns[0].id);
    setPosts(initialPosts);
    setActivePlan(initialActivePlan);
    setChatMessages(initialChatMessages);
    const demoAct: UserActivity = {
      id: `act-${Date.now()}`,
      actionType: 'campaign_created',
      title: 'Sample Template Loaded',
      description: 'Populated workspace with Coffee Shop Launch sample campaign & posts',
      timestamp: 'Just now',
      icon: '☕',
    };
    const nextActs = [demoAct, ...activities];
    setActivities(nextActs);
    persistWorkspace({
      campaigns: initialCampaigns,
      activeCampaignId: initialCampaigns[0].id,
      posts: initialPosts,
      activePlan: initialActivePlan,
      chatMessages: initialChatMessages,
      activities: nextActs,
    });
  };

  const resetToFresh = () => {
    setCampaigns([]);
    setActiveCampaignId('');
    setPosts([]);
    setActivePlan(null);
    const freshChat: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'master',
      role: 'assistant',
      content: `Hi ${user?.name ? user.name.split(' ')[0] : 'Creator'}! 👋 Workspace cleared. Ready to start your next campaign!`,
      timestamp: 'Just now',
    };
    setChatMessages([freshChat]);
    const resetAct: UserActivity = {
      id: `act-${Date.now()}`,
      actionType: 'campaign_created',
      title: 'Workspace Reset',
      description: 'Reset workspace to clean slate with 0 posts and 0 campaigns',
      timestamp: 'Just now',
      icon: '✨',
    };
    const nextActs = [resetAct, ...activities];
    setActivities(nextActs);
    persistWorkspace({
      campaigns: [],
      activeCampaignId: '',
      posts: [],
      activePlan: null,
      chatMessages: [freshChat],
      activities: nextActs,
    });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('socialix_demo_user');
      }
      setUser(null);
      window.location.href = '/login';
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/login';
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      const demoUser: AuthUser = {
        id: 'usr-google-demo',
        name: 'Aniket Vadar',
        email: 'aniket.vadar@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('socialix_demo_user', JSON.stringify(demoUser));
      }
      setUser(demoUser);
      window.location.href = '/';
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0] || defaultEmptyCampaign;
  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  // Hotkey listener for CMD+K and CMD+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const createCampaign = (data: { name: string; logo: string; officeTheme: OfficeTheme; color?: string }): Campaign => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: data.name,
      logo: data.logo,
      color: data.color || '#6D5EF5',
      status: 'in_progress',
      officeTheme: data.officeTheme,
      postsPublished: 0,
      totalPosts: 0,
      progressPercent: 0,
      approvalMode: 'manual',
      timezone: 'America/New_York',
    };
    const nextCamps = [...campaigns, newCamp];
    setCampaigns(nextCamps);
    setActiveCampaignId(newCamp.id);
    logActivity('campaign_created', `Campaign created: "${newCamp.name}"`, `Initialized campaign with ${newCamp.officeTheme} office theme.`, '🚀');
    persistWorkspace({ campaigns: nextCamps, activeCampaignId: newCamp.id });

    // Sync with production FastAPI backend
    backendApi.createCampaign({
      name: newCamp.name,
      approval_mode: newCamp.approvalMode,
      timezone: newCamp.timezone,
    }).catch(err => {
      console.warn('Backend campaign sync deferred:', err);
    });

    return newCamp;
  };

  const updateAgentStatus = (agentId: AgentId, status: AgentStatus, task?: string) => {
    setAgents(prev =>
      prev.map(a =>
        a.id === agentId ? { ...a, status, ...(task !== undefined ? { currentTask: task } : {}) } : a
      )
    );
  };

  const pauseResumeAgent = (agentId: AgentId) => {
    setAgents(prev =>
      prev.map(a => {
        if (a.id === agentId) {
          const nextStatus = a.status === 'idle' ? 'working' : 'idle';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const addPost = (postData: Omit<Post, 'id' | 'campaignId' | 'createdBy' | 'blotatoSynced'>): Post => {
    const newPost: Post = {
      ...postData,
      id: `post-${Date.now()}`,
      campaignId: activeCampaign.id || 'camp-default',
      createdBy: 'user',
      blotatoSynced: true,
    };
    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    logActivity('post_created', `Post created: "${newPost.title}"`, `Created post for ${newPost.platform}.`, '📝');
    persistWorkspace({ posts: nextPosts });

    // Sync with production FastAPI backend
    backendApi.createPost({
      caption: newPost.caption,
      title: newPost.title,
      hashtags: newPost.hashtags,
      platforms: [newPost.platform],
      media_url: newPost.mediaUrl,
      status: newPost.status,
      scheduled_at: newPost.scheduledAt,
    }).catch(err => {
      console.warn('Backend post create deferred:', err);
    });

    return newPost;
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    const nextPosts = posts.map(p => (p.id === id ? { ...p, ...updates } : p));
    setPosts(nextPosts);
    persistWorkspace({ posts: nextPosts });

    if (updates.status === 'scheduled' || updates.status === 'published') {
      backendApi.approvePost(id, { caption: updates.caption, scheduled_at: updates.scheduledAt }).catch(() => {});
    }
  };

  const deletePost = (id: string) => {
    const postToDelete = posts.find(p => p.id === id);
    const nextPosts = posts.filter(p => p.id !== id);
    setPosts(nextPosts);
    if (postToDelete) {
      logActivity('post_created', `Post deleted: "${postToDelete.title}"`, 'Removed post from content library.', '🗑️');
    }
    persistWorkspace({ posts: nextPosts });

    backendApi.deletePost(id).catch(() => {});
  };

  const reschedulePost = (id: string, newDate: string, newDisplay: string) => {
    const nextPosts = posts.map(p =>
      p.id === id
        ? { ...p, scheduledAt: newDate, scheduledDisplay: newDisplay, status: 'scheduled' as const }
        : p
    );
    setPosts(nextPosts);
    logActivity('post_scheduled', 'Post Rescheduled', `Updated schedule slot to ${newDisplay}`, '📅');
    persistWorkspace({ posts: nextPosts });

    backendApi.reschedulePost(id, newDate).catch(() => {});
  };

  const unschedulePost = (id: string) => {
    const nextPosts = posts.map(p =>
      p.id === id ? { ...p, status: 'draft' as const, scheduledDisplay: 'Unscheduled draft' } : p
    );
    setPosts(nextPosts);
    persistWorkspace({ posts: nextPosts });
  };

  const cancelPlan = () => {
    if (activePlan) {
      setActivePlan(prev => (prev ? { ...prev, status: 'cancelled' } : null));
      updateAgentStatus('creator', 'idle', 'Plan cancelled by user');
      updateAgentStatus('scheduler', 'idle');
      logActivity('plan_completed', 'Plan Cancelled', `Cancelled ${activePlan.title}`, '⏹️');
      persistWorkspace({ activePlan: null });
    }
  };

  const sendMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextChats = [...chatMessages, userMsg];
    setChatMessages(nextChats);
    updateAgentStatus('master', 'working', 'Analyzing prompt & orchestrating AI agent team...');

    // Attempt starting production run with backend
    try {
      const runRes = await backendApi
        .startRun({
          message: content,
          campaign_id: activeCampaign.id || undefined,
          thread_id: `thread-${activeCampaign.id || 'default'}`,
        })
        .catch(err => {
          console.warn('Backend startRun fell back to local orchestration:', err);
          return null;
        });

      const planNumber = runRes?.plan?.planNumber || Math.floor(Math.random() * 80) + 33;
      const newPlan: AgentPlan = {
        id: runRes?.id || `plan-${planNumber}`,
        title: `Task: ${content.slice(0, 35)}...`,
        planNumber,
        timeAgo: 'Just now',
        status: 'in_progress',
        progress: '0/2 done',
        steps: [
          {
            id: `step-${Date.now()}-1`,
            agentId: 'creator',
            title: `Generate copy & assets for "${content.slice(0, 25)}"`,
            instruction: 'Draft captions, curate trending hashtags, and prepare visual layouts.',
            status: 'running',
            duration: 'In progress',
          },
          {
            id: `step-${Date.now()}-2`,
            agentId: 'scheduler',
            title: 'Compute peak engagement slot & queue via Blotato',
            instruction: 'Select highest reach window for connected accounts.',
            status: 'scheduled',
            subtext: 'Scheduler Agent · waiting on creator draft',
          },
        ],
      };

      setActivePlan(newPlan);
      updateAgentStatus('creator', 'working', `Drafting content for "${content.slice(0, 30)}"`);
      logActivity(
        'plan_started',
        `Plan #${planNumber} Started`,
        `Master Agent coordinated team for "${content.slice(0, 30)}"`,
        '⚡'
      );

      const agentResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'master',
        role: 'assistant',
        content: `Planned:
- Creator Agent is formulating platform-specific captions and asset prompts.
- Scheduler Agent will analyze peak audience engagement slots and sync via Blotato.

I have queued Plan #${planNumber}. You can watch real-time progress on the right office desk or in the Tasks tab!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        plan: newPlan,
      };

      const finalChats = [...nextChats, agentResponse];
      setChatMessages(finalChats);
      updateAgentStatus('master', 'idle', 'Standing by for new instructions');
      persistWorkspace({ chatMessages: finalChats, activePlan: newPlan });

      // If backend provides SSE stream
      if (runRes?.id) {
        backendApi.streamRunEvents(
          runRes.id,
          ev => {
            if (ev.type === 'task_updated') {
              if (ev.agent && ev.agent in { master: 1, researcher: 1, creator: 1, scheduler: 1, analytics: 1 }) {
                updateAgentStatus(ev.agent as AgentId, 'working', ev.payload?.description);
              }
            } else if (ev.type === 'run_completed') {
              updateAgentStatus('creator', 'idle');
              updateAgentStatus('scheduler', 'idle');
            }
          },
          () => {},
          () => {}
        );
      }

      // Step 1: Creator finishes
      setTimeout(() => {
        setActivePlan(current => {
          if (!current || current.status !== 'in_progress') return current;
          const updated: AgentPlan = {
            ...current,
            progress: '1/2 done',
            steps: current.steps.map((st, i) =>
              i === 0
                ? { ...st, status: 'done', duration: 'Completed' }
                : { ...st, status: 'running' }
            ),
          };
          persistWorkspace({ activePlan: updated });
          return updated;
        });
        updateAgentStatus('creator', 'idle', 'Completed drafts');
        updateAgentStatus('scheduler', 'working', 'Computing optimal posting schedule...');

        // Step 2: Scheduler schedules and adds post
        setTimeout(() => {
          setActivePlan(current => {
            if (!current || current.status !== 'in_progress') return current;
            const completed: AgentPlan = {
              ...current,
              status: 'completed',
              progress: '2/2 done',
              steps: current.steps.map(st => ({ ...st, status: 'done', duration: 'Completed' })),
            };
            persistWorkspace({ activePlan: completed });
            return completed;
          });
          updateAgentStatus('scheduler', 'idle', 'Scheduled post');

          // Generate real post into content library
          const cleanTitle = content.slice(0, 30).trim();
          const createdPost: Post = {
            id: `post-${Date.now()}`,
            campaignId: activeCampaign.id || 'camp-default',
            title: cleanTitle.length > 0 ? cleanTitle : 'AI Campaign Post',
            caption: `${content}\n\nAutomated via Socialix AI Agent Office.`,
            hashtags: ['#AI', '#SocialMedia', '#Marketing', '#Automation', '#Growth'],
            mediaUrl: '/images/coffee-latte.jpg',
            status: 'pending_approval',
            platform: 'instagram',
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            scheduledDisplay: 'Tomorrow at 10:00 AM',
            createdBy: 'agent',
            blotatoSynced: true,
            engagement: { likes: 0, comments: 0, shares: 0, reach: 0 },
          };

          setPosts(prev => {
            const nextPosts = [createdPost, ...prev];
            persistWorkspace({ posts: nextPosts });
            return nextPosts;
          });

          logActivity(
            'post_created',
            `Draft Generated: "${createdPost.title}"`,
            'Creator Agent drafted a new post ready for review.',
            '🎨'
          );

          // Sync generated post to backend
          backendApi
            .createPost({
              caption: createdPost.caption,
              title: createdPost.title,
              hashtags: createdPost.hashtags,
              platforms: ['instagram'],
              media_url: createdPost.mediaUrl,
              status: 'pending_approval',
              scheduled_at: createdPost.scheduledAt,
            })
            .catch(() => {});
        }, 3500);
      }, 3000);
    } catch (err: any) {
      console.error('Error during agent execution:', err);
      updateAgentStatus('master', 'idle', 'Ready');
    }
  };

  const toggleAccountConnection = (platform: string) => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.platform === platform) {
          const next = !acc.connected;
          return {
            ...acc,
            connected: next,
            checkedAgo: next ? 'Connected just now' : 'Connect in Blotato',
          };
        }
        return acc;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoadingUser,
        signOut,
        signInWithGoogle,
        campaigns,
        activeCampaign,
        setActiveCampaignId,
        createCampaign,
        agents,
        activeAgent,
        setActiveAgentId,
        updateAgentStatus,
        pauseResumeAgent,
        posts,
        addPost,
        updatePost,
        deletePost,
        reschedulePost,
        unschedulePost,
        chatMessages,
        activePlan,
        sendMessage,
        cancelPlan,
        activities,
        logActivity,
        loadDemoTemplate,
        resetToFresh,
        accounts,
        toggleAccountConnection,
        blotatoApiKey,
        setBlotatoApiKey,
        isCreateCampaignOpen,
        setIsCreateCampaignOpen,
        isCreatePostOpen,
        setIsCreatePostOpen,
        isImageEditorOpen,
        setIsImageEditorOpen,
        editingImage,
        setEditingImage,
        selectedPostForDetail,
        setSelectedPostForDetail,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        notificationsCount,
        backendStatus,
        backendUrl: BACKEND_URL,
        refreshBackendStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
