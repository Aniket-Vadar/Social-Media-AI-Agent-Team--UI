'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Sparkles,
  PenTool,
  CheckCircle2,
  LogOut,
  User,
  Shield,
  Settings,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const router = useRouter();
  const {
    user,
    isLoadingUser,
    signOut,
    signInWithGoogle,
    setIsCreatePostOpen,
    setIsCommandPaletteOpen,
    notificationsCount,
    activeCampaign,
  } = useApp();

  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

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

        {/* User Profile Avatar / Sign In Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 p-0.5 rounded-2xl hover:ring-2 hover:ring-indigo-300 transition-all focus:outline-none"
              title={user.name || 'User Profile'}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-2xl object-cover ring-1 ring-black/5 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-bold flex items-center justify-center text-sm shadow-xs select-none">
                  {initial}
                </div>
              )}
            </button>

            {/* User Menu Popover */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 top-12 z-40 w-64 bg-white rounded-2xl border border-gray-100 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                  <div className="px-3 py-2 border-b border-gray-100 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900 truncate max-w-[140px]">{user.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-brand-600 text-[10px] font-bold">
                        Google
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-500" />
                      <span>Workspace Settings</span>
                    </Link>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => signInWithGoogle()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-gray-200/90 shadow-xs hover:border-indigo-300 hover:shadow-sm text-gray-700 hover:text-gray-900 font-semibold text-xs transition-all group"
            title="Sign in with Google"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
