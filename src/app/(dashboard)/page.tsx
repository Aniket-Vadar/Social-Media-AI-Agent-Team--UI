'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { OfficeCanvas } from '@/components/office/OfficeCanvas';

export default function OverviewPage() {
  const router = useRouter();
  const { activeCampaign, posts, setActiveAgentId, setIsCreatePostOpen } = useApp();

  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const nextPost = scheduledPosts[0];

  const handleChatMaster = () => {
    setActiveAgentId('master');
    router.push('/agents');
  };

  return (
    <div className="space-y-6">
      <Header
        title="Overview"
        subtitle="A snapshot of your campaign at a glance"
      />

      {/* Main Grid: Left cards (60%) + Right Office Canvas (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Greeting Banner */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
              <span>☀️ Good afternoon, Saloni</span>
              <span className="inline-block animate-wave">👋</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">
              Your AI Creative Team is on it.
            </h2>
            <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
              From trends to content to posting, your agents work together to turn ideas into real growth.
            </p>
          </div>

          {/* Master Agent Feature Card */}
          <div className="relative overflow-hidden rounded-3xl p-5 border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
                <Sparkles className="w-6 h-6 fill-white/20" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-gray-900">Master Agent</span>
                  <span className="text-xs">🪄</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                  Tell it what you need. It plans the work, assigns your agents and reports back.
                </p>
              </div>
            </div>

            <button
              onClick={handleChatMaster}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all flex-shrink-0"
            >
              <span>Chat with Master Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Campaign Status Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: `${activeCampaign.color}15`, color: activeCampaign.color }}
                >
                  {activeCampaign.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900">{activeCampaign.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In progress
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Researching trends, creating engaging content and scheduling posts to grow your brand.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{activeCampaign.progressPercent}%</div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-brand-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${activeCampaign.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>{activeCampaign.postsPublished} of {activeCampaign.totalPosts} posts published</span>
                <span>Auto-pilot on</span>
              </div>
            </div>
          </div>

          {/* Upcoming Posts Section */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Upcoming posts</h3>
              <Link
                href="/calendar"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
              >
                <span>View calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {nextPost ? (
              <div
                onClick={() => router.push('/posts')}
                className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200/80 shadow-xs flex flex-col items-center justify-center text-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">OCT</span>
                    <span className="text-sm font-extrabold text-gray-900 leading-none">16</span>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {nextPost.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="px-1.5 py-0.2 rounded-md bg-pink-50 text-pink-700 text-[10px] font-semibold capitalize">
                        {nextPost.platform}
                      </span>
                      <span>•</span>
                      <span>Fri · 9:00 PM</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-gray-600">No upcoming posts scheduled</p>
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="text-xs font-semibold text-brand-600 hover:underline"
                >
                  Create or ask agents to draft some →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Office Canvas */}
        <div className="lg:col-span-5 h-[530px]">
          <OfficeCanvas className="h-full" />
        </div>
      </div>
    </div>
  );
}
