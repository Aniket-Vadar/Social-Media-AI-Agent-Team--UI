'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Clock, Paperclip, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AgentId } from '@/types';

interface OfficeCanvasProps {
  className?: string;
  showDetails?: boolean;
}

export const OfficeCanvas: React.FC<OfficeCanvasProps> = ({ className = '', showDetails = true }) => {
  const router = useRouter();
  const { agents, setActiveAgentId } = useApp();
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // Desk hotspots coordinates mapped to the isometric office background
  const deskMarkers: { id: AgentId; name: string; top: string; left: string }[] = [
    { id: 'researcher', name: 'Research Agent', top: '51%', left: '18%' },
    { id: 'creator', name: 'Creator Agent', top: '38%', left: '60%' },
    { id: 'scheduler', name: 'Scheduler Agent', top: '50%', left: '76%' },
    { id: 'analytics', name: 'Analytics Agent', top: '75%', left: '62%' },
  ];

  const handleOpenAgent = (agentId: AgentId) => {
    setActiveAgentId(agentId);
    router.push('/agents');
  };

  return (
    <div
      className={`relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-amber-50/20 select-none group ${className}`}
    >
      {/* Office Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/office-wooden.png"
          alt="AI Agent Office Canvas"
          fill
          priority
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
        {/* Subtle ambient lighting vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Desk Hotspot Markers */}
      {deskMarkers.map(marker => {
        const agent = agents.find(a => a.id === marker.id);
        const isRunning = agent?.status === 'working';
        const isSelected = selectedAgentId === marker.id;

        return (
          <div
            key={marker.id}
            style={{ top: marker.top, left: marker.left }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            {/* Clickable Desk Tag */}
            <button
              onClick={() => setSelectedAgentId(prev => (prev === marker.id ? null : marker.id))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                  : 'bg-white/95 text-gray-800 hover:bg-white hover:shadow-xl border border-gray-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-sky-500 animate-ping' : 'bg-gray-400'
                }`}
              />
              <span className="truncate max-w-[110px]">{marker.name}</span>
            </button>

            {/* Pulse Indicator on Desk */}
            {isRunning && (
              <span className="absolute -inset-1 rounded-full bg-sky-400/30 animate-pulse pointer-events-none -z-10" />
            )}
          </div>
        );
      })}

      {/* Desk Popover Details (Matches YouTube screenshot ref 10) */}
      {selectedAgent && showDetails && (
        <div className="absolute top-4 right-4 z-30 w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                <Image
                  src={selectedAgent.avatar}
                  alt={selectedAgent.name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">{selectedAgent.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedAgent.status === 'working' ? 'bg-sky-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-[10px] font-medium text-sky-600 capitalize">
                    {selectedAgent.status === 'working' ? 'Running' : selectedAgent.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedAgentId(null)}
              className="text-gray-400 hover:text-gray-600 text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="py-2.5 text-xs">
            <div className="text-[11px] text-gray-500 line-clamp-2 font-medium">
              {selectedAgent.currentTask || selectedAgent.shortDesc}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-2 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {selectedAgent.taskDuration || '0s'}
              </span>
              <span className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {selectedAgent.filesCount || 0} files
              </span>
            </div>
          </div>

          <button
            onClick={() => handleOpenAgent(selectedAgent.id)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-indigo-50 text-indigo-600 text-xs font-semibold transition-colors border border-gray-100"
          >
            <span>Open {selectedAgent.name}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Status Bar at Bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-black/40 backdrop-blur-md text-white text-xs border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="font-semibold text-white/90">Autonomous Office</span>
          <span className="text-white/60 text-[11px] hidden sm:inline">• 4 agents stationed</span>
        </div>
        <button
          onClick={() => {
            setActiveAgentId('master');
            router.push('/agents');
          }}
          className="text-xs font-semibold text-white hover:text-amber-200 transition-colors flex items-center gap-1"
        >
          <span>Chat with Master Agent</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
