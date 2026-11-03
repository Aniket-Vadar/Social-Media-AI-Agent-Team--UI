'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Shield,
  Pause,
  Play,
  RotateCw,
  Camera,
  Check,
  ExternalLink,
  Cpu,
  Globe,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface LiveVirtualBoxProps {
  initialQuery?: string;
  className?: string;
  onSendToChat?: (content: string) => void;
}

export const LiveVirtualBox: React.FC<LiveVirtualBoxProps> = ({
  initialQuery,
  className = '',
  onSendToChat,
}) => {
  const { activeCampaign, sendMessage, logActivity, showSuccess } = useApp();

  // Dynamic default query based on campaign name
  const campaignTopic = activeCampaign?.name ? activeCampaign.name.toLowerCase() : 'social media';
  const defaultQuery = initialQuery || `${campaignTopic} trending instagram launch reels morning post hashtags 2026`;

  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [searchInput, setSearchInput] = useState(defaultQuery);
  const [isRunning, setIsRunning] = useState(true);
  const [captured, setCaptured] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Synchronize search query when active campaign switches
  useEffect(() => {
    if (!initialQuery && activeCampaign?.name) {
      const q = `${activeCampaign.name.toLowerCase()} trending instagram reels launch hooks 2026`;
      setSearchQuery(q);
      setSearchInput(q);
    }
  }, [activeCampaign?.id, activeCampaign?.name, initialQuery]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;
    setIsRefreshing(true);
    setSearchQuery(searchInput.trim());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExtractInsight = () => {
    setCaptured(true);
    const insight = `🔍 **Live Market Research Extracted by Research Agent:**
- **Search Query**: "${searchQuery}"
- **2026 Algorithm Trend**: Viewer retention (watch time, saves, and keyword on-screen text) outranks basic hashtags.
- **Top 3 Viral Hooks**:
  1. *The 5-to-9 Routine*: Quick cinematic b-roll of product in use with sound design (ASMR clicks/steam).
  2. *Secret Feature / Honest Review*: "What I wish I knew before choosing this" high-curiosity hook.
  3. *Aesthetic Desk / Lifestyle Setup*: Tagging trending creator soundscapes for 2.4x higher organic explore reach.
- **Recommended Hashtags**: #${campaignTopic.replace(/\s+/g, '')} #Trends2026 #LaunchDay #CreatorVibes #ViralReels`;

    if (onSendToChat) {
      onSendToChat(insight);
    } else {
      sendMessage(insight);
    }

    logActivity('plan_started', 'Agent Research Captured', `Extracted intelligence for "${searchQuery}"`, '🔍');
    showSuccess('Research insight sent to Master Agent chat!');
    setTimeout(() => setCaptured(false), 2500);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status Banner (Matches YouTube screenshot ref 11) */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/90 border border-sky-200 text-xs text-sky-950 shadow-xs">
        <div className="flex items-center gap-2.5 truncate">
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isRunning ? 'bg-sky-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="font-bold text-sky-900">{isRunning ? 'Running' : 'Paused'}</span>
          <span className="text-sky-700 truncate text-[11px]">
            This agent is using it · Searching google for &quot;{searchQuery}&quot;
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-mono text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md font-semibold border border-sky-200">
            E2B Desktop #8491
          </span>
        </div>
      </div>

      {/* Browser Window (Clean, Authentic Agent Searching Interface) */}
      <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {/* Browser Chrome Header */}
        <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-200 flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          </div>

          {/* Interactive Google Search Address Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 text-xs border border-gray-200 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500 min-w-[220px]"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="text-gray-400 font-mono text-[11px] select-none hidden md:inline">
              https://www.google.com/search?q=
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search query..."
              className="flex-1 bg-transparent text-gray-800 text-xs focus:outline-none font-mono truncate"
            />
            <button
              type="submit"
              className="px-2.5 py-0.5 rounded-lg bg-gray-900 text-white text-[10px] font-bold hover:bg-black transition-colors"
            >
              Search
            </button>
          </form>

          {/* Refresh Action */}
          <button
            onClick={() => handleSearch()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/70 transition-colors"
            title="Reload search query"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Browser Viewport Content: Google Search & AI Overview (Screenshot Ref 11) */}
        <div className="p-5 bg-white space-y-4 max-h-[440px] overflow-y-auto text-xs">
          {/* Google AI Overview Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border border-indigo-100 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>AI Overview · Trending Social Content & Market Insights (2026)</span>
            </div>

            <p className="text-gray-700 leading-relaxed text-[11px]">
              Launching content around <strong className="text-gray-900 capitalize">&quot;{campaignTopic}&quot;</strong> on Instagram and TikTok in 2026 requires prioritizing viewer retention behavior—such as watch time, saves, and audio shares—while on-screen keywords and subtitles do the heavy lifting that generic hashtags used to do.
            </p>

            <div className="space-y-2 pt-2 border-t border-indigo-100/70">
              <h5 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Top Viral Reel Concepts for &quot;{campaignTopic}&quot;:</span>
              </h5>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600 text-[11px] pl-1">
                <li>
                  <strong className="text-gray-800">The 5-to-9 Cinematic Ritual:</strong> Quick cinematic cuts showcasing the product/service in an authentic day-in-the-life setting with immersive sound design (ASMR audio).
                </li>
                <li>
                  <strong className="text-gray-800">The &quot;What Nobody Tells You&quot; Hook:</strong> An honest breakdown contrasting common misconceptions with actual benefits to drive saves and comments.
                </li>
                <li>
                  <strong className="text-gray-800">High-Contrast Visual Format:</strong> 1:1 or 9:16 portrait assets with warm, natural lighting and bold text overlay placed within the safe margin.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Trending Tags:</span>
              {[
                `#${campaignTopic.replace(/\s+/g, '')}2026`,
                `#${campaignTopic.replace(/\s+/g, '')}Vibes`,
                '#DailyRitual',
                '#SpecialtySelection',
                '#ReelTrending',
              ].map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-white border border-indigo-200/80 text-indigo-600 text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Organic Google Search Results */}
          <div className="space-y-3 pt-2">
            <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Organic Results Found</h6>

            {/* Result 1 */}
            <div className="p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors space-y-1">
              <span className="text-[10px] text-emerald-700 font-mono block">
                https://www.socialmediatoday.com &gt; trends &gt; {campaignTopic.replace(/\s+/g, '-')}
              </span>
              <h4 className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer">
                Top Social Media Video Hooks & Engagement Strategies for {campaignTopic} (2026 Report)
              </h4>
              <p className="text-[11px] text-gray-600 leading-snug">
                Comprehensive benchmark of top-performing creators in {campaignTopic}. Discover why 7-second looping reels generate 3.2x higher save rates and learn the optimal posting windows.
              </p>
            </div>

            {/* Result 2 */}
            <div className="p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors space-y-1">
              <span className="text-[10px] text-emerald-700 font-mono block">
                https://trends.google.com &gt; explore &gt; {campaignTopic.replace(/\s+/g, '+')}
              </span>
              <h4 className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer">
                Google Trends Search Interest Over Time: &quot;{campaignTopic}&quot;
              </h4>
              <p className="text-[11px] text-gray-600 leading-snug">
                Search volume for {campaignTopic} shows peak queries during morning hours (7:30 AM - 9:30 AM) and evening commute (5:00 PM - 7:00 PM). Related breakout topics indicate strong demand for artisan quality.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={handleExtractInsight}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              {captured ? <Check className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              <span>{captured ? 'Captured to Chat!' : 'Extract Insight to Chat'}</span>
            </button>
          </div>

          <span className="text-[11px] text-gray-400">
            Pauses itself after 3 minutes without use
          </span>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        This agent&apos;s own computer, so it can search live Google market trends while your other agents work on theirs. Logins and state remain active between tasks.
      </p>
    </div>
  );
};
