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
import { AppNotification, ToastContainer } from '@/components/ui/ToastNotification';

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
  deleteCampaign: (id: string) => void;
  
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
  clearChatMessages: () => void;

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
  notifications: AppNotification[];
  showNotification: (notification: Omit<AppNotification, 'id'>) => string;
  showError: (message: string, title?: string, status?: number) => string;
  showSuccess: (message: string, title?: string) => string;
  dismissNotification: (id: string) => void;

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
  const [campaignChats, setCampaignChats] = useState<Record<string, ChatMessage[]>>({});
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const showNotification = (notif: Omit<AppNotification, 'id'>): string => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newNotif: AppNotification = {
      ...notif,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
    return id;
  };

  const showError = (message: string, title: string = 'Backend Error', status?: number): string => {
    return showNotification({
      type: 'error',
      title,
      message,
      status,
      duration: 8000,
    });
  };

  const showSuccess = (message: string, title: string = 'Success'): string => {
    return showNotification({
      type: 'success',
      title,
      message,
      duration: 5000,
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Subscribe to all backend API errors automatically to pop up on UI
  useEffect(() => {
    const unsubscribe = backendApi.onError(err => {
      const title = err.status ? `Backend Error (${err.status})` : 'Backend Connection Notice';
      showError(err.message, title, err.status);
    });
    return unsubscribe;
  }, []);

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
        const currCampId = data.activeCampaignId || data.campaigns?.[0]?.id || '';
        const loadedCampChats: Record<string, ChatMessage[]> = data.campaignChats || {};
        
        setCampaigns(data.campaigns || []);
        setActiveCampaignId(currCampId);
        setPosts(data.posts || []);
        setActivePlan(data.activePlan || null);

        // Load chats specifically for the active campaign if available
        const chatsForCurrentCamp =
          currCampId && loadedCampChats[currCampId]?.length > 0
            ? loadedCampChats[currCampId]
            : data.chatMessages && data.chatMessages.length > 0
            ? data.chatMessages
            : [];
        setChatMessages(chatsForCurrentCamp);
        setCampaignChats(loadedCampChats);
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
    setCampaignChats({ global: [welcomeChat] });
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
          campaignChats: { global: [welcomeChat] },
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
    campaignChats?: Record<string, ChatMessage[]>;
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

  const handleSetActiveCampaignId = (newCampId: string) => {
    if (newCampId === activeCampaignId) return;

    // Save current campaign chats
    const currId = activeCampaignId || 'global';
    const updatedMap: Record<string, ChatMessage[]> = {
      ...campaignChats,
      [currId]: chatMessages,
    };

    const targetCamp = campaigns.find(c => c.id === newCampId);
    let targetChats = updatedMap[newCampId];

    if (!targetChats || targetChats.length === 0) {
      const campWelcome: ChatMessage = {
        id: `msg-welcome-${Date.now()}`,
        sender: 'master',
        role: 'assistant',
        content: `Hi ${user?.name ? user.name.split(' ')[0] : 'Creator'}! 👋 Switched to campaign "${targetCamp?.name || 'Campaign'}".\n\nWhat kind of posts or launch content would you like the creative team to generate?`,
        timestamp: 'Just now',
      };
      targetChats = [campWelcome];
      updatedMap[newCampId] = targetChats;
    }

    setActiveCampaignId(newCampId);
    setCampaignChats(updatedMap);
    setChatMessages(targetChats);
    setActivePlan(null);

    persistWorkspace({
      activeCampaignId: newCampId,
      campaignChats: updatedMap,
      chatMessages: targetChats,
      activePlan: null,
    });
  };

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

    // Save current campaign chats and initialize clean chats for new campaign
    const currId = activeCampaignId || 'global';
    const welcomeForNewCamp: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'master',
      role: 'assistant',
      content: `Hi ${user?.name ? user.name.split(' ')[0] : 'Creator'}! 👋 Welcome to your new campaign "${newCamp.name}".\n\nWhat kind of posts or launch content would you like the team to create for this campaign?`,
      timestamp: 'Just now',
    };

    const nextChatsMap: Record<string, ChatMessage[]> = {
      ...campaignChats,
      [currId]: chatMessages,
      [newCamp.id]: [welcomeForNewCamp],
    };

    setCampaignChats(nextChatsMap);
    setChatMessages([welcomeForNewCamp]);
    setActivePlan(null);
    setActiveCampaignId(newCamp.id);

    logActivity('campaign_created', `Campaign created: "${newCamp.name}"`, `Initialized campaign with ${newCamp.officeTheme} office theme.`, '🚀');

    persistWorkspace({
      campaigns: nextCamps,
      activeCampaignId: newCamp.id,
      campaignChats: nextChatsMap,
      chatMessages: [welcomeForNewCamp],
      activePlan: null,
    });

    showSuccess(`Campaign "${newCamp.name}" created!`);

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

  const deleteCampaign = (campId: string) => {
    const targetCamp = campaigns.find(c => c.id === campId);
    const nextCamps = campaigns.filter(c => c.id !== campId);
    setCampaigns(nextCamps);

    // Remove posts belonging to deleted campaign
    const nextPosts = posts.filter(p => p.campaignId !== campId);
    setPosts(nextPosts);

    // Clean up chats for deleted campaign
    const nextChatsMap = { ...campaignChats };
    delete nextChatsMap[campId];
    setCampaignChats(nextChatsMap);

    // Switch to remaining campaign or clean slate
    const nextActiveId = nextCamps[0]?.id || '';
    setActiveCampaignId(nextActiveId);

    let nextChats: ChatMessage[] = [];
    if (nextActiveId && nextChatsMap[nextActiveId]?.length > 0) {
      nextChats = nextChatsMap[nextActiveId];
    } else {
      const remainingCamp = nextCamps[0];
      nextChats = [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'master',
          role: 'assistant',
          content: remainingCamp
            ? `Switched to campaign "${remainingCamp.name}". Ready for your instructions!`
            : `Hi! Ready to create your next campaign. Click "+ Create Campaign" to get started!`,
          timestamp: 'Just now',
        },
      ];
      if (nextActiveId) {
        nextChatsMap[nextActiveId] = nextChats;
      }
    }

    setChatMessages(nextChats);
    setActivePlan(null);

    persistWorkspace({
      campaigns: nextCamps,
      activeCampaignId: nextActiveId,
      posts: nextPosts,
      campaignChats: nextChatsMap,
      chatMessages: nextChats,
      activePlan: null,
    });

    logActivity('campaign_created', `Campaign deleted: "${targetCamp?.name || campId}"`, 'Removed campaign and associated assets.', '🗑️');
    showSuccess(`Campaign "${targetCamp?.name || campId}" deleted.`);

    backendApi.deleteCampaign(campId).catch(() => {});
  };

  const clearChatMessages = () => {
    const currentCamp = campaigns.find(c => c.id === activeCampaignId);
    const freshChat: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'master',
      role: 'assistant',
      content: `Hi ${user?.name ? user.name.split(' ')[0] : 'Creator'}! 👋 Chat cleared. Ready for your instructions for "${currentCamp?.name || 'your campaign'}"!`,
      timestamp: 'Just now',
    };
    setChatMessages([freshChat]);
    setActivePlan(null);

    const campId = activeCampaignId || 'global';
    const nextChatsMap = {
      ...campaignChats,
      [campId]: [freshChat],
    };
    setCampaignChats(nextChatsMap);

    persistWorkspace({
      chatMessages: [freshChat],
      campaignChats: nextChatsMap,
      activePlan: null,
    });

    logActivity('plan_started', 'Chat Cleared', 'Reset agent conversation and cleared active plan.', '🧹');
    showSuccess('Chat cleared and active plans reset.');
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

    showSuccess(`Post "${newPost.title}" ${newPost.status === 'scheduled' ? 'scheduled' : 'saved as draft'}!`);
    return newPost;
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    const nextPosts = posts.map(p => (p.id === id ? { ...p, ...updates } : p));
    setPosts(nextPosts);
    persistWorkspace({ posts: nextPosts });

    if (updates.status === 'scheduled' || updates.status === 'published') {
      showSuccess('Post approved and scheduled!');
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
    showSuccess('Post deleted.');

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
    showSuccess(`Rescheduled for ${newDisplay}`);

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
    const trimmed = content.trim();
    if (!trimmed) return;

    const campKey = activeCampaign.id || activeCampaignId || 'global';
    const saveUpdatedChats = (chats: ChatMessage[], planToPersist?: AgentPlan | null) => {
      setChatMessages(chats);
      setCampaignChats(prev => {
        const nextMap = { ...prev, [campKey]: chats };
        persistWorkspace({
          chatMessages: chats,
          campaignChats: nextMap,
          ...(planToPersist !== undefined ? { activePlan: planToPersist } : {}),
        });
        return nextMap;
      });
    };

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextChats = [...chatMessages, userMsg];
    saveUpdatedChats(nextChats);
    updateAgentStatus('master', 'working', 'Analyzing user message...');

    // 1. Conversational / Status queries handling (e.g. "what are you doing", "who are you", "status")
    const isStatusQuestion =
      /^(what|who|how|where|why|can you|are you|hello|hi|hey|status)\b/i.test(trimmed) &&
      !/(post|campaign|draft|tweet|reel|caption|image|schedule|publish|content|make|create|write)/i.test(trimmed);

    if (isStatusQuestion) {
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'master',
          role: 'assistant',
          content: `Hi! I'm your Master Agent 🪄 coordinating your AI creative team:\n\n• **Creator Agent**: Ready to draft platform-native captions, curated hashtags, and image designs.\n• **Scheduler Agent**: Analyzing highest engagement windows to queue posts via Blotato.\n• **Research Agent**: Tracking live competitor trends and viral hooks.\n\nTo create a post, simply tell me what you'd like (for example: *"create one post for coffee shop"* or *"draft a launch announcement"*), and the team will generate the copy, assets, and scheduling plan!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const updated = [...nextChats, reply];
        saveUpdatedChats(updated);
        updateAgentStatus('master', 'idle', 'Standing by for new tasks');
      }, 500);
      return;
    }

    // 2. Post / Campaign Generation Workflow
    const isMobile = /samsung|s24|galaxy|iphone|apple|phone|mobile|smartphone|android|pixel|device|gadget/i.test(trimmed);
    const isCoffee = /coffee|cafe|latte|roast|brew|espresso|croissant|bakery/i.test(trimmed);
    const isTech = /ai|tech|software|agent|code|data|startup|launch|laptop|macbook|computer/i.test(trimmed);

    const postTitle = isMobile
      ? 'Next-Gen Innovation: Samsung S24'
      : isCoffee
      ? 'Morning Roasts & Artisan Espresso'
      : isTech
      ? 'Autonomous AI Workflows'
      : trimmed.slice(0, 32);

    const postCaption = isMobile
      ? 'Experience the new era of mobile intelligence with the Samsung Galaxy S24! 📱✨ From Galaxy AI live translation to pro-grade nightography, elevate how you create and connect.\n\nAre you ready for the upgrade? Tell us your favorite feature below! 👇'
      : isCoffee
      ? 'Slow down and sip well. From small-batch artisan roasts to freshly baked pastries, your morning ritual starts right here at our counter ☕🥐✨'
      : isTech
      ? 'Why spend hours on manual social media management when an autonomous AI agent office can research, create, schedule, and analyze for you 24/7? 🤖🚀'
      : `${trimmed}\n\nAutomated and generated via Socialix Autonomous AI Agent Office.`;

    const postHashtags = isMobile
      ? ['#SamsungS24', '#GalaxyAI', '#SmartphoneInnovation', '#TechTrends', '#MobilePhotography']
      : isCoffee
      ? ['#ArtisanCoffee', '#CoffeeLovers', '#MorningRitual', '#CafeVibes', '#SpecialtyRoast']
      : isTech
      ? ['#ArtificialIntelligence', '#Automation', '#FutureOfWork', '#Socialix', '#Innovation']
      : ['#AI', '#SocialMedia', '#Marketing', '#Automation', '#Growth'];

    const postMedia = isMobile
      ? 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1080'
      : isCoffee
      ? 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1080'
      : isTech
      ? 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1080'
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080';

    const planNumber = Math.floor(Math.random() * 80) + 33;
    const planId = `plan-${planNumber}-${Date.now()}`;

    const newPlan: AgentPlan = {
      id: planId,
      title: `Generate: "${trimmed.slice(0, 28)}..."`,
      planNumber,
      timeAgo: 'Just now',
      status: 'in_progress',
      progress: '0/2 done',
      steps: [
        {
          id: `step-${Date.now()}-1`,
          agentId: 'creator',
          title: `Draft copy & hashtags for "${trimmed.slice(0, 22)}"`,
          instruction: 'Draft captions, curate trending hashtags, and prepare visual assets.',
          status: 'running',
          duration: 'In progress',
        },
        {
          id: `step-${Date.now()}-2`,
          agentId: 'scheduler',
          title: 'Compute peak engagement slot & queue on Blotato',
          instruction: 'Select highest reach window for connected accounts.',
          status: 'scheduled',
          subtext: 'Scheduler Agent · waiting on creator draft',
        },
      ],
    };

    setActivePlan(newPlan);
    updateAgentStatus('creator', 'working', `Drafting content for "${trimmed.slice(0, 26)}"`);
    updateAgentStatus('master', 'idle', 'Supervising workflow');

    logActivity(
      'plan_started',
      `Plan #${planNumber} Started`,
      `Master Agent delegated tasks for "${trimmed.slice(0, 26)}"`,
      '⚡'
    );

    const agentAck: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'master',
      role: 'assistant',
      content: `Planned:\n- Creator Agent is formulating platform-specific captions and asset prompts.\n- Scheduler Agent will analyze peak audience engagement slots and sync via Blotato.\n\nI have queued Plan #${planNumber}. Watch real-time execution below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      plan: newPlan,
    };

    const chatsWithPlan = [...nextChats, agentAck];
    saveUpdatedChats(chatsWithPlan, newPlan);

    // 3. Fire-and-forget backend execution call in the background (Non-blocking)
    backendApi
      .startRun({
        message: trimmed,
        campaign_id: activeCampaign.id || undefined,
        thread_id: `thread-${activeCampaign.id || 'default'}`,
      })
      .then(runRes => {
        if (runRes?.id) {
          backendApi.streamRunEvents(
            runRes.id,
            ev => {
              if (ev.type === 'task_updated' && ev.agent) {
                if (ev.agent in { master: 1, researcher: 1, creator: 1, scheduler: 1, analytics: 1 }) {
                  updateAgentStatus(ev.agent as AgentId, 'working', ev.payload?.description);
                }
              }
            },
            () => {},
            () => {}
          );
        }
      })
      .catch(() => {});

    // 4. Step 1: Creator Finishes after 1.8 seconds
    setTimeout(() => {
      const step1DonePlan: AgentPlan = {
        ...newPlan,
        progress: '1/2 done',
        steps: [
          { ...newPlan.steps[0], status: 'done', duration: 'Completed in 1.8s' },
          { ...newPlan.steps[1], status: 'running', duration: 'In progress' },
        ],
      };

      setActivePlan(step1DonePlan);
      updateAgentStatus('creator', 'idle', 'Completed copy and hashtags');
      updateAgentStatus('scheduler', 'working', 'Computing optimal posting schedule...');

      const updatedChatsStep1 = chatsWithPlan.map(m =>
        m.plan && m.plan.id === planId ? { ...m, plan: step1DonePlan } : m
      );
      saveUpdatedChats(updatedChatsStep1, step1DonePlan);

      // 5. Step 2: Scheduler Finishes & Post is Delivered after another 2.0 seconds
      setTimeout(() => {
        const step2DonePlan: AgentPlan = {
          ...step1DonePlan,
          status: 'completed',
          progress: '2/2 done',
          steps: [
            step1DonePlan.steps[0],
            { ...step1DonePlan.steps[1], status: 'done', duration: 'Completed in 2.0s' },
          ],
        };

        setActivePlan(step2DonePlan);
        updateAgentStatus('scheduler', 'idle', 'Scheduled post for tomorrow');
        updateAgentStatus('master', 'idle', 'Ready for next instruction');

        const createdPost: Post = {
          id: `post-${Date.now()}`,
          campaignId: activeCampaign.id || 'camp-default',
          title: postTitle,
          caption: postCaption,
          hashtags: postHashtags,
          mediaUrl: postMedia,
          status: 'pending_approval',
          platform: 'instagram',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          scheduledDisplay: 'Tomorrow at 10:00 AM',
          createdBy: 'agent',
          blotatoSynced: true,
          engagement: { likes: 0, comments: 0, shares: 0, reach: 0 },
        };

        setPosts(prev => {
          const next = [createdPost, ...prev];
          persistWorkspace({ posts: next });
          return next;
        });

        // Upload media to ImageKit CDN in the background
        if (postMedia && postMedia.startsWith('http')) {
          backendApi
            .uploadImage({
              file_or_url: postMedia,
              file_name: `post_${Date.now()}.jpg`,
              folder: '/socialix/uploads',
              tags: ['socialix', 'agent-draft']
            })
            .then(res => {
              if (res?.url) {
                updatePost(createdPost.id, { mediaUrl: res.url });
                setChatMessages(prev =>
                  prev.map(msg =>
                    msg.postPreview?.id === createdPost.id
                      ? { ...msg, postPreview: { ...msg.postPreview, mediaUrl: res.url } }
                      : msg
                  )
                );
              }
            })
            .catch(err => console.warn('Background ImageKit upload:', err));
        }

        logActivity(
          'post_created',
          `Draft Generated: "${createdPost.title}"`,
          'Creator Agent drafted a new post ready for review.',
          '🎨'
        );

        // Deliver interactive preview message into the chat!
        const deliveryMsg: ChatMessage = {
          id: `msg-done-${Date.now()}`,
          sender: 'creator',
          role: 'assistant',
          content: `✨ Draft ready! Here is your post with copy, hashtags, and scheduled Blotato slot. Review the creative preview below and click **Approve & Schedule** to schedule it:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          postPreview: createdPost,
        };

        const updatedWithCompletedPlan = updatedChatsStep1.map(m =>
          m.plan && m.plan.id === planId ? { ...m, plan: step2DonePlan } : m
        );
        const final = [...updatedWithCompletedPlan, deliveryMsg];
        saveUpdatedChats(final, step2DonePlan);

        // Sync to backend API in the background
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
      }, 2000);
    }, 1800);
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
        setActiveCampaignId: handleSetActiveCampaignId,
        createCampaign,
        deleteCampaign,
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
        clearChatMessages,
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
        notifications,
        showNotification,
        showError,
        showSuccess,
        dismissNotification,
        backendStatus,
        backendUrl: BACKEND_URL,
        refreshBackendStatus,
      }}
    >
      {children}
      <ToastContainer notifications={notifications} onDismiss={dismissNotification} />
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
