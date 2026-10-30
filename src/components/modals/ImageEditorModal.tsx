'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Sparkles,
  RotateCcw,
  Undo2,
  Crop,
  Sliders,
  Type,
  Wand2,
  Check,
  Layers,
  ArrowRight,
  SunMedium,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const ImageEditorModal: React.FC = () => {
  const { isImageEditorOpen, setIsImageEditorOpen, editingImage } = useApp();

  const [activeTab, setActiveTab] = useState<'magic' | 'crop' | 'adjust' | 'text'>('magic');
  const [promptText, setPromptText] = useState('');
  const [bgPromptText, setBgPromptText] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '9:16' | '16:9'>('1:1');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isImageEditorOpen) return null;

  const handleApplyEffect = (effectName: string) => {
    setIsProcessing(true);
    setActiveEffect(effectName);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setActiveEffect(null);
    setAspectRatio('1:1');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Edit image</h2>
              <p className="text-xs text-gray-400">AI edits, crops, adjustments and text, powered by ImageKit</p>
            </div>
          </div>

          <button
            onClick={() => setIsImageEditorOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body: Left Canvas (65%) + Right Controls (35%) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[500px]">
          {/* Canvas Area */}
          <div className="md:col-span-7 bg-checkerboard p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
            {/* Top Canvas Controls */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <button
                onClick={() => alert('Undid last adjustment')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-xs border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-white"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-xs border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Image Preview with Filter/Effect styles */}
            <div
              className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 max-h-[420px] ${
                aspectRatio === '1:1'
                  ? 'w-[360px] aspect-square'
                  : aspectRatio === '4:5'
                  ? 'w-[320px] aspect-[4/5]'
                  : aspectRatio === '9:16'
                  ? 'w-[240px] aspect-[9/16]'
                  : 'w-[420px] aspect-video'
              }`}
            >
              <Image
                src={editingImage}
                alt="Editing Canvas"
                fill
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${
                    activeEffect === 'warm' ? 'sepia(30%)' : ''
                  }`,
                }}
                className={`object-cover transition-all duration-500 ${
                  activeEffect === 'cutout' ? 'scale-90 shadow-2xl ring-4 ring-white' : ''
                }`}
              />

              {/* Processing Spinner Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                  <Sparkles className="w-8 h-8 animate-spin text-amber-300" />
                  <span className="text-xs font-bold">ImageKit AI Processing...</span>
                </div>
              )}

              {/* Active Effect Badge */}
              {activeEffect && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                  {activeEffect} applied
                </div>
              )}
            </div>
          </div>

          {/* Right Toolbar Panel */}
          <div className="md:col-span-5 border-l border-gray-100 flex flex-col bg-white overflow-y-auto">
            {/* Toolbar Tabs (Matches ref 16) */}
            <div className="grid grid-cols-4 border-b border-gray-100 p-2 text-center text-xs font-semibold text-gray-500">
              <button
                onClick={() => setActiveTab('magic')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'magic' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-gray-50'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                <span>AI magic</span>
              </button>
              <button
                onClick={() => setActiveTab('crop')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'crop' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-gray-50'
                }`}
              >
                <Crop className="w-4 h-4" />
                <span>Crop</span>
              </button>
              <button
                onClick={() => setActiveTab('adjust')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'adjust' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-gray-50'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Adjust</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'text' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-gray-50'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Text</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 flex-1 space-y-6 overflow-y-auto">
              {/* TAB 1: AI MAGIC (Matches Screenshot ref 16) */}
              {activeTab === 'magic' && (
                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">One-Click</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => handleApplyEffect('cutout')}
                        className="p-3 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center gap-2.5 text-left transition-all"
                      >
                        <Layers className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-gray-800">Remove background</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleApplyEffect('cutout + shadow')}
                        className="p-3 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center gap-2.5 text-left transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-gray-800">Cut out + shadow</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleApplyEffect('upscale 4x')}
                        className="p-3 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center gap-2.5 text-left transition-all"
                      >
                        <SunMedium className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-gray-800">Upscale</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleApplyEffect('warm')}
                        className="p-3 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center gap-2.5 text-left transition-all"
                      >
                        <Wand2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-gray-800">Retouch</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Edit with a Prompt */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Edit with a Prompt
                    </span>
                    <input
                      type="text"
                      value={promptText}
                      onChange={e => setPromptText(e.target.value)}
                      placeholder="e.g. make it golden hour, add steam rising from the coffee"
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => handleApplyEffect('Prompt: ' + promptText)}
                      disabled={!promptText.trim()}
                      className="w-full py-2 rounded-xl bg-gray-900 hover:bg-black disabled:bg-gray-200 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Apply edit</span>
                    </button>
                  </div>

                  {/* Change Background */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Change Background
                    </span>
                    <input
                      type="text"
                      value={bgPromptText}
                      onChange={e => setBgPromptText(e.target.value)}
                      placeholder="e.g. a sunny beach with soft bokeh"
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => handleApplyEffect('Bg: ' + bgPromptText)}
                      disabled={!bgPromptText.trim()}
                      className="w-full py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold text-xs transition-colors"
                    >
                      Replace background
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CROP */}
              {activeTab === 'crop' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aspect Ratio</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: '1:1', label: '1:1 Square', desc: 'Instagram Feed' },
                      { id: '4:5', label: '4:5 Portrait', desc: 'Instagram Best Fit' },
                      { id: '9:16', label: '9:16 Story/Reel', desc: 'TikTok, Reels, Shorts' },
                      { id: '16:9', label: '16:9 Landscape', desc: 'YouTube, Twitter' },
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => setAspectRatio(r.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          aspectRatio === r.id
                            ? 'border-brand-500 bg-brand-50/40 text-brand-700 font-bold'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold">{r.label}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ADJUST */}
              {activeTab === 'adjust' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={e => setBrightness(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Contrast</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={e => setContrast(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Saturation</span>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={e => setSaturation(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: TEXT */}
              {activeTab === 'text' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-800">Add Text Overlay</label>
                    <input
                      type="text"
                      placeholder="e.g. Freshly Brewed Happiness"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <button
                    onClick={() => handleApplyEffect('Text overlay')}
                    className="w-full py-2 rounded-xl bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition-colors"
                  >
                    Add text to canvas
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white select-none">
          <span className="text-[11px] text-gray-400">
            The original image is kept: edits save as a new image.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImageEditorOpen(false)}
              className="px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsImageEditorOpen(false);
                alert('Transformed image saved and attached to draft!');
              }}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition-colors"
            >
              Save image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
