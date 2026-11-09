'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Instagram,
  Video,
  Youtube,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Post } from '@/types';

export default function CalendarPage() {
  const { posts, setIsCreatePostOpen, setSelectedPostForDetail } = useApp();

  // Active viewing date: default to November 2026
  const [viewDate, setViewDate] = useState<Date>(() => new Date(2026, 10, 9)); // Month 10 is November (0-indexed)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York (EST)');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  // Month navigation
  const goToPrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setViewDate(new Date(2026, 10, 9));
  };

  const monthYearLabel = useMemo(() => {
    return viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  // Posts in this month count
  const monthPostsCount = useMemo(() => {
    const yr = viewDate.getFullYear();
    const mo = viewDate.getMonth();
    return posts.filter(p => {
      if (!p.scheduledAt) return false;
      const d = new Date(p.scheduledAt);
      return !isNaN(d.getTime()) && d.getFullYear() === yr && d.getMonth() === mo && p.status === 'scheduled';
    }).length;
  }, [posts, viewDate]);

  // Generate calendar days matrix
  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of current month
    const firstDayOfMonth = new Date(year, month, 1);
    // Day of week: 0 = Sun, 1 = Mon ... 6 = Sat -> convert to Monday-first (0 = Mon ... 6 = Sun)
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    // Total days in current month
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    // Total days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      posts: Post[];
    }> = [];

    // 1. Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const date = new Date(year, month - 1, dayNum);
      days.push({
        date,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        posts: [],
      });
    }

    // 2. Days of current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const date = new Date(year, month, d);
      const isToday =
        year === 2026 && month === 10 && d === 9; // Today: Nov 9, 2026

      // Match posts scheduled for this day
      const matchedPosts = posts.filter(post => {
        if (!post.scheduledAt) return false;
        try {
          const postDate = new Date(post.scheduledAt);
          if (isNaN(postDate.getTime())) return false;
          return (
            postDate.getFullYear() === year &&
            postDate.getMonth() === month &&
            postDate.getDate() === d &&
            (filterPlatform === 'all' || post.platform === filterPlatform)
          );
        } catch {
          return false;
        }
      });

      days.push({
        date,
        dayNumber: d,
        isCurrentMonth: true,
        isToday,
        posts: matchedPosts,
      });
    }

    // 3. Leading days for next month to complete standard 35 or 42 grid cells
    const remainingSlots = (7 - (days.length % 7)) % 7;
    const totalNeeded = days.length + remainingSlots < 35 ? 35 - days.length : remainingSlots;

    for (let d = 1; d <= totalNeeded; d++) {
      const date = new Date(year, month + 1, d);
      days.push({
        date,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
        posts: [],
      });
    }

    return days;
  }, [viewDate, posts, filterPlatform]);

  return (
    <div className="space-y-6">
      <Header
        title="Calendar"
        subtitle="Live automated schedule & peak audience posting windows"
      />

      {/* Interactive Month & View Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm select-none">
        {/* Left: Navigation, Today Button & Current Month Display */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-2xs"
          >
            Today
          </button>

          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/80">
            <button
              onClick={goToPrevMonth}
              title="Previous Month"
              className="p-1 rounded-lg hover:bg-white hover:text-gray-900 text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextMonth}
              title="Next Month"
              className="p-1 rounded-lg hover:bg-white hover:text-gray-900 text-gray-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-gray-900 ml-1">{monthYearLabel}</h2>

          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>{monthPostsCount} scheduled in {viewDate.toLocaleString('en-US', { month: 'short' })}</span>
          </span>
        </div>

        {/* Right Controls: View Switcher, Create Post, Platform Filter, Timezone */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create post</span>
          </button>

          {/* Social Platforms filter */}
          <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
            <button
              onClick={() => setFilterPlatform(prev => (prev === 'instagram' ? 'all' : 'instagram'))}
              title="Filter Instagram posts"
              className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] transition-transform ${
                filterPlatform === 'instagram'
                  ? 'ring-2 ring-pink-500 ring-offset-1 scale-105'
                  : 'opacity-90 hover:opacity-100'
              } bg-gradient-to-tr from-amber-500 to-pink-600 shadow-xs`}
            >
              <Instagram className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFilterPlatform(prev => (prev === 'tiktok' ? 'all' : 'tiktok'))}
              title="Filter TikTok/Reel video posts"
              className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] transition-transform ${
                filterPlatform === 'tiktok'
                  ? 'ring-2 ring-black ring-offset-1 scale-105'
                  : 'opacity-90 hover:opacity-100'
              } bg-black shadow-xs`}
            >
              <Video className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFilterPlatform(prev => (prev === 'youtube' ? 'all' : 'youtube'))}
              title="Filter YouTube posts"
              className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] transition-transform ${
                filterPlatform === 'youtube'
                  ? 'ring-2 ring-red-600 ring-offset-1 scale-105'
                  : 'opacity-90 hover:opacity-100'
              } bg-red-600 shadow-xs`}
            >
              <Youtube className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timezone */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-600 bg-white">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span>{selectedTimezone}</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Day of Week Headers (Monday to Sunday) */}
        <div className="grid grid-cols-7 border-b border-gray-100 text-center text-xs font-bold text-gray-500 bg-gray-50/50 py-3">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Calendar Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 bg-white">
          {calendarGrid.map((cell, idx) => (
            <div
              key={idx}
              className={`min-h-[125px] p-2 flex flex-col justify-between transition-colors relative group ${
                cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50/40'
              } hover:bg-gray-50/70`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold inline-flex items-center justify-center ${
                    cell.isToday
                      ? 'w-6 h-6 rounded-full bg-brand-500 text-white font-bold shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-gray-800'
                      : 'text-gray-300'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Quick Add Button on Hover */}
                {cell.isCurrentMonth && (
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    title="Add post on this date"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Scheduled Posts for this Day */}
              <div className="space-y-1.5 my-1 flex-1 overflow-y-auto max-h-[110px]">
                {cell.posts.map(post => (
                  <div
                    key={post.id}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedPostForDetail(post);
                    }}
                    className="p-1.5 rounded-xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex items-center gap-2 group/card cursor-pointer hover:border-brand-300"
                  >
                    {post.mediaUrl && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-100">
                        <Image
                          src={post.mediaUrl}
                          alt={post.title}
                          fill
                          unoptimized
                          className="object-cover group-hover/card:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            post.status === 'scheduled'
                              ? 'bg-blue-500'
                              : post.status === 'published'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="font-bold text-[10px] text-gray-800 truncate block">
                          {post.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="truncate">
                          {post.scheduledDisplay || 'Scheduled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty slot spacer if no posts */}
              {cell.posts.length === 0 && <div className="h-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
