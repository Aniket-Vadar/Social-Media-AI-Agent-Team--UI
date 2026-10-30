'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Upload,
  Sparkles,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Calendar,
  Clock,
  Globe,
  Instagram,
  Check,
  Wand2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PlatformType } from '@/types';

export const CreatePostModal: React.FC = () => {
  const {
    isCreatePostOpen,
    setIsCreatePostOpen,
    addPost,
    activeCampaign,
    setIsImageEditorOpen,
    setEditingImage,
  } = useApp();

  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [title, setTitle] = useState('Freshly Brewed Happiness');
  const [caption, setCaption] = useState(
    'Your next favorite coffee stop is here. Introducing a new place to slow down, sip well, and start your day with artisan roasts and fresh bakes ☕✨'
  );
  const [platform, setPlatform] = useState<PlatformType>('instagram');
  const [mediaUrl, setMediaUrl] = useState('/images/coffee-latte.jpg');
  const [date, setDate] = useState('2026-10-16');
  const [time, setTime] = useState('21:00');
  const [timezone, setTimezone] = useState('America/New_York (GMT-4)');
  const [hashtags, setHashtags] = useState(['#ArtisanCoffee', '#CoffeeLovers', '#ColdBrewLaunch']);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  if (!isCreatePostOpen) return null;

  const handleGenerateAI = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setTitle('Morning Roasts & Flaky Croissants');
      setCaption(
        'Slow down. Breathe in the roasted aroma. The morning ritual you’ve been dreaming of is ready for you at our coffee bar 🥐☕'
      );
      setHashtags(['#CoffeeLovers', '#MorningRitual', '#CafeVibes', '#SpecialtyCoffee']);
      setMediaUrl('/images/coffee-work.jpg');
      setIsGeneratingAI(false);
    }, 1200);
  };

  const handleScheduleSubmit = () => {
    addPost({
      title,
      caption,
      hashtags,
      mediaUrl,
      status: 'scheduled',
      platform,
      scheduledAt: `${date}T${time}:00Z`,
      scheduledDisplay: `Fri, Oct 16, 9:00 PM EDT`,
    });
    setIsCreatePostOpen(false);
  };

  const handleSaveDraft = () => {
    addPost({
      title,
      caption,
      hashtags,
      mediaUrl,
      status: 'draft',
      platform,
      scheduledAt: `${date}T${time}:00Z`,
      scheduledDisplay: `Unscheduled draft`,
    });
    setIsCreatePostOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              ✦
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Create & Schedule Post</h2>
              <p className="text-xs text-gray-400">Campaign: {activeCampaign.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex p-1 bg-gray-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setMode('manual')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  mode === 'manual' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                  mode === 'ai' ? 'bg-brand-500 text-white shadow-xs' : 'text-gray-500'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>AI-Assisted</span>
              </button>
            </div>

            <button
              onClick={() => setIsCreatePostOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Form (60%) + Right Live Phone Mockup (40%) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* Form Left Side */}
          <div className="md:col-span-7 p-6 space-y-6 border-r border-gray-100 overflow-y-auto">
            {/* AI Generator Banner if in AI mode */}
            {mode === 'ai' && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center flex-shrink-0">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-indigo-950">Ask Creator Agent</span>
                    <p className="text-[11px] text-indigo-700/80 mt-0.5">
                      Generate copy, hashtags, and visual matching campaign brand voice.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingAI ? 'Thinking...' : 'Generate with AI'}</span>
                </button>
              </div>
            )}

            {/* Post Details */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">Post Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Cold Brew Weekend Special"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-800">Caption</label>
                  <span className="text-[11px] text-gray-400">{caption.length} / 2,200</span>
                </div>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Write your engaging caption..."
                  className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              {/* Hashtags */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">Hashtags</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-gray-200 bg-gray-50/50">
                  {hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] font-medium text-brand-600 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => setHashtags(hashtags.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="+ add hashtag"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        setHashtags([...hashtags, val.startsWith('#') ? val : `#${val}`]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="bg-transparent text-xs text-gray-700 outline-none px-1 py-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Media Section (Matches ref 15) */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Media</h4>
                  <p className="text-[11px] text-gray-400">
                    Up to 10 images and one video. The first one is the cover.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingImage(mediaUrl);
                    setIsImageEditorOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-brand-600 text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Image Editor</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Thumbnail Preview */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 group">
                  <Image src={mediaUrl} alt="Cover image" fill className="object-cover" />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold">
                    ★ Cover
                  </span>
                </div>

                {/* Dropzone Upload */}
                <div className="flex-1 h-24 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-400 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-gray-50/50">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs font-semibold text-gray-700">Drop images or a video here</span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 10MB</span>
                </div>
              </div>
            </div>

            {/* Schedule Section (Matches ref 15) */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <h4 className="text-xs font-bold text-gray-800">Schedule</h4>
                <p className="text-[11px] text-gray-400">When it goes live, in the time zone you pick</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600">Time zone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Publishes to Instagram from your Blotato calendar when scheduled.</span>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup (Matches screenshot ref 15) */}
          <div className="md:col-span-5 p-6 bg-gray-50 flex items-center justify-center">
            <div className="w-full max-w-[320px] bg-white rounded-[2.5rem] border-[6px] border-gray-900 shadow-2xl overflow-hidden flex flex-col text-xs select-none">
              {/* Phone Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-pink-600 flex items-center justify-center text-white font-bold text-[10px]">
                    TP
                  </div>
                  <div>
                    <h5 className="font-bold text-[11px] text-gray-900 leading-none">tubegurujipro</h5>
                    <span className="text-[9px] text-gray-400">Original audio</span>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">•••</span>
              </div>

              {/* Phone Post Image */}
              <div className="relative w-full aspect-square bg-gray-100">
                <Image src={mediaUrl} alt="Preview" fill className="object-cover" />
              </div>

              {/* Action Bar */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Heart className="w-4 h-4 hover:text-red-500 cursor-pointer" />
                    <MessageCircle className="w-4 h-4 hover:text-blue-500 cursor-pointer" />
                    <Send className="w-4 h-4 hover:text-indigo-500 cursor-pointer" />
                  </div>
                  <Bookmark className="w-4 h-4 text-gray-700" />
                </div>

                <div className="text-[10px] font-bold text-gray-900">Be the first to like this</div>

                <div className="text-[11px] text-gray-800 leading-tight">
                  <span className="font-bold mr-1.5">tubegurujipro</span>
                  <span className="line-clamp-3">{caption}</span>
                </div>

                <div className="text-[10px] text-brand-600 flex flex-wrap gap-1">
                  {hashtags.map((h, i) => (
                    <span key={i}>{h}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button
            onClick={() => setIsCreatePostOpen(false)}
            className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-800 font-semibold text-xs"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors"
            >
              Save draft
            </button>
            <button
              onClick={handleScheduleSubmit}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-colors"
            >
              Schedule post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
