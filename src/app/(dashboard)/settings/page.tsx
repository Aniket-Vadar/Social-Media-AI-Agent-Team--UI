'use client';

import React, { useState } from 'react';
import {
  Link2,
  Key,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  Instagram,
  Video,
  Youtube,
  Shield,
  Sliders,
  Sparkles,
  LogOut,
  User,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';

export default function SettingsPage() {
  const {
    user,
    signOut,
    accounts,
    toggleAccountConnection,
    blotatoApiKey,
    setBlotatoApiKey,
    activeCampaign,
  } = useApp();

  const [isReplacingKey, setIsReplacingKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(blotatoApiKey);
  const [approvalMode, setApprovalMode] = useState<'manual' | 'auto'>('manual');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAccounts = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleSaveKey = () => {
    setBlotatoApiKey(apiKeyInput);
    setIsReplacingKey(false);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Settings"
        subtitle="Campaign, team and workspace preferences"
      />

      {/* Main Container */}
      <div className="max-w-4xl space-y-8 select-none">
        {/* Section: Integrations (Matches screenshot ref 18) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-purple-50 text-brand-600">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Integrations</h2>
              <p className="text-xs text-gray-400">
                Services this app uses on your behalf. Keys are stored encrypted and never leave the server.
              </p>
            </div>
          </div>

          {/* Blotato Card (Matches ref 18) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-100">
                  <Link2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900">Blotato</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                    Publishes and schedules your posts on Instagram, TikTok and YouTube, and lets the Scheduler
                    Agent post for you. Each person uses their own Blotato account.
                  </p>
                </div>
              </div>
            </div>

            {/* API Key Box */}
            <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {isReplacingKey ? (
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="Enter Blotato API Key"
                    className="w-full bg-white px-3 py-1.5 rounded-xl border border-gray-300 text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                ) : (
                  <span className="text-xs font-mono text-gray-700 tracking-wider">
                    •••••••••••••••••••••••••••••Gmk=
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isReplacingKey ? (
                  <button
                    onClick={handleSaveKey}
                    className="px-3 py-1.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
                  >
                    Save key
                  </button>
                ) : (
                  <button
                    onClick={() => setIsReplacingKey(true)}
                    className="px-3 py-1.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs font-semibold transition-colors"
                  >
                    Replace key
                  </button>
                )}
                <button
                  onClick={() => alert('Disconnected Blotato integration')}
                  className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Connected Accounts Sub-Section (Matches ref 18) */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Connected accounts</h4>
                  <span className="text-[11px] text-gray-400">Checked 1 day ago</span>
                </div>
                <button
                  onClick={handleRefreshAccounts}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* 3 Platform Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Instagram */}
                <div className="p-4 rounded-2xl border border-gray-200/90 bg-white shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-gray-900">Instagram</h5>
                      <span className="text-[10px] text-gray-400 font-medium">1 account</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 text-white flex items-center justify-center text-[10px] font-bold">
                      K
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[11px] text-gray-800 leading-none">kravixstudio</div>
                      <span className="text-[10px] text-gray-400">@kravixstudio</span>
                    </div>
                  </div>
                </div>

                {/* 2. TikTok */}
                <div className="p-4 rounded-2xl border border-gray-200/90 bg-white shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-gray-900">TikTok</h5>
                      <span className="text-[10px] text-gray-400 font-medium">Not connected</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAccountConnection('tiktok')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors border border-brand-100"
                  >
                    <span>Connect in Blotato</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* 3. YouTube */}
                <div className="p-4 rounded-2xl border border-gray-200/90 bg-white shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0">
                      <Youtube className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-gray-900">YouTube</h5>
                      <span className="text-[10px] text-gray-400 font-medium">Not connected · videos & Shorts</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAccountConnection('youtube')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors border border-brand-100"
                  >
                    <span>Connect in Blotato</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Policy & Approval Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Human-in-the-Loop Approval Workflow</h2>
              <p className="text-xs text-gray-400">
                Control whether AI-generated drafts require your manual review before scheduling.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setApprovalMode('manual')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  approvalMode === 'manual'
                    ? 'border-brand-500 bg-brand-50/30 ring-2 ring-brand-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="approvalMode"
                  checked={approvalMode === 'manual'}
                  onChange={() => setApprovalMode('manual')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="font-bold text-xs text-gray-900">Require approval (Recommended)</div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Agents pause at approval gate. You review captions and images before anything gets scheduled.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setApprovalMode('auto')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  approvalMode === 'auto'
                    ? 'border-brand-500 bg-brand-50/30 ring-2 ring-brand-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="approvalMode"
                  checked={approvalMode === 'auto'}
                  onChange={() => setApprovalMode('auto')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="font-bold text-xs text-gray-900">Auto-publish</div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Agents autonomously plan, generate, and schedule posts directly without waiting for review.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* User Account & Authentication */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-50 text-brand-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Account & Security</h2>
              <p className="text-xs text-gray-400">
                Manage your authenticated identity, session, and single sign-on access.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-100 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-base shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-gray-900">{user?.name || 'Authenticated Creator'}</h4>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Google SSO
                  </span>
                </div>
                <p className="text-xs text-gray-500">{user?.email || 'Logged in via Google'}</p>
                <p className="text-[10px] text-gray-400">Protected by Supabase Auth & Anti-Spam Shield</p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-100/60 text-red-600 text-xs font-semibold transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
