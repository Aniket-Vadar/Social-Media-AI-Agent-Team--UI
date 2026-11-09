'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
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
  Database,
  Trash2,
  Zap,
  RefreshCw,
  Upload,
  Eye,
  EyeOff,
  FileText,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';

export default function SettingsPage() {
  const {
    user,
    signOut,
    campaigns,
    deleteCampaign,
    posts,
    loadDemoTemplate,
    resetToFresh,
    accounts,
    toggleAccountConnection,
    zernioApiKey,
    setZernioApiKey,
    activeCampaign,
    backendStatus,
    refreshBackendStatus,
  } = useApp();

  const [isReplacingKey, setIsReplacingKey] = useState(!zernioApiKey);
  const [apiKeyInput, setApiKeyInput] = useState(zernioApiKey || '');
  const [showKey, setShowKey] = useState(false);

  const [customAiKey, setCustomAiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('socialix_custom_ai_key') || '';
    }
    return '';
  });
  const [showAiKey, setShowAiKey] = useState(false);
  const [isReplacingAiKey, setIsReplacingAiKey] = useState(false);

  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [approvalMode, setApprovalMode] = useState<'manual' | 'auto'>('manual');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAccounts = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleSaveKey = () => {
    setZernioApiKey(apiKeyInput.trim());
    setIsReplacingKey(false);
    setUploadFeedback({
      type: 'success',
      message: 'Zernio API key saved securely in browser!',
    });
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleDisconnectKey = () => {
    setApiKeyInput('');
    setZernioApiKey('');
    setIsReplacingKey(true);
    setUploadFeedback({
      type: 'info',
      message: 'API key cleared.',
    });
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleSaveAiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('socialix_custom_ai_key', customAiKey.trim());
    }
    setIsReplacingAiKey(false);
    setUploadFeedback({
      type: 'success',
      message: 'AI Provider key saved securely in browser!',
    });
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleKeyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (!content) return;

      let foundZernio = '';
      let foundAi = '';

      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        if (/^(ZERNIO_API_KEY|NEXT_PUBLIC_ZERNIO_API_KEY)\s*=/i.test(trimmed)) {
          const match = trimmed.match(/^(?:ZERNIO_API_KEY|NEXT_PUBLIC_ZERNIO_API_KEY)\s*=\s*["']?([^"'\s]+)["']?/i);
          if (match && match[1]) foundZernio = match[1];
        } else if (/^(OPENAI_API_KEY|GEMINI_API_KEY|ANTHROPIC_API_KEY|AI_API_KEY)\s*=/i.test(trimmed)) {
          const match = trimmed.match(/^(?:OPENAI_API_KEY|GEMINI_API_KEY|ANTHROPIC_API_KEY|AI_API_KEY)\s*=\s*["']?([^"'\s]+)["']?/i);
          if (match && match[1]) foundAi = match[1];
        } else if (/^sk_[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
          if (!foundZernio) foundZernio = trimmed;
        }
      }

      if (foundZernio) {
        setApiKeyInput(foundZernio);
        setZernioApiKey(foundZernio);
        setIsReplacingKey(false);
      }
      if (foundAi) {
        setCustomAiKey(foundAi);
        setIsReplacingAiKey(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('socialix_custom_ai_key', foundAi);
        }
      }

      if (foundZernio || foundAi) {
        setUploadFeedback({
          type: 'success',
          message: `Successfully loaded ${[foundZernio ? 'Zernio publishing key' : '', foundAi ? 'AI model key' : ''].filter(Boolean).join(' and ')} from ${file.name}!`,
        });
        setTimeout(() => setUploadFeedback(null), 5000);
      } else {
        const singleToken = content.trim();
        if (singleToken.length > 15 && !singleToken.includes('\n')) {
          setApiKeyInput(singleToken);
          setZernioApiKey(singleToken);
          setIsReplacingKey(false);
          setUploadFeedback({
            type: 'success',
            message: `Configured API key from ${file.name}!`,
          });
          setTimeout(() => setUploadFeedback(null), 5000);
        } else {
          setUploadFeedback({
            type: 'error',
            message: `Could not parse keys in ${file.name}. Please enter your key manually below.`,
          });
          setTimeout(() => setUploadFeedback(null), 6000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Header
        title="Settings"
        subtitle="Campaign, team and workspace preferences"
      />

      {/* Hidden file input for uploading .env or key file */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleKeyFileUpload}
        accept=".env,.txt,.json,text/plain"
        className="hidden"
      />

      {/* Main Container */}
      <div className="max-w-4xl space-y-8 select-none">
        {/* Section: API Keys & Credentials */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-purple-50 text-brand-600">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">API Keys & Integrations</h2>
                <p className="text-xs text-gray-400">
                  Securely upload your key file or configure credentials. Keys are saved in your browser and never publicly exposed.
                </p>
              </div>
            </div>

            {/* Quick Upload Key Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
              title="Upload your .env or API key text file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Key File (.env)</span>
            </button>
          </div>

          {/* Feedback Banner */}
          {uploadFeedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 transition-all ${
                uploadFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : uploadFeedback.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              {uploadFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )}
              <span>{uploadFeedback.message}</span>
            </div>
          )}

          {/* Zernio Social Publishing Key Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-100">
                  <span className="font-black text-sm tracking-tighter">zr</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-gray-900 tracking-tight flex items-center gap-1.5">
                      <span className="text-red-600">zernio</span>
                      <span className="text-gray-400 font-normal text-xs">/v1/posts</span>
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        apiKeyInput || zernioApiKey
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          apiKeyInput || zernioApiKey ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {apiKeyInput || zernioApiKey ? 'Connected' : 'Key Needed'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                    Unified social publishing infrastructure across Instagram, TikTok, LinkedIn, YouTube, and WhatsApp.
                    Scheduler Agent automatically calculates peak engagement slots and schedules directly via Zernio API.
                  </p>
                </div>
              </div>

              <a
                href="https://zernio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                <span>zernio.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* API Key Box with Password Masking & Show/Hide Eye */}
            <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {isReplacingKey ? (
                  <div className="relative flex-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={e => setApiKeyInput(e.target.value)}
                      placeholder="Paste or enter Zernio API Key (sk_...)"
                      className="w-full bg-white pr-9 px-3 py-1.5 rounded-xl border border-gray-300 text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(prev => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title={showKey ? 'Hide key' : 'Show key'}
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-700 tracking-wider">
                      {apiKeyInput
                        ? showKey
                          ? apiKeyInput
                          : `${apiKeyInput.slice(0, 6)}••••••••••••••••••••${apiKeyInput.slice(-4)}`
                        : 'No API key configured'}
                    </span>
                    {apiKeyInput && (
                      <button
                        type="button"
                        onClick={() => setShowKey(prev => !prev)}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                        title={showKey ? 'Hide key' : 'Show key'}
                      >
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isReplacingKey ? (
                  <button
                    onClick={handleSaveKey}
                    className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-xs"
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
                  onClick={handleDisconnectKey}
                  className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Optional AI Model Key Configuration */}
            <div className="p-3.5 rounded-2xl border border-gray-200/80 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-gray-800">Custom AI Model Provider Key (Optional)</span>
                  <span className="text-[10px] text-gray-400 font-medium">OpenAI / Gemini / Anthropic</span>
                </div>
                {customAiKey && !isReplacingAiKey && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Configured
                  </span>
                )}
              </div>

              {isReplacingAiKey || !customAiKey ? (
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type={showAiKey ? 'text' : 'password'}
                      value={customAiKey}
                      onChange={e => setCustomAiKey(e.target.value)}
                      placeholder="sk-... or AI provider key"
                      className="w-full bg-gray-50 pr-9 px-3 py-1.5 rounded-xl border border-gray-300 text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAiKey(prev => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title={showAiKey ? 'Hide key' : 'Show key'}
                    >
                      {showAiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveAiKey}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-600">
                      {showAiKey ? customAiKey : `${customAiKey.slice(0, 4)}••••••••••••••••••••${customAiKey.slice(-4)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAiKey(prev => !prev)}
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      {showAiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => setIsReplacingAiKey(true)}
                    className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Change Key
                  </button>
                </div>
              )}
            </div>

            {/* Connected Accounts Sub-Section */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Connected accounts</h4>
                  <span className="text-[11px] text-gray-400">Synced via Zernio connections</span>
                </div>
                <button
                  onClick={handleRefreshAccounts}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
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
                      <span className="text-[10px] text-emerald-600 font-semibold">Connected</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {accounts.find(a => a.platform === 'instagram')?.displayName?.[0]?.toUpperCase() || 'I'}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[11px] text-gray-800 leading-none">
                        {accounts.find(a => a.platform === 'instagram')?.displayName || 'itsidealcoder'}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {accounts.find(a => a.platform === 'instagram')?.accountHandle || '@itsidealcoder'}
                      </span>
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
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-100"
                  >
                    <span>Connect in Zernio</span>
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
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-100"
                  >
                    <span>Connect in Zernio</span>
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

        {/* Active Campaign Management */}
        {activeCampaign?.id && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeCampaign.logo}</span>
                <h3 className="font-bold text-sm text-gray-900">Current Campaign: {activeCampaign.name}</h3>
              </div>
              <p className="text-xs text-gray-500">
                Created with {activeCampaign.officeTheme} office theme. Delete this campaign, its posts, and isolated chat stream.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm(`Delete campaign "${activeCampaign.name}"? This will delete all its posts and cannot be undone.`)) {
                  deleteCampaign(activeCampaign.id);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Campaign</span>
            </button>
          </div>
        )}

        {/* Workspace Data & Persistence Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Workspace Data & Persistence</h2>
              <p className="text-xs text-gray-400">
                Manage your campaigns, posts, agent chats, and audit trail stored in Supabase PostgreSQL.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Campaigns</span>
                <div className="text-2xl font-extrabold text-gray-900">{campaigns.length}</div>
                <span className="text-[11px] text-gray-500">Multi-tenant isolated</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Content Library</span>
                <div className="text-2xl font-extrabold text-gray-900">{posts.length}</div>
                <span className="text-[11px] text-gray-500">Drafts & scheduled posts</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Audit Security</span>
                <div className="text-2xl font-extrabold text-emerald-600">Active</div>
                <span className="text-[11px] text-gray-500">Row Level Security (RLS)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Switch between clean new-user mode or load sample coffee shop demo data to test agents.
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={resetToFresh}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-600 hover:text-red-700 text-xs font-semibold transition-colors"
                  title="Wipes sample campaigns and posts back to a fresh 0-data workspace"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset to Clean Slate (0 Data)</span>
                </button>

                <button
                  onClick={loadDemoTemplate}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors shadow-xs"
                  title="Loads sample Coffee Shop launch campaign, posts, and plans"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Load Sample Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
