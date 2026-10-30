'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Layers,
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  CalendarClock,
  Share2,
  CheckCircle2,
  ExternalLink,
  Instagram,
  Video,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Post, PlatformType, PostStatus } from '@/types';
import { Header } from '@/components/layout/Header';

export default function PostsPage() {
  const {
    posts,
    setIsCreatePostOpen,
    reschedulePost,
    unschedulePost,
    deletePost,
    setIsImageEditorOpen,
    setEditingImage,
    setSelectedPostForDetail,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'draft' | 'published'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesTab =
      activeTab === 'all' ? true : post.status === activeTab || (activeTab === 'draft' && post.status === 'draft');
    const matchesPlatform = selectedPlatform === 'all' ? true : post.platform === selectedPlatform;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.caption.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesPlatform && matchesSearch;
  });

  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;

  const handleEditReschedule = (post: Post) => {
    setActiveMenuPostId(null);
    const newDate = prompt('Enter new date and time for schedule (e.g. Sat, Oct 24, 7:00 PM EDT):', post.scheduledDisplay);
    if (newDate) {
      reschedulePost(post.id, new Date().toISOString(), newDate);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Posts"
        subtitle="Drafts, scheduled and published content"
      />

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 select-none">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-gray-200/80 shadow-xs text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>All</span>
            <span className="opacity-70 text-[10px]">{posts.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'scheduled'
                ? 'bg-brand-500 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Scheduled</span>
            <span className="opacity-70 text-[10px]">{scheduledCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'draft'
                ? 'bg-amber-500 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Drafts</span>
            <span className="opacity-70 text-[10px]">{draftCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('published')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'published'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Published</span>
            <span className="opacity-70 text-[10px]">{publishedCount}</span>
          </button>
        </div>

        {/* Platform Icons Filter & Create Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-xs">
            <button
              onClick={() => setSelectedPlatform(selectedPlatform === 'instagram' ? 'all' : 'instagram')}
              className={`p-2 rounded-xl transition-all ${
                selectedPlatform === 'instagram'
                  ? 'bg-pink-100 text-pink-600 ring-2 ring-pink-400'
                  : 'text-gray-400 hover:text-pink-600 hover:bg-gray-50'
              }`}
              title="Filter by Instagram"
            >
              <Instagram className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedPlatform(selectedPlatform === 'tiktok' ? 'all' : 'tiktok')}
              className={`p-2 rounded-xl transition-all ${
                selectedPlatform === 'tiktok'
                  ? 'bg-black text-white'
                  : 'text-gray-400 hover:text-black hover:bg-gray-50'
              }`}
              title="Filter by TikTok"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Posts Cards Grid (Matches screenshot ref 13 & 14) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(post => {
          const isMenuOpen = activeMenuPostId === post.id;

          return (
            <div
              key={post.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col group relative"
            >
              {/* Media Thumbnail Area */}
              <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer">
                {post.mediaUrl ? (
                  <Image
                    src={post.mediaUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onClick={() => setSelectedPostForDetail(post)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Layers className="w-8 h-8" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md flex items-center gap-1.5 ${
                      post.status === 'scheduled'
                        ? 'bg-blue-600 text-white'
                        : post.status === 'published'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="capitalize">{post.status}</span>
                  </span>
                </div>

                {/* Platform Badge (Pink circle for Instagram) */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Post Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      onClick={() => setSelectedPostForDetail(post)}
                      className="font-bold text-sm text-gray-900 hover:text-brand-600 transition-colors cursor-pointer line-clamp-1"
                    >
                      {post.title}
                    </h3>

                    {/* Three-dots Menu Button */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setActiveMenuPostId(isMenuOpen ? null : post.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu (Screenshot ref 14) */}
                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveMenuPostId(null)}
                          />
                          <div className="absolute right-0 top-8 z-40 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => handleEditReschedule(post)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-left"
                            >
                              <CalendarClock className="w-3.5 h-3.5 text-gray-500" />
                              <span>Edit & reschedule</span>
                            </button>
                            <button
                              onClick={() => {
                                unschedulePost(post.id);
                                setActiveMenuPostId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-left"
                            >
                              <Calendar className="w-3.5 h-3.5 text-gray-500" />
                              <span>Unschedule</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingImage(post.mediaUrl);
                                setIsImageEditorOpen(true);
                                setActiveMenuPostId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors text-left"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                              <span>AI Image Editor</span>
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => {
                                deletePost(post.id);
                                setActiveMenuPostId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>

                  {/* Blotato Publishing Status */}
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-1">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>Scheduled in Blotato</span>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[11px] font-medium text-gray-600">{post.scheduledDisplay}</span>
                  </div>

                  {post.createdBy === 'agent' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-brand-600 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3" />
                      <span>AI</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-gray-100">
          <Layers className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-sm font-bold text-gray-800">No posts found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search filters or ask the Creator Agent to generate fresh posts.
          </p>
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition-colors shadow-xs"
          >
            Create new post
          </button>
        </div>
      )}
    </div>
  );
}
