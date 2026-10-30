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

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [activeCampaignId, setActiveCampaignId] = useState<string>('camp-1');
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [activeAgentId, setActiveAgentId] = useState<AgentId>('master');
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(initialActivePlan);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
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
  const [notificationsCount, setNotificationsCount] = useState(2);

  const supabase = createClient();

  useEffect(() => {
    // 1. Check for incoming OAuth code in URL
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
            // Clean up the URL so the code doesn't remain in browser address bar
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        });
      }
    }

    // 2. Fetch authenticated user from Supabase
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

    // 3. Subscribe to auth changes
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
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/login';
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0];
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
    setCampaigns(prev => [...prev, newCamp]);
    setActiveCampaignId(newCamp.id);
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
      campaignId: activeCampaign.id,
      createdBy: 'user',
      blotatoSynced: true,
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const reschedulePost = (id: string, newDate: string, newDisplay: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, scheduledAt: newDate, scheduledDisplay: newDisplay, status: 'scheduled' }
          : p
      )
    );
  };

  const unschedulePost = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'draft', scheduledDisplay: 'Unscheduled draft' } : p))
    );
  };

  const cancelPlan = () => {
    if (activePlan) {
      setActivePlan(prev => (prev ? { ...prev, status: 'cancelled' } : null));
      updateAgentStatus('creator', 'idle', 'Plan cancelled by user');
      updateAgentStatus('scheduler', 'idle');
    }
  };

  const sendMessage = (content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    updateAgentStatus('master', 'working', 'Analyzing user instruction and planning tasks...');

    // Simulate Agent Supervisor response
    setTimeout(() => {
      const planNumber = Math.floor(Math.random() * 80) + 33;
      const newPlan: AgentPlan = {
        id: `plan-${planNumber}`,
        title: `Campaign task: ${content.slice(0, 35)}...`,
        planNumber,
        timeAgo: 'Just now',
        status: 'in_progress',
        progress: '0/2 done',
        steps: [
          {
            id: `step-${Date.now()}-1`,
            agentId: 'creator',
            title: `Create content for "${content.slice(0, 25)}"`,
            instruction: 'Draft captions, curate trending hashtags, and generate visual assets.',
            status: 'running',
            duration: 'In progress',
          },
          {
            id: `step-${Date.now()}-2`,
            agentId: 'scheduler',
            title: 'Analyze best time slot & queue via Blotato',
            instruction: 'Pick highest engagement window for target platform.',
            status: 'scheduled',
            subtext: 'Scheduler Agent · after creator completes',
          },
        ],
      };

      setActivePlan(newPlan);
      updateAgentStatus('creator', 'working', `Drafting content for "${content.slice(0, 30)}"`);

      const agentResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'master',
        role: 'assistant',
        content: `Planned:
- Creator Agent is working on drafting your request now.
- Scheduler Agent will pick the optimal time slot and schedule via Blotato.

I have queued Plan #${planNumber}. You can watch real-time progress on the right office desk or in the Tasks tab!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        plan: newPlan,
      };

      setChatMessages(prev => [...prev, agentResponse]);
      updateAgentStatus('master', 'idle', 'Standing by for new instructions');

      // Auto-simulate step 1 completion after 6 seconds
      setTimeout(() => {
        setActivePlan(current => {
          if (!current || current.status !== 'in_progress') return current;
          return {
            ...current,
            progress: '1/2 done',
            steps: current.steps.map((st, i) =>
              i === 0
                ? { ...st, status: 'done', duration: 'Completed in 6s' }
                : { ...st, status: 'running' }
            ),
          };
        });
        updateAgentStatus('creator', 'idle', 'Completed drafts');
        updateAgentStatus('scheduler', 'working', 'Computing optimal posting schedule...');
      }, 6000);
    }, 1200);
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
