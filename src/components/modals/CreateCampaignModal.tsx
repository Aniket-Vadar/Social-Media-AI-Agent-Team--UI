'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Rocket,
  Sparkles,
  Megaphone,
  Flame,
  Star,
  Heart,
  Camera,
  Globe,
  Upload,
  Check,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { OfficeTheme } from '@/types';

export const CreateCampaignModal: React.FC = () => {
  const { isCreateCampaignOpen, setIsCreateCampaignOpen, createCampaign } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [campaignName, setCampaignName] = useState('');
  const [selectedLogo, setSelectedLogo] = useState('🔥');
  const [selectedColor, setSelectedColor] = useState('#F59E0B');
  const [selectedOffice, setSelectedOffice] = useState<OfficeTheme>('wooden');

  if (!isCreateCampaignOpen) return null;

  const logoOptions = [
    { icon: '🚀', color: '#6D5EF5' },
    { icon: '✨', color: '#8B5CF6' },
    { icon: '📢', color: '#F97316' },
    { icon: '🌿', color: '#10B981' },
    { icon: '🔥', color: '#F59E0B' },
    { icon: '⭐', color: '#0EA5E9' },
    { icon: '❤️', color: '#EC4899' },
    { icon: '📷', color: '#475569' },
    { icon: '🌐', color: '#14B8A6' },
  ];

  const handleCreate = () => {
    if (!campaignName.trim()) return;
    createCampaign({
      name: campaignName.trim(),
      logo: selectedLogo,
      officeTheme: selectedOffice,
      color: selectedColor,
    });
    setIsCreateCampaignOpen(false);
    setStep(1);
    setCampaignName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-xl flex flex-col overflow-hidden">
        {/* Step Indicator Header (Matches ref 2 & 3) */}
        <div className="px-8 pt-6 pb-2 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1 ? 'bg-blue-600 text-white font-bold' : 'bg-emerald-600 text-white'
                }`}
              >
                {step === 1 ? '1' : '✓'}
              </span>
              <span className={step === 1 ? 'text-gray-900 font-bold' : 'text-gray-400'}>Campaign</span>
            </div>
            <div className="w-8 h-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? 'bg-blue-600 text-white font-bold' : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </span>
              <span className={step === 2 ? 'text-gray-900 font-bold' : 'text-gray-400'}>Office space</span>
            </div>
          </div>

          <button
            onClick={() => setIsCreateCampaignOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: CAMPAIGN INFO (Matches ref 2) */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-gray-950">Create a new campaign</h2>
              <p className="text-xs text-gray-400">Give it a name and a logo. You can change these later.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800">Campaign name</label>
              <input
                type="text"
                autoFocus
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="e.g. Summer Product Launch"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-gray-900 shadow-inner"
              />
            </div>

            {/* Logo Picker */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-800">Logo</label>
              <div className="grid grid-cols-5 gap-2.5">
                {logoOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedLogo(opt.icon);
                      setSelectedColor(opt.color);
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all ${
                      selectedLogo === opt.icon
                        ? 'ring-2 ring-blue-600 ring-offset-2 scale-105 shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    style={{ backgroundColor: `${opt.color}15`, color: opt.color }}
                  >
                    {opt.icon}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => alert('Custom logo upload')}
                  className="w-12 h-12 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-semibold mt-0.5">Upload</span>
                </button>
              </div>
            </div>

            {/* Live Campaign Card Preview */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/80 flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs"
                style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}
              >
                {selectedLogo}
              </div>
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-gray-900 truncate">
                  {campaignName || 'Your campaign'}
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Preview</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={!campaignName.trim()}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE OFFICE SPACE (Matches ref 3) */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-gray-950">Choose an office space</h2>
                <p className="text-xs text-gray-400">Pick where your AI agents will work on your campaign.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold border border-pink-100">
                ❤️ Tubeguruji Pro
              </span>
            </div>

            {/* Office Thumbnails Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Option 1: Modern Office */}
              <div
                onClick={() => setSelectedOffice('modern')}
                className={`group rounded-2xl border-2 p-2 cursor-pointer transition-all ${
                  selectedOffice === 'modern'
                    ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src="/images/modern-office-thumb.png"
                    alt="Modern Office"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {selectedOffice === 'modern' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="pt-2 px-1 text-xs font-bold text-gray-800">Modern Office</div>
              </div>

              {/* Option 2: Wooden Office */}
              <div
                onClick={() => setSelectedOffice('wooden')}
                className={`group rounded-2xl border-2 p-2 cursor-pointer transition-all ${
                  selectedOffice === 'wooden'
                    ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src="/images/wooden-office-thumb.png"
                    alt="Wooden Office"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {selectedOffice === 'wooden' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="pt-2 px-1 text-xs font-bold text-gray-800">Wooden Office</div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleCreate}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-200 transition-colors"
              >
                Create Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
