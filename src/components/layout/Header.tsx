'use client';

import React, { useState } from 'react';
import { Search, Bell, Plus, ChevronDown, Sparkles, PenTool, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const {
    setIsCreatePostOpen,
    setIsCommandPaletteOpen,
    notificationsCount,
  } = useApp();

  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="flex items-center justify-between pb-6 select-none relative">
      {/* Title & Subtitle */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm text-gray-400 hover:text-gray-600 transition-all text-xs w-64 group"
        >
          <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          <span className="flex-1 text-left text-gray-400 group-hover:text-gray-500 font-normal">
            Search posts, campaign
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 text-gray-500 rounded border border-gray-200">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(prev => !prev)}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Popover */}
          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-12 z-40 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Notifications</h3>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {notificationsCount} New
                  </span>
                </div>
                <div className="space-y-3 pt-3">
                  <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-gray-800">Drafts Ready for Approval</p>
                      <p className="text-gray-500 text-[11px] mt-0.5">Creator Agent drafted 2 Instagram posts.</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">5m ago</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-gray-800">Blotato Synced</p>
                      <p className="text-gray-500 text-[11px] mt-0.5">Instagram account connected successfully.</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">1h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Create Post Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-300"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create post</span>
            <ChevronDown
              className="w-3.5 h-3.5 ml-0.5 opacity-80"
              onClick={e => {
                e.stopPropagation();
                setCreateDropdownOpen(prev => !prev);
              }}
            />
          </button>

          {createDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setCreateDropdownOpen(false)}
              />
              <div className="absolute right-0 top-12 z-40 w-52 bg-white rounded-2xl border border-gray-100 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    setIsCreatePostOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="font-semibold">AI-Assisted Post</div>
                    <div className="text-[10px] text-gray-400">Ask agents to ideate & generate</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    setIsCreatePostOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <PenTool className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-semibold">Manual Post</div>
                    <div className="text-[10px] text-gray-400">Custom caption and media</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar */}
        <div
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-xs cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
          title="Saloni (Tubeguruji Pro)"
        >
          S
        </div>
      </div>
    </header>
  );
};
