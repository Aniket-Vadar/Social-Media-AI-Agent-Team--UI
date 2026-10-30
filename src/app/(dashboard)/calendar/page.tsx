'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Post } from '@/types';

export default function CalendarPage() {
  const { posts, setIsCreatePostOpen, setSelectedPostForDetail } = useApp();

  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedTimezone, setSelectedTimezone] = useState('America/Ojinaga (GMT-5)');

  // Calendar days grid for October 2026 (Mon Sep 28 - Sun Nov 1)
  const calendarDays = [
    // Week 1
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    // Week 2
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    // Week 3
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true, isToday: true },
    {
      day: 16,
      isCurrentMonth: true,
      post: posts.find(p => p.id === 'post-1'),
    },
    {
      day: 17,
      isCurrentMonth: true,
      post: posts.find(p => p.id === 'post-2'),
    },
    { day: 18, isCurrentMonth: true },
    // Week 4
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    // Week 5
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Calendar"
        subtitle="Plan when your content goes live"
      />

      {/* Toolbar (Matches screenshot ref 17) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm select-none">
        {/* Left: Navigation & Month */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {}}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-base font-bold text-gray-900 ml-1">{currentMonth}</h2>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
            • 2 scheduled in October
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
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
          <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
            <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px]">
              <Instagram className="w-3.5 h-3.5" />
            </div>
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">
              <Video className="w-3.5 h-3.5" />
            </div>
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
              <Youtube className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Timezone Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-600">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span>{selectedTimezone}</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid (Matches ref 17) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden select-none">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50 text-center py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
          <div>SUN</div>
        </div>

        {/* 5 Weeks Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100">
          {calendarDays.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (!cell.post) setIsCreatePostOpen(true);
              }}
              className={`min-h-[105px] p-2.5 flex flex-col justify-between transition-colors relative cursor-pointer ${
                cell.isCurrentMonth ? 'bg-white hover:bg-gray-50/60' : 'bg-gray-50/30 text-gray-300'
              }`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    cell.isToday
                      ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs font-bold'
                      : cell.isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-300'
                  }`}
                >
                  {cell.day}
                </span>
              </div>

              {/* Scheduled Post Chip (Screenshot ref 17) */}
              {cell.post && (
                <div
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedPostForDetail(cell.post!);
                  }}
                  className="mt-1 p-1.5 rounded-xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-all flex items-center gap-2 group cursor-pointer"
                >
                  {cell.post.mediaUrl && (
                    <div className="w-7 h-7 rounded-lg overflow-hidden relative flex-shrink-0">
                      <Image
                        src={cell.post.mediaUrl}
                        alt="Post thumb"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-[10px] text-gray-900 truncate leading-tight group-hover:text-brand-600">
                      {cell.post.title}
                    </h5>
                    <span className="text-[9px] text-gray-400 font-mono block">8:00 PM</span>
                  </div>

                  <span className="w-4 h-4 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[9px] flex-shrink-0">
                    <Instagram className="w-2.5 h-2.5" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
