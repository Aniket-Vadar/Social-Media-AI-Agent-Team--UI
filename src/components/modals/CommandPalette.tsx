'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Bot,
  Layers,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  Plus,
  ArrowRight,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setIsCreatePostOpen,
    setIsCreateCampaignOpen,
    setActiveAgentId,
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (path: string) => {
    setIsCommandPaletteOpen(false);
    router.push(path);
  };

  const navItems = [
    { label: 'Overview', desc: 'Campaign snapshot & agent office', path: '/', icon: LayoutDashboard },
    { label: 'AI Agent Workspace', desc: 'Chat with Master, Research, Creator & Scheduler', path: '/agents', icon: Bot },
    { label: 'Posts Library', desc: 'View drafts, scheduled and published posts', path: '/posts', icon: Layers },
    { label: 'Content Calendar', desc: 'Plan & reschedule monthly/weekly posts', path: '/calendar', icon: Calendar },
    { label: 'Analytics Dashboard', desc: 'KPI cards, reach & daily activity metrics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings & Integrations', desc: 'Blotato API key & connected social accounts', path: '/settings', icon: Settings },
  ];

  const filteredNav = navItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none placeholder:text-gray-400 font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-gray-100 text-gray-500 rounded border border-gray-200">
            ESC
          </kbd>
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions List */}
        <div className="p-3 max-h-[380px] overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Quick Actions
          </div>

          <button
            onClick={() => {
              setIsCommandPaletteOpen(false);
              setIsCreatePostOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <span className="font-semibold text-gray-900 group-hover:text-brand-600">Create new post</span>
              <p className="text-[10px] text-gray-400">Launch manual or AI-assisted post wizard</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600" />
          </button>

          <button
            onClick={() => {
              setIsCommandPaletteOpen(false);
              setIsCreateCampaignOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <span className="font-semibold text-gray-900 group-hover:text-purple-600">New Campaign</span>
              <p className="text-[10px] text-gray-400">Setup a brand campaign with personalized office space</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600" />
          </button>

          {/* Navigation Items */}
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Navigation
          </div>

          {filteredNav.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => navigateTo(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-gray-900 group-hover:text-brand-600">{item.label}</span>
                  <p className="text-[10px] text-gray-400">{item.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
