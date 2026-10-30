'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Instagram,
  Edit,
  Trash2,
  CalendarClock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const PostDetailSheet: React.FC = () => {
  const {
    selectedPostForDetail,
    setSelectedPostForDetail,
    deletePost,
    reschedulePost,
    setIsImageEditorOpen,
    setEditingImage,
  } = useApp();

  if (!selectedPostForDetail) return null;

  const post = selectedPostForDetail;

  const handleDelete = () => {
    deletePost(post.id);
    setSelectedPostForDetail(null);
  };

  const handleEditImage = () => {
    setEditingImage(post.mediaUrl);
    setIsImageEditorOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white h-full w-full max-w-md shadow-2xl border-l border-gray-100 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="font-bold text-sm text-gray-900">Post Details</h3>
            </div>
            <button
              onClick={() => setSelectedPostForDetail(null)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media Preview */}
          <div className="p-5 space-y-4">
            {post.mediaUrl && (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <Image src={post.mediaUrl} alt={post.title} fill className="object-cover" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold capitalize">
                    {post.status}
                  </span>
                </div>
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-pink-600 text-white flex items-center justify-center shadow-md">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Post Title & Meta */}
            <div className="space-y-1">
              <h4 className="font-bold text-base text-gray-950">{post.title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{post.scheduledDisplay}</span>
                {post.createdBy === 'agent' && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px]">
                    ✨ Created by AI
                  </span>
                )}
              </div>
            </div>

            {/* Caption */}
            <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
              {post.caption}
            </div>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((h, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-indigo-50 text-brand-600 font-medium text-[11px]"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Engagement Metrics if published or scheduled */}
            {post.engagement && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <h5 className="font-bold text-xs text-gray-800">Engagement Metrics</h5>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <Heart className="w-3.5 h-3.5 text-pink-500 mx-auto mb-1" />
                    <span className="font-bold text-xs text-gray-900">{post.engagement.likes}</span>
                    <span className="text-[9px] text-gray-400 block">Likes</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
                    <span className="font-bold text-xs text-gray-900">{post.engagement.comments}</span>
                    <span className="text-[9px] text-gray-400 block">Comments</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <Share2 className="w-3.5 h-3.5 text-indigo-500 mx-auto mb-1" />
                    <span className="font-bold text-xs text-gray-900">{post.engagement.shares}</span>
                    <span className="text-[9px] text-gray-400 block">Shares</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
                    <span className="font-bold text-xs text-gray-900">{post.engagement.reach}</span>
                    <span className="text-[9px] text-gray-400 block">Reach</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 space-y-2 bg-gray-50/50">
          <button
            onClick={handleEditImage}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open in AI Image Editor</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newTime = prompt('Reschedule post (e.g. Sat, Oct 24, 7:00 PM EDT):', post.scheduledDisplay);
                if (newTime) {
                  reschedulePost(post.id, new Date().toISOString(), newTime);
                  setSelectedPostForDetail(null);
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
            >
              <CalendarClock className="w-3.5 h-3.5 text-gray-500" />
              <span>Reschedule</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 text-red-600 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
