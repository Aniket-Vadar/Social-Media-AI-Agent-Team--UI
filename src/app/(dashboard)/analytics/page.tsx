'use client';

import React, { useState } from 'react';
import {
  Send,
  Eye,
  CheckCircle2,
  Clock,
  RotateCw,
  BarChart2,
  LineChart,
  ChevronDown,
  Info,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import {
  initialAnalyticsMetrics,
  initialDailyActivity,
  initialEngagementPoints,
} from '@/data/mockData';

export default function AnalyticsPage() {
  const { activeCampaign } = useApp();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('7d');
  const [metricView, setMetricView] = useState<'views' | 'engagement'>('views');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedTime, setSyncedTime] = useState('16 minutes ago');

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncedTime('Just now');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Analytics"
        subtitle="Reach, engagement and growth across channels"
      />

      {/* Top Filter and Sync Bar (Matches screenshot ref 19) */}
      <div className="flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          {/* Date range pills */}
          <div className="flex p-1 bg-white rounded-2xl border border-gray-200/80 shadow-xs text-xs font-semibold">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                dateRange === '7d' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                dateRange === '30d' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => setDateRange('90d')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                dateRange === '90d' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              90 days
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                dateRange === 'custom' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Campaign Selector */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-2xl border border-gray-200/80 shadow-xs text-xs font-semibold text-gray-700">
            <span>{activeCampaign.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Synced {syncedTime}</span>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-600' : ''}`} />
            <span>Sync now</span>
          </button>
        </div>
      </div>

      <div className="text-[11px] font-semibold text-gray-400">
        Oct 9 – Oct 15, 2026 • {activeCampaign.name}
      </div>

      {/* 4 Metric KPI Cards (Matches ref 19) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Posts published */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500">Posts published</span>
              <div className="text-3xl font-extrabold text-gray-900">4</div>
              <span className="text-xs text-emerald-600 font-medium block">None failed</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
            No earlier data to compare
          </div>
        </div>

        {/* Card 2: Total views */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500">Total views</span>
              <div className="text-3xl font-extrabold text-gray-900">—</div>
              <span className="text-xs text-gray-400 font-medium block">Not reported by platforms yet</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
            No earlier data to compare
          </div>
        </div>

        {/* Card 3: Publishing success rate */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500">Publishing success rate</span>
              <div className="text-3xl font-extrabold text-gray-900">100%</div>
              <span className="text-xs text-teal-600 font-medium block">4 of 4 went out</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
            No earlier data to compare
          </div>
        </div>

        {/* Card 4: Est. time saved */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                <span>Est. time saved</span>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900">2h 55m</div>
              <span className="text-xs text-amber-600 font-medium block truncate max-w-[150px]">
                4 platform posts sent
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
            No earlier data to compare
          </div>
        </div>
      </div>

      {/* Charts Grid (Matches ref 19) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        {/* Chart 1: Daily posting activity (Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Daily posting activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">4 published · busiest day Oct 14 (3)</p>
            </div>
            <div className="p-1.5 rounded-xl border border-gray-200 text-gray-400">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-52 flex items-end justify-between gap-3 pt-6 border-b border-gray-100 px-2">
            {initialDailyActivity.map((item, idx) => {
              const maxCount = 4;
              const heightPercent = (item.count / maxCount) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full max-w-[36px] bg-gray-50 rounded-t-xl h-40 flex items-end justify-center p-1">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        item.count > 0
                          ? 'bg-blue-600 group-hover:bg-blue-700 shadow-sm'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 group-hover:text-gray-900">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>Posts scheduled & published per day</span>
            <span className="font-semibold text-blue-600">Peak: 3 posts</span>
          </div>
        </div>

        {/* Chart 2: Views & engagement (Line Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Views & engagement</h3>
              <p className="text-xs text-gray-400 mt-0.5">By the day each post was published</p>
            </div>
            <div className="flex p-1 bg-gray-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setMetricView('views')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  metricView === 'views' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Views
              </button>
              <button
                onClick={() => setMetricView('engagement')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  metricView === 'engagement' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Engagement
              </button>
            </div>
          </div>

          {/* Line Chart / Empty State Message */}
          <div className="h-52 rounded-2xl bg-gray-50/70 border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <TrendingUp className="w-8 h-8 text-gray-300" />
            <h4 className="text-xs font-bold text-gray-800">No views reported yet</h4>
            <p className="text-[11px] text-gray-500 max-w-xs leading-relaxed">
              Your platforms report metrics a while after a post goes out. They&apos;ll show up here after the next sync.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>Direct platform analytics integration</span>
            <span className="text-brand-600 font-semibold">Blotato real-time sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
