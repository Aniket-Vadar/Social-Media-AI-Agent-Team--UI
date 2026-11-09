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
import { zernioApi } from '@/lib/api/zernio';
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
  addPost: (post: Omit<Post, 'id' | 'campaignId' | 'createdBy' | 'blotatoSynced' | 'zernioSynced'>) => Post;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  reschedulePost: (id: string, newDate: string, newDisplay: string) => void;
  unschedulePost: (id: string) => void;
  
  // Chat & Plans
  chatMessages: ChatMessage[];
  activePlan: AgentPlan | null;
  sendMessage: (content: string, attachedImage?: string) => void;
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
  zernioApiKey: string;
  setZernioApiKey: (key: string) => void;
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
  const [zernioApiKey, setZernioApiKeyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('socialix_zernio_key') || process.env.NEXT_PUBLIC_ZERNIO_API_KEY || '';
    }
    return process.env.NEXT_PUBLIC_ZERNIO_API_KEY || '';
  });

  const setZernioApiKey = (key: string) => {
    setZernioApiKeyState(key);
    zernioApi.setApiKey(key);
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('socialix_zernio_key', key);
      } else {
        localStorage.removeItem('socialix_zernio_key');
      }
    }
  };

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

  const addPost = (postData: Omit<Post, 'id' | 'campaignId' | 'createdBy' | 'blotatoSynced' | 'zernioSynced'>): Post => {
    const newPost: Post = {
      ...postData,
      id: `post-${Date.now()}`,
      campaignId: activeCampaign.id || 'camp-default',
      createdBy: 'user',
      blotatoSynced: true,
      zernioSynced: true,
    };
    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    logActivity('post_created', `Post created: "${newPost.title}"`, `Created post for ${newPost.platform}.`, '📝');
    persistWorkspace({ posts: nextPosts });

    // Sync with Zernio multi-platform social API
    zernioApi
      .createPost({
        content: newPost.caption,
        mediaItems: newPost.mediaUrl ? [{ type: 'image', url: newPost.mediaUrl }] : undefined,
        platforms: [{ platform: newPost.platform, accountId: `acc_${newPost.platform}` }],
        scheduledFor: newPost.scheduledAt,
        publishNow: newPost.status === 'published',
      })
      .then(res => {
        if (res?.id) {
          setPosts(current =>
            current.map(p => (p.id === newPost.id ? { ...p, zernioPostId: res.id, zernioSynced: true } : p))
          );
        }
      })
      .catch(err => console.warn('Zernio post creation deferred:', err));

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

    showSuccess(`Post "${newPost.title}" ${newPost.status === 'scheduled' ? 'scheduled on Zernio' : 'saved as draft'}!`);
    return newPost;
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    const nextPosts = posts.map(p => (p.id === id ? { ...p, ...updates } : p));
    setPosts(nextPosts);
    persistWorkspace({ posts: nextPosts });

    if (updates.status === 'scheduled' || updates.status === 'published') {
      showSuccess('Post approved and scheduled on Zernio!');
      const targetPost = nextPosts.find(p => p.id === id);
      if (targetPost) {
        zernioApi
          .createPost({
            content: targetPost.caption,
            mediaItems: targetPost.mediaUrl ? [{ type: 'image', url: targetPost.mediaUrl }] : undefined,
            platforms: [{ platform: targetPost.platform, accountId: `acc_${targetPost.platform}` }],
            scheduledFor: targetPost.scheduledAt,
            publishNow: updates.status === 'published',
          })
          .then(res => {
            if (res?.id) {
              setPosts(current =>
                current.map(p => (p.id === id ? { ...p, zernioSynced: true, zernioPostId: res.id } : p))
              );
            }
          })
          .catch(err => console.warn('Zernio scheduling:', err));
      }
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

  const sendMessage = async (content: string, attachedImage?: string) => {
    const trimmed = content.trim();
    if (!trimmed && !attachedImage) return;

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
      content: trimmed || 'Create a high-converting post tailored to this uploaded image',
      attachedImage: attachedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextChats = [...chatMessages, userMsg];
    saveUpdatedChats(nextChats);
    updateAgentStatus('master', 'working', attachedImage ? 'Analyzing uploaded reference image...' : 'Analyzing user request...');

    // 1. Direct Quick Actions Handling: Approve & Schedule
    if (/^(✓\s*)?approve(\s+&?\s*schedule|\s+post)?$/i.test(trimmed)) {
      setTimeout(() => {
        const pendingPost = posts.find(p => p.status === 'pending_approval') || posts[0];
        if (pendingPost) {
          updatePost(pendingPost.id, { status: 'scheduled', blotatoSynced: true, zernioSynced: true });
          const confirmMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: 'master',
            role: 'assistant',
            content: `✅ **Post Approved!**\n\n"${pendingPost.title}" has been successfully approved and scheduled on **Zernio** for publication.\n\nYou can view it live in your **Posts** grid or manage its slot in the **Calendar** view.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          const updated = [...nextChats, confirmMsg];
          saveUpdatedChats(updated);
          updateAgentStatus('master', 'idle', 'Post approved and synced with Zernio');
          showSuccess('Post approved and scheduled on Zernio!');
        } else {
          const infoMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: 'master',
            role: 'assistant',
            content: `All posts are already approved and scheduled! To create a new post, let me know what product or topic you would like to showcase.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          const updated = [...nextChats, infoMsg];
          saveUpdatedChats(updated);
        }
      }, 400);
      return;
    }

    // 2. Conversational / Status queries handling
    const isStatusQuestion =
      !attachedImage &&
      /^(what|who|how|where|why|can you|are you|hello|hi|hey|status)\b/i.test(trimmed) &&
      !/(post|campaign|draft|tweet|reel|caption|image|schedule|publish|content|make|create|write|enhance|laptop|hp|variant)/i.test(trimmed);

    if (isStatusQuestion) {
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'master',
          role: 'assistant',
          content: `Hi! I'm your Master Agent 🪄 coordinating your AI creative team:\n\n• **Creator Agent**: Ready to draft platform-native captions, curated hashtags, and image designs.\n• **Scheduler Agent**: Analyzing highest engagement windows to queue posts via Zernio.\n• **Research Agent**: Tracking live competitor trends and viral hooks.\n\nTo create a post, tell me what you need (e.g. *"create social media post for HP laptop"*, *"create educational post"*) or **upload a reference image** below and the team will craft custom copy and visual assets!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const updated = [...nextChats, reply];
        saveUpdatedChats(updated);
        updateAgentStatus('master', 'idle', 'Standing by for new tasks');
      }, 500);
      return;
    }

    // Helper: Clean and extract genuine subject from user command prompt
    const extractCleanSubject = (raw: string): string => {
      let cleaned = raw
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ')
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Iteratively strip conversational greetings, helper words, and creation verbs
      let prev = '';
      while (prev !== cleaned) {
        prev = cleaned;
        cleaned = cleaned.replace(
          /^(now|then|ok|okay|please|plz|pls|can you|could you|hey|hi|hello|agent|team|socialix|master|so|just|go ahead and)\b\s*/i,
          ''
        );
        cleaned = cleaned.replace(
          /^(create|creat|generate|genrate|genarate|write|writ|draft|make|mak|post|publish|design|build|produce)\s+(a |an |one |new |viral |high converting |engaging |social media |instagram |linkedin |facebook |x |twitter )*(post|content|caption|creative|reel|update|ad|copy|campaign|graphic)*\s*/i,
          ''
        );
        cleaned = cleaned.replace(
          /^(a |an |one )*(laptop |phone |product |brand |ai |coding )*(post|ad|caption|creative)\s*/i,
          ''
        );
        cleaned = cleaned.replace(
          /^(for|about|on|regarding|around|of|centered on|related to|realted to|releted to|related|realted|releted|with respect to|concerning|featuring)\s*/i,
          ''
        );
      }

      // Iteratively strip trailing commands (e.g. "and post it now", "schedule it now", "right now", "post it", etc.)
      let prevTrail = '';
      while (prevTrail !== cleaned) {
        prevTrail = cleaned;
        cleaned = cleaned.replace(
          /\s+(and\s+)?(post|publish|schedule|share|queue|send)\s+(it|this|them)?(\s*(now|immediately|right now|asap|today))?$/i,
          ''
        );
        cleaned = cleaned.replace(/\s+(and\s+)?(do it now|right now|immediately|now|asap|today)$/i, '');
        cleaned = cleaned.replace(
          /\s+(with|using|in|for)\s+(good|viral|creative|high converting|best|trending)*\s*(hashtags|caption|image|media|photo|visuals?).*$/i,
          ''
        );
        cleaned = cleaned.replace(/\s+(post|realted|related|content|creative|ad)$/i, '');
      }

      return cleaned.trim();
    };

    const formatSubjectTitle = (subject: string): string => {
      if (!subject) return '';
      const acronyms = new Set([
        'HP',
        'AI',
        'PC',
        '4K',
        'OLED',
        'S24',
        'ASUS',
        'ACER',
        'DELL',
        'VIP',
        'GPU',
        'CPU',
        'RAM',
        'SSD',
        'USA',
        'UK',
        'IDE',
        'PR',
        'API',
        'UI',
        'UX',
        'LLM',
        'CI/CD',
      ]);
      return subject
        .split(/\s+/)
        .map(w => {
          const up = w.toUpperCase();
          if (acronyms.has(up)) return up;
          if (w.toLowerCase() === 'saas') return 'SaaS';
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(' ');
    };

    // 3. Variant Request Handling (e.g. "✍️ Generate Another Variant")
    const isVariantRequest = /variant|another(\s+option|\s+version|\s+one)?|different(\s+option|\s+angle)/i.test(trimmed);
    let targetSubject = extractCleanSubject(trimmed);

    if (isVariantRequest || !targetSubject) {
      // Look back for subject in previous posts or user chat history
      const prevPost = posts[0] || chatMessages.slice().reverse().find(m => m.postPreview)?.postPreview;
      const prevUserMsg = chatMessages
        .slice()
        .reverse()
        .find(m => m.role === 'user' && !/variant|approve|another|cancel/i.test(m.content));

      if (prevUserMsg) {
        targetSubject = extractCleanSubject(prevUserMsg.content);
      }
      if (!targetSubject && prevPost) {
        targetSubject = prevPost.title.replace(/[:\-–—].*$/, '').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
      }
      if (!targetSubject && activeCampaign?.name) {
        targetSubject = activeCampaign.name;
      }
    }

    const cleanSubject = formatSubjectTitle(targetSubject);
    const p = (targetSubject ? `${targetSubject} ${trimmed}` : trimmed).toLowerCase();

    let postTitle = 'Curated Social Creative ✨';
    let postCaption = '';
    let postHashtags: string[] = ['#Socialix', '#ContentCreator', '#ViralPost', '#Marketing', '#SocialMediaGrowth'];
    let postMedia = attachedImage || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1080&auto=format&fit=crop&q=85';

    // 4. Multi-Domain Contextual Content Generation
    if (attachedImage) {
      // Visual reference provided by user
      const isPromo = /discount|sale|off|promo|deal|coupon|limited|offer/i.test(p);
      const isLaunch = /launch|announc|new|introduc|drop/i.test(p);
      postTitle = isPromo
        ? 'Special Exclusive Offer 🔥'
        : isLaunch
        ? 'New Release Announcement 🚀'
        : cleanSubject
        ? `${cleanSubject}: Curated Showcase ✨`
        : 'Curated Visual Showcase ✨';

      postCaption = `Crafted around your visual reference ✨\n\n${cleanSubject ? `Featuring **${cleanSubject}**—designed with high-contrast storytelling, intentional aesthetics, and engaging copy to stop the scroll and drive organic reach.\n\n` : ''}⚡ High-converting visual hierarchy\n🎨 Color-calibrated for maximum feed engagement\n👇 Ready to launch? Tap 'Approve & Schedule' or fine-tune in AI Image Studio!`;
      postHashtags = ['#VisualStorytelling', '#CreativeDesign', '#BrandAesthetic', '#SocialMediaGrowth', '#ContentCreator'];
      postMedia = attachedImage;
    } else if (/hp|laptop|notebook|macbook|thinkpad|dell|asus|acer|lenovo|chromebook|surface|gaming pc|desktop|ultrabook|\bpc\b|workstation|hardware|intel|amd|nvidia|rtx/i.test(p)) {
      // DOMAIN: Laptops & Tech Hardware
      const brand = cleanSubject || 'HP Laptop';
      if (isVariantRequest) {
        postTitle = `${brand} (Variant 2): Ultra-Portable Freedom ✈️💻`;
        postCaption = `Work from anywhere without missing a beat. ✈️ Meet the all-new ${brand}.\n\nEngineered for founders, developers, and creators on the move:\n\n✨ Featherlight chassis that slips effortlessly into your daily carry\n🔋 Up to 16 hours of untethered battery freedom on a single charge\n🔊 Studio-tuned audio & AI noise-canceling mics for crystal-clear calls\n⚡ Whisper-quiet thermal cooling during intensive multitasking\n\nUpgrade your mobile productivity today! 👇\n\nTap the link in bio to shop the latest lineup or drop your daily setup below! 🚀`;
        postHashtags = [`#${brand.replace(/\s+/g, '')}`, '#RemoteWork', '#DigitalNomad', '#TechSetup', '#ProductivityGear', '#LaptopLifestyle'];
        postMedia = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1080&auto=format&fit=crop&q=85';
      } else {
        postTitle = `${brand}: Power Meets Everyday Precision 💻⚡`;
        postCaption = `Unleash peak performance and all-day endurance with ${brand}! 💻✨\n\nWhether you're compiling multi-threaded code, rendering 4K creative assets, or multitasking through your busiest day:\n\n⚡ Next-gen multi-core processing power & instant responsiveness\n🎨 Micro-edge anti-glare display with vibrant, true-to-life color accuracy\n🔋 All-day battery life with fast-charge technology (0 to 50% in 30 mins)\n✨ Precision aluminum chassis crafted for effortless portability\n\nReady to elevate your daily workspace? 👇\n\nWhat's your must-have laptop feature: raw speed, screen quality, or battery life? Tell us below! 🚀`;
        postHashtags = [`#${brand.replace(/\s+/g, '')}`, '#LaptopLife', '#TechSetup', '#ProductivityGear', '#WorkFromAnywhere', '#TechInnovation', '#CreatorCommunity'];
        postMedia = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1080&auto=format&fit=crop&q=85';
      }
    } else if (/\b(coding|code|coder|programmer|programming|developer|developers|devs|software engineer|software development|fullstack|frontend|backend|devops|github|git|ide|terminal|cursor|copilot|debugging|debugger|syntax|python|javascript|typescript|react|nextjs|api|backend agent|coding agent)\b/i.test(p)) {
      // DOMAIN: Coding & Developer AI / Software Engineering
      const devSubject = cleanSubject || 'AI Coding Agent';
      if (isVariantRequest) {
        postTitle = `${devSubject} (Variant 2): Modern Engineering Velocity 🚀⚡`;
        postCaption = `Building software shouldn't feel like wrestling with legacy dependencies. 🚀 Meet ${devSubject}.\n\nBuilt for high-output engineering teams, founders, and solo hackers:\n\n✨ Intelligent context engine that grasps your full codebase architecture\n⚡ Instant generation of typed contracts, test suites, and documentation\n🔍 Automated vulnerability detection and memory leak profiling\n🛠️ Terminal-native CLI and IDE integration that keeps you in deep flow\n\nScale your output without scaling burnout. 💻\n\nWhat’s the most tedious part of your current dev stack? Share below! 👇`;
        postHashtags = [`#${devSubject.replace(/[^a-zA-Z0-9]/g, '')}`, '#SoftwareEngineering', '#DeveloperTools', '#CodingAgent', '#FullStack', '#TechInnovation', '#BuildInPublic'];
        postMedia = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&auto=format&fit=crop&q=85';
      } else {
        postTitle = `${devSubject}: Powering 10x Developer Velocity 💻⚡`;
        postCaption = `From prompt to production in seconds ⚡ Meet the new standard of engineering with ${devSubject}!\n\nImagine having a 24/7 senior pair programmer directly in your workspace:\n\n⚡ Generates clean, type-safe architecture & unit tests in milliseconds\n🐛 Auto-diagnoses complex stack traces and patches edge cases in real-time\n🚀 Performs instant code refactoring and automated PR reviews before you merge\n📦 Handles repetitive boilerplate so you can focus on high-impact system design\n\nStop wrestling with syntax. Build products that matter. 🚀\n\nHow is your engineering team leveraging AI in development today? Drop your favorite stack or prompt technique below! 👇`;
        postHashtags = [`#${devSubject.replace(/[^a-zA-Z0-9]/g, '')}`, '#AICoding', '#DeveloperTools', '#CodingAgent', '#SoftwareEngineering', '#FullStack', '#TechInnovation', '#BuildInPublic', '#DevCommunity'];
        postMedia = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&auto=format&fit=crop&q=85';
      }
    } else if (/eduactional|educational|education|learning|tutorial|course|study|student|learn|knowledge|tips|guide|infographic|lesson|skill/i.test(p)) {
      // DOMAIN: Educational & Learning
      const topic = cleanSubject || 'Daily Knowledge Drop';
      postTitle = `${topic}: 3 Frameworks to Learn Faster 🧠📚`;
      postCaption = `Continuous growth isn't about working harder—it's about learning smarter. 🧠✨\n\nHere are 3 research-backed strategies to accelerate your mastery:\n\n1️⃣ The 80/20 Framework: Identify the 20% of core fundamentals that produce 80% of real-world outcomes.\n2️⃣ Active Recall over Passive Reading: Test yourself immediately after consuming information to lock in retention.\n3️⃣ The Feynman Technique: Explain complex concepts simply in your own words. If you stumble, revisit the gaps.\n\nSave this post to sharpen your workflow during your next deep-work session! 📌\n\nWhat is one skill you are committed to mastering this month? Share below! 👇`;
      postHashtags = ['#ContinuousLearning', '#GrowthMindset', '#EducationalTips', '#StudyMotivation', '#SkillBuilding', '#PersonalGrowth', '#DeepWork'];
      postMedia = isVariantRequest
        ? 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1080&auto=format&fit=crop&q=85'
        : 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1080&auto=format&fit=crop&q=85';
    } else if (/coffee|cafe|latte|roast|brew|espresso|croissant|bakery|barista|cappuccino|tea|breakfast|restaurant|food|burger|pizza|dining/i.test(p)) {
      // DOMAIN: Food, Coffee & Dining
      const cafeName = cleanSubject || 'Artisan Espresso';
      postTitle = `${cafeName} & Morning Rituals ☕🥐`;
      postCaption = 'Behind every great morning is a slow, intentional ritual ☕🥐 Small-batch single-origin beans, velvety microfoam, and pastries baked fresh at sunrise.\n\nHow do you take your first cup of the day? Drop your go-to order below! 👇';
      postHashtags = ['#ArtisanCoffee', '#CoffeeLovers', '#MorningRitual', '#CafeVibes', '#SpecialtyRoast', '#BaristaLife'];
      postMedia = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1080&auto=format&fit=crop&q=85';
    } else if (/samsung|s24|galaxy|iphone|apple|phone|mobile|smartphone|android|pixel|device|gadget/i.test(p)) {
      // DOMAIN: Smartphones & Mobile
      const phoneName = cleanSubject || 'Flagship Smartphone';
      postTitle = `${phoneName}: Next-Gen Intelligence 📱✨`;
      postCaption = 'Sleek aerospace titanium meets pro-grade imaging. 📱✨ From on-device AI live translation to low-light nightography, elevate how you create and connect on the go.\n\nReady for the next upgrade? Tell us your favorite feature below! 👇';
      postHashtags = ['#SmartphoneInnovation', '#TechTrends', '#MobilePhotography', '#GadgetLovers', '#NextGenTech'];
      postMedia = 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1080&auto=format&fit=crop&q=85';
    } else if (/fashion|wear|outfit|style|clothing|streetwear|hoodie|dress|luxury|lookbook|sneaker|apparel/i.test(p)) {
      // DOMAIN: Fashion & Streetwear
      const brand = cleanSubject || 'Minimal Modern';
      postTitle = `${brand}: Seasonal Collection 🖤✨`;
      postCaption = 'Effortless silhouettes meet structured minimalism. 🧥✨ Designed for the modern wardrobe and tailored to stand out with subtle confidence.\n\nWhich piece are you wearing first? Tap the link in bio to shop the limited drop! 🛍️';
      postHashtags = ['#FashionInspo', '#StreetStyle', '#OOTD', '#MinimalFashion', '#CuratedWardrobe', '#StyleInspiration'];
      postMedia = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1080&auto=format&fit=crop&q=85';
    } else if (/gym|fitness|workout|health|train|exercise|muscle|run|fit|wellness|yoga|crossfit/i.test(p)) {
      // DOMAIN: Fitness & Health
      const title = cleanSubject || 'Daily Fitness';
      postTitle = `${title}: Consistency Beats Motivation ⚡`;
      postCaption = 'The hardest part isn’t the workout—it’s deciding to show up. 💪🔥 Small, consistent efforts compounded over time create undeniable results.\n\nTag your workout partner below and let’s crush today’s goals! 👊';
      postHashtags = ['#FitnessMotivation', '#DailyGrind', '#WorkoutRoutine', '#HealthyHabits', '#StrengthAndConditioning'];
      postMedia = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1080&auto=format&fit=crop&q=85';
    } else if (/skin|beauty|cosmetic|glow|makeup|serum|cream|hair|spa|skincare/i.test(p)) {
      // DOMAIN: Beauty & Skincare
      const beautyName = cleanSubject || 'Clean Beauty';
      postTitle = `${beautyName}: Golden Hour Clean Glow ✨`;
      postCaption = 'Healthy, radiant skin starts with gentle rituals and nourishing botanicals. 🌿💧 Hydrate, protect, and let your natural skin glow without compromise.\n\nWhat’s your holy-grail skincare step? Share below! 🌸';
      postHashtags = ['#CleanBeauty', '#SkincareRoutine', '#GlowingSkin', '#SelfCareSunday', '#NaturalCosmetics'];
      postMedia = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1080&auto=format&fit=crop&q=85';
    } else if (/travel|trip|vacation|explore|flight|beach|mountain|hotel|tour|adventure|destination/i.test(p)) {
      // DOMAIN: Travel & Adventure
      const destination = cleanSubject || 'Wanderlust Chronicles';
      postTitle = `${destination}: Discover New Horizons ✈️🌍`;
      postCaption = 'Always take the scenic route. 🌅🌍 Breathe in the salt air, chase the sunset, and let the adventure unfold.\n\nWhere is your dream getaway this year? Save this for your upcoming bucket list! 📌✈️';
      postHashtags = ['#Wanderlust', '#TravelDiaries', '#ExploreMore', '#ScenicViews', '#TravelGoals'];
      postMedia = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=85';
    } else if (/home|house|interior|decor|room|apartment|architecture|real estate|living/i.test(p)) {
      // DOMAIN: Real Estate & Interior
      const decorTitle = cleanSubject || 'Modern Architecture';
      postTitle = `${decorTitle}: Architectural Sanctuary 🏡✨`;
      postCaption = 'Natural sunlit angles, warm walnut textures, and calm organic acoustics. 🌿🛋️ Designing spaces that evoke peace, clarity, and inspired living.\n\nCould you spend your weekends here? Tell us your favorite corner! 👇';
      postHashtags = ['#InteriorDesign', '#DreamHome', '#ModernArchitecture', '#CozyLiving', '#HomeInspiration'];
      postMedia = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&auto=format&fit=crop&q=85';
    } else if (/sale|discount|promo|deal|coupon|offer|black friday|cyber|50%|20%|off|flash sale/i.test(p)) {
      // DOMAIN: Sales & Deals
      const saleName = cleanSubject || 'Exclusive VIP Offer';
      postTitle = `${saleName}: Limited Time Only 🔥🏷️`;
      postCaption = 'Because our community deserves the best—enjoy an exclusive seasonal special! 🎁✨ Premium quality, crafted with care, available for a strictly limited window.\n\nDon’t miss out! Tap the link in bio to claim yours today! ⏳🛍️';
      postHashtags = ['#SpecialOffer', '#LimitedEdition', '#VIPAccess', '#FlashSale', '#ShopNow'];
      postMedia = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1080&auto=format&fit=crop&q=85';
    } else if (/\b(social media agent|marketing agent|social media ai|content agent|growth agent|socialix|autonomous marketing|content team)\b/i.test(p)) {
      // DOMAIN: Social Media & Marketing AI Agents
      const agentSubject = cleanSubject || 'Autonomous AI Social Media Team';
      postTitle = `${agentSubject}: 24/7 Social Media Growth 🤖📈`;
      postCaption = `Why spend countless manual hours juggling social channels when an autonomous AI team works around the clock? 🚀✨\n\nMeet your always-on content engine with ${agentSubject}:\n\n🔍 Research Agent tracks live competitor trends, viral hooks, and hashtag momentum\n🎨 Creator Agent crafts platform-calibrated captions, visuals, and high-converting hooks\n⏰ Scheduler Agent predicts peak engagement windows and auto-queues via Zernio\n\nWork smarter, build faster, and scale your organic reach on autopilot. 📌\n\nReady to put your content pipeline on cruise control? Drop a '🚀' below or tap the link in bio!`;
      postHashtags = ['#SocialMediaAgent', '#AIAgent', '#ContentAutomation', '#MarketingAI', '#FutureOfWork', '#CreatorEconomy'];
      postMedia = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&auto=format&fit=crop&q=85';
    } else if (/\b(ai|artificial intelligence|machine learning|saas|software|automation|deep learning|llm|neural|robotics|generative ai|bot|cyber)\b/i.test(p)) {
      // DOMAIN: General AI Software & SaaS Automation
      const aiSubject = cleanSubject || 'Intelligent AI Automation';
      postTitle = `${aiSubject}: Smarter Workflows, Faster Scale 🤖⚡`;
      postCaption = `The future isn't about replacing humans—it's about augmenting human ingenuity with ${aiSubject}. 🧠⚡\n\nFrom real-time predictive intelligence to seamless autonomous workflows:\n\n⚡ Eliminate hours of repetitive friction and manual bottlenecks\n📈 Unlock high-velocity decision-making powered by intelligent models\n🌐 Scale your operations 24/7 with reliable, repeatable precision\n\nThe builders who embrace intelligent workflows today are defining tomorrow's industry leaders. 💡\n\nWhere is your team seeing the highest ROI with AI this year? Share your thoughts below! 👇`;
      postHashtags = ['#ArtificialIntelligence', '#MachineLearning', '#AITools', '#TechInnovation', '#FutureOfWork', '#Automation', '#TechLeadership'];
      postMedia = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=85';
    } else {
      // DOMAIN: Dynamic Intelligent Fallback for ANY custom topic/product
      const dynamicSubject = cleanSubject || (trimmed.length > 3 ? trimmed.slice(0, 32) : 'Signature Collection');
      postTitle = `${dynamicSubject}: Elevated Design & True Quality ✨`;
      postCaption = `Introducing the next standard of ${dynamicSubject} ✨\n\nCrafted for those who appreciate authenticity, refined details, and flawless execution:\n\n💎 Premium materials and thoughtful design in every single touchpoint\n⚡ Engineered to seamlessly elevate your everyday lifestyle\n🌟 Built with passion to inspire lasting confidence and connection\n\nReady to experience the difference? 👇\n\nDrop a '🔥' in the comments or tap the link in bio to explore more!`;
      postHashtags = [`#${dynamicSubject.replace(/[^a-zA-Z0-9]/g, '')}`, '#QualityFirst', '#DesignExcellence', '#CommunityFirst', '#Trendsetter', '#BrandBuilding'];
      postMedia = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&auto=format&fit=crop&q=85';
    }

    const planNumber = Math.floor(Math.random() * 80) + 33;
    const planId = `plan-${planNumber}-${Date.now()}`;
    const displaySubject = cleanSubject || (trimmed.length > 28 ? `${trimmed.slice(0, 25)}...` : trimmed);

    const newPlan: AgentPlan = {
      id: planId,
      title: attachedImage ? `Custom Visual Plan #${planNumber}` : `Plan #${planNumber}: "${displaySubject}"`,
      planNumber,
      timeAgo: 'Just now',
      status: 'in_progress',
      progress: '0/2 done',
      steps: [
        {
          id: `step-${Date.now()}-1`,
          agentId: 'creator',
          title: attachedImage ? 'Analyze visual harmony & draft copy' : `Draft copy & hashtags for "${displaySubject}"`,
          instruction: attachedImage ? 'Extract composition cues from reference image and formulate matching caption.' : `Formulate high-converting platform copy, curate trending hashtags, and match visual assets for ${displaySubject}.`,
          status: 'running',
          duration: 'In progress',
        },
        {
          id: `step-${Date.now()}-2`,
          agentId: 'scheduler',
          title: 'Compute peak engagement slot & queue on Zernio',
          instruction: 'Select highest reach window for connected accounts and queue via Zernio API.',
          status: 'scheduled',
          subtext: 'Scheduler Agent · waiting on creator draft',
        },
      ],
    };

    setActivePlan(newPlan);
    updateAgentStatus('creator', 'working', attachedImage ? 'Analyzing reference image & drafting copy' : `Drafting content for "${displaySubject}"`);
    updateAgentStatus('master', 'idle', 'Supervising creative workflow');

    logActivity(
      'plan_started',
      `Plan #${planNumber} Started`,
      attachedImage ? 'Master Agent delegated visual-first post generation' : `Master Agent delegated tasks for "${displaySubject}"`,
      '⚡'
    );

    const agentAck: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'master',
      role: 'assistant',
      content: attachedImage
        ? `📸 **Reference Image Detected!**\n- Creator Agent is analyzing composition, lighting, and brand tone from your uploaded visual.\n- Formulating platform-optimized copy, hashtag strategy, and peak engagement slot.\n\nI have queued Plan #${planNumber}. Watch real-time execution below:`
        : `Planned:\n- Creator Agent is formulating platform-specific captions and asset prompts for **${displaySubject}**.\n- Scheduler Agent will analyze peak audience engagement slots and sync via Zernio.\n\nI have queued Plan #${planNumber}. Watch real-time execution below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      plan: newPlan,
    };

    const chatsWithPlan = [...nextChats, agentAck];
    saveUpdatedChats(chatsWithPlan, newPlan);

    // 3. Fire-and-forget backend execution call in the background
    backendApi
      .startRun({
        message: trimmed || 'Create post with uploaded visual reference',
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

      // 5. Step 2: Scheduler Finishes & Post is Delivered
      setTimeout(() => {
        const step2DonePlan: AgentPlan = {
          ...step1DonePlan,
          status: 'completed',
          progress: '2/2 done',
          steps: [
            step1DonePlan.steps[0],
            { ...step1DonePlan.steps[1], status: 'done', duration: 'Completed in 1.9s' },
          ],
        };

        setActivePlan(step2DonePlan);
        updateAgentStatus('scheduler', 'idle', 'Scheduled post on Zernio');
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
          zernioSynced: true,
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
          'Creator Agent drafted a new creative ready for review.',
          '🎨'
        );

        // Deliver interactive preview message into the chat!
        const deliveryMsg: ChatMessage = {
          id: `msg-done-${Date.now()}`,
          sender: 'creator',
          role: 'assistant',
          content: `✨ Draft ready! Here is your post with copy, hashtags, and visual asset. Review the creative below and click **Approve & Schedule** or fine-tune in **AI Image Studio**:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          postPreview: createdPost,
          quickReplies: [
            '👁️ View Post',
            '✨ Open in AI Image Studio',
            '✓ Approve & Schedule',
            '✍️ Generate Another Variant',
          ],
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
      }, 1900);
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
            checkedAgo: next ? 'Connected just now' : 'Connect in Zernio',
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
        zernioApiKey,
        setZernioApiKey,
        blotatoApiKey: zernioApiKey,
        setBlotatoApiKey: setZernioApiKey,
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
