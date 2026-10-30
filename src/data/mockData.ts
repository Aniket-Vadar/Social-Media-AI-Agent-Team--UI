import { Agent, Campaign, Post, AgentPlan, ChatMessage, ConnectedAccount, AnalyticsMetric, DailyActivityPoint, EngagementPoint } from '@/types';

export const initialAgents: Agent[] = [
  {
    id: 'master',
    name: 'Master Agent',
    role: 'Supervisor & Project Manager',
    shortDesc: 'Plans your requests, assigns tasks & reports back',
    description: 'Hi! I\'m your Master Agent. I coordinate your AI team. Tell me what you need, like "Plan a week of Instagram posts about our launch". I\'ll break it into tasks, assign them to the right agents, check their work and report back here.',
    color: '#6D5EF5',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    avatar: '/avatars/master.png',
    status: 'working',
    currentTask: 'Coordinating Coffee Shop Launch Campaign',
    taskDuration: '4m 12s',
    filesCount: 3,
    deskPosition: {
      top: '18%',
      left: '50%',
    },
  },
  {
    id: 'researcher',
    name: 'Research Agent',
    role: 'Market & Trend Researcher',
    shortDesc: 'Finds trends and topics using live browser sandbox',
    description: 'I scour social media, trends, and competitor pages using my dedicated cloud browser desktop. I distill top performing topics into actionable content briefs.',
    color: '#0EA5E9',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    avatar: '/avatars/researcher.png',
    status: 'working',
    currentTask: 'Searching Google for "coffee shop instagram launch trending reels morning post hashtags 2026"',
    taskDuration: '1m 45s',
    filesCount: 1,
    deskPosition: {
      top: '55%',
      left: '26%',
    },
  },
  {
    id: 'creator',
    name: 'Creator Agent',
    role: 'Copywriter & Visual Designer',
    shortDesc: 'Writes captions, hashtags & transforms visuals',
    description: 'I write high-converting hooks, engaging captions, curate high-reach hashtags, and create or transform imagery tailored to each platform\'s specs.',
    color: '#F59E0B',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    avatar: '/avatars/creator.png',
    status: 'working',
    currentTask: 'Generating caption variants & image overlays for post #2',
    taskDuration: '2m 10s',
    filesCount: 2,
    deskPosition: {
      top: '32%',
      left: '68%',
    },
  },
  {
    id: 'scheduler',
    name: 'Scheduler Agent',
    role: 'Timing & Publishing Specialist',
    shortDesc: 'Plans the best time to post & schedules through Blotato',
    description: 'Hi! I\'m your Scheduler Agent. I plan the best time to post and schedule posts through Blotato. I take my tasks from the Master Agent, but you can ask me anything about timing and queues.',
    color: '#10B981',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    avatar: '/avatars/scheduler.png',
    status: 'idle',
    currentTask: 'Waiting for Creator Agent drafts to schedule',
    taskDuration: '0s',
    filesCount: 0,
    deskPosition: {
      top: '48%',
      left: '82%',
    },
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    role: 'Data & Growth Analyst',
    shortDesc: 'Tracks reach, engagement & writes growth insights',
    description: 'I pull live performance metrics, calculate growth trajectories, evaluate best-performing content types, and provide actionable tips to maximize engagement.',
    color: '#EC4899',
    badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
    avatar: '/avatars/analytics.png',
    status: 'idle',
    currentTask: 'Syncing weekly performance insights',
    taskDuration: '0s',
    filesCount: 4,
    deskPosition: {
      top: '72%',
      left: '66%',
    },
  },
];

export const initialCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Tubeguruji Instagram',
    logo: '🔥',
    color: '#F59E0B',
    status: 'in_progress',
    officeTheme: 'wooden',
    postsPublished: 3,
    totalPosts: 4,
    progressPercent: 75,
    brandVoice: 'Warm, artisanal, inviting and modern lifestyle tone',
    targetAudience: 'Coffee enthusiasts, urban remote workers & creators',
    approvalMode: 'manual',
    timezone: 'America/New_York',
  },
  {
    id: 'camp-2',
    name: 'Kravix Studio',
    logo: '🚀',
    color: '#6D5EF5',
    status: 'active',
    officeTheme: 'modern',
    postsPublished: 0,
    totalPosts: 2,
    progressPercent: 0,
    brandVoice: 'Tech-forward, sharp, insightful and visionary',
    targetAudience: 'Software engineers, AI builders & tech founders',
    approvalMode: 'manual',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'camp-3',
    name: 'Summer Product Launch',
    logo: '✨',
    color: '#0EA5E9',
    status: 'active',
    officeTheme: 'wooden',
    postsPublished: 1,
    totalPosts: 5,
    progressPercent: 20,
    brandVoice: 'Energetic, sunny, inspiring and fresh',
    targetAudience: 'Young professionals and students',
    approvalMode: 'manual',
    timezone: 'America/New_York',
  },
];

export const initialPosts: Post[] = [
  {
    id: 'post-1',
    campaignId: 'camp-1',
    title: 'Coffee shop launch post 2',
    caption: 'Your next favorite coffee stop is here. Introducing a new place to slow down, sip well, and start your day with artisan blends and cozy vibes.',
    hashtags: ['#ArtisanCoffee', '#CoffeeLovers', '#ColdBrewLaunch', '#CoffeeVibes', '#MorningRitual'],
    mediaUrl: '/images/coffee-latte.jpg',
    status: 'scheduled',
    platform: 'instagram',
    scheduledAt: '2026-10-16T21:00:00Z',
    scheduledDisplay: 'Fri, Oct 16, 9:00 PM EDT',
    createdBy: 'agent',
    blotatoSynced: true,
    engagement: {
      likes: 142,
      comments: 18,
      shares: 9,
      reach: 1250,
    },
  },
  {
    id: 'post-2',
    campaignId: 'camp-1',
    title: 'Coffee shop launch post 1',
    caption: 'A new coffee spot is brewing near you ☕ We\'re opening our doors and can\'t wait to welcome you in for slow mornings and rich roasts.',
    hashtags: ['#CoffeeShop', '#GoodIdeas', '#WorkAndCoffee', '#SpecialtyCoffee', '#CozySpaces'],
    mediaUrl: '/images/coffee-work.jpg',
    status: 'scheduled',
    platform: 'instagram',
    scheduledAt: '2026-10-17T21:00:00Z',
    scheduledDisplay: 'Sat, Oct 17, 9:00 PM EDT',
    createdBy: 'agent',
    blotatoSynced: true,
    engagement: {
      likes: 98,
      comments: 12,
      shares: 4,
      reach: 920,
    },
  },
  {
    id: 'post-3',
    campaignId: 'camp-1',
    title: 'Cold Brew Secrets: The 18-Hour Steep',
    caption: 'Ever wondered what gives our cold brew that velvety chocolate finish? It all starts with single-origin beans steeped cold for eighteen patient hours.',
    hashtags: ['#ColdBrew', '#BrewMethod', '#BehindTheScenes', '#CoffeeCraft'],
    mediaUrl: '/images/coffee-latte.jpg',
    status: 'draft',
    platform: 'instagram',
    scheduledAt: '2026-10-19T15:00:00Z',
    scheduledDisplay: 'Mon, Oct 19, 3:00 PM EDT',
    createdBy: 'agent',
    blotatoSynced: false,
  },
  {
    id: 'post-4',
    campaignId: 'camp-1',
    title: 'Morning Croissant & Pour-Over Ritual',
    caption: 'Flaky layers meet balanced roasts. The perfect breakfast pairing is waiting for you at the counter.',
    hashtags: ['#BreakfastVibes', '#PastryAndCoffee', '#FreshBakes'],
    mediaUrl: '/images/coffee-latte.jpg',
    status: 'published',
    platform: 'instagram',
    scheduledAt: '2026-10-14T14:00:00Z',
    publishedAt: '2026-10-14T14:00:00Z',
    scheduledDisplay: 'Wed, Oct 14, 2:00 PM EDT',
    createdBy: 'agent',
    blotatoSynced: true,
    engagement: {
      likes: 312,
      comments: 42,
      shares: 21,
      reach: 3480,
    },
  },
];

export const initialActivePlan: AgentPlan = {
  id: 'plan-31',
  title: 'Coffee shop launch Instagram posts',
  planNumber: 31,
  timeAgo: 'less than a minute ago',
  status: 'in_progress',
  progress: '0/2 done',
  steps: [
    {
      id: 'step-1',
      agentId: 'creator',
      title: 'Create 2 Instagram launch posts',
      instruction: 'Generate captions, curate hashtags, and format 1:1 image overlays matching the coffee shop launch theme.',
      status: 'running',
      duration: '45s elapsed',
    },
    {
      id: 'step-2',
      agentId: 'scheduler',
      title: 'Schedule the 2 Instagram posts',
      instruction: 'Compute engagement-optimized slots for Friday and Saturday at 8:00 AM EDT, verify Blotato connection, and queue.',
      status: 'scheduled',
      subtext: 'Scheduler Agent · after step 1',
    },
  ],
};

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'master',
    role: 'assistant',
    content: 'Hi! I\'m your Master Agent. I coordinate your AI team.\n\nTell me what you need, like "Plan a week of Instagram posts about our launch". I\'ll break it into tasks, assign them to the right agents, check their work and report back here.',
    timestamp: '10:00 AM',
    quickReplies: [
      'Create 2 Instagram launch posts',
      'Research trending coffee shop reels',
      'Show weekly performance insights',
      'Suggest optimal posting times'
    ],
  },
  {
    id: 'msg-2',
    sender: 'user',
    role: 'user',
    content: 'Create 2 Instagram launch posts for our coffee shop launch this weekend.',
    timestamp: '10:02 AM',
  },
  {
    id: 'msg-3',
    sender: 'master',
    role: 'assistant',
    content: `Planned:
- Creator Agent is making 2 Instagram launch posts now.
- Scheduler Agent will schedule them for tomorrow and the following day at 8:00 AM America/New_York.

Defaults I used:
- Platform: Instagram
- Account: @tubegurujipro (id 78248)
- Format: a sensible launch-friendly Instagram format
- Tone: warm coffee shop launch promo

Next:
The Creator Agent has drafted the first 2 posts. Check the previews below or jump to the Tasks tab to see the live run.`,
    timestamp: '10:03 AM',
    plan: initialActivePlan,
    postPreview: initialPosts[0],
  },
];

export const initialConnectedAccounts: ConnectedAccount[] = [
  {
    id: 'acc-1',
    platform: 'instagram',
    accountHandle: '@tubegurujipro',
    displayName: 'kravixstudio',
    connected: true,
    avatarUrl: '/avatars/master.png',
    checkedAgo: 'Checked 1 day ago',
  },
  {
    id: 'acc-2',
    platform: 'tiktok',
    accountHandle: 'Not connected',
    displayName: 'TikTok',
    connected: false,
    checkedAgo: 'Connect in Blotato',
  },
  {
    id: 'acc-3',
    platform: 'youtube',
    accountHandle: 'Not connected - videos & Shorts',
    displayName: 'YouTube',
    connected: false,
    checkedAgo: 'Connect in Blotato',
  },
];

export const initialAnalyticsMetrics: AnalyticsMetric[] = [
  {
    title: 'Posts published',
    value: 4,
    subtitle: 'None failed',
    icon: 'Send',
    iconBg: 'bg-blue-50 text-blue-600',
    color: '#3B82F6',
  },
  {
    title: 'Total views',
    value: '—',
    subtitle: 'Not reported by the platforms yet',
    icon: 'Eye',
    iconBg: 'bg-purple-50 text-purple-600',
    color: '#8B5CF6',
  },
  {
    title: 'Publishing success rate',
    value: '100%',
    subtitle: '4 of 4 went out',
    icon: 'CheckCircle2',
    iconBg: 'bg-teal-50 text-teal-600',
    color: '#14B8A6',
  },
  {
    title: 'Est. time saved',
    value: '2h 55m',
    subtitle: '4 platform posts sent by the app · 3 made by agents',
    icon: 'Clock',
    iconBg: 'bg-amber-50 text-amber-600',
    color: '#F59E0B',
  },
];

export const initialDailyActivity: DailyActivityPoint[] = [
  { date: '2026-10-09', label: 'Oct 9', count: 0 },
  { date: '2026-10-10', label: 'Oct 10', count: 0 },
  { date: '2026-10-11', label: 'Oct 11', count: 0 },
  { date: '2026-10-12', label: 'Oct 12', count: 0 },
  { date: '2026-10-13', label: 'Oct 13', count: 0 },
  { date: '2026-10-14', label: 'Oct 14', count: 3, isBusiest: true },
  { date: '2026-10-15', label: 'Oct 15', count: 1 },
];

export const initialEngagementPoints: EngagementPoint[] = [
  { date: 'Oct 9', views: 0, engagement: 0 },
  { date: 'Oct 10', views: 0, engagement: 0 },
  { date: 'Oct 11', views: 0, engagement: 0 },
  { date: 'Oct 12', views: 0, engagement: 0 },
  { date: 'Oct 13', views: 0, engagement: 0 },
  { date: 'Oct 14', views: 0, engagement: 0 },
  { date: 'Oct 15', views: 0, engagement: 0 },
];
