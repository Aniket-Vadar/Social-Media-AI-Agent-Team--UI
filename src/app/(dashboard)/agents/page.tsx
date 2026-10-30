'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Send,
  Pause,
  Play,
  Settings,
  MoreVertical,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Laptop,
  Check,
  RotateCcw,
  Ban,
  Maximize2,
  Shield,
  Search,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AgentId } from '@/types';
import { Header } from '@/components/layout/Header';
import { OfficeCanvas } from '@/components/office/OfficeCanvas';

export default function AgentsPage() {
  const {
    agents,
    activeAgent,
    setActiveAgentId,
    pauseResumeAgent,
    chatMessages,
    sendMessage,
    activePlan,
    cancelPlan,
    setIsImageEditorOpen,
    setEditingImage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'computer' | 'settings'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isSandboxRunning, setIsSandboxRunning] = useState(true);
  const [isSandboxTakeover, setIsSandboxTakeover] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const isMaster = activeAgent.id === 'master';
  const isResearcher = activeAgent.id === 'researcher';

  return (
    <div className="space-y-6">
      <Header
        title="AI Agent"
        subtitle="Brief your AI team and review what they're working on"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Agent Workspace (7 Cols) */}
        <div className="lg:col-span-7 flex gap-3">
          {/* Left Vertical Agent Selector Pill (Matches screenshot ref 5) */}
          <div className="w-14 bg-white/90 backdrop-blur-md rounded-full border border-gray-100 shadow-md p-2 flex flex-col items-center gap-3.5 flex-shrink-0 select-none py-3">
            {agents.map(ag => {
              const isSelected = ag.id === activeAgent.id;
              const isRunning = ag.status === 'working';

              return (
                <button
                  key={ag.id}
                  onClick={() => {
                    setActiveAgentId(ag.id);
                    if (ag.id !== 'researcher' && activeTab === 'computer') {
                      setActiveTab('chat');
                    }
                  }}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group ${
                    isSelected
                      ? 'ring-2 ring-brand-500 ring-offset-2 scale-105 shadow-sm'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  title={`${ag.name} (${ag.status})`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border border-gray-200/80 bg-gray-50 flex items-center justify-center">
                    <Image
                      src={ag.avatar}
                      alt={ag.name}
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  </div>

                  {/* Status Indicator Dot */}
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      isRunning ? 'bg-sky-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Agent Center Card */}
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[640px] overflow-hidden">
            {/* Agent Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-xs flex-shrink-0">
                  <Image
                    src={activeAgent.avatar}
                    alt={activeAgent.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-gray-900">{activeAgent.name}</h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          activeAgent.status === 'working' ? 'bg-sky-500 animate-pulse' : 'bg-gray-400'
                        }`}
                      />
                      {activeAgent.status === 'working' ? 'Running' : 'Idle'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate max-w-xs">{activeAgent.shortDesc}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => pauseResumeAgent(activeAgent.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {activeAgent.status === 'working' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Agent Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center px-5 border-b border-gray-100 text-xs font-semibold select-none gap-6">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-3 relative transition-colors ${
                  activeTab === 'chat' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>Chat</span>
                {activeTab === 'chat' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-3 relative transition-colors flex items-center gap-1.5 ${
                  activeTab === 'tasks' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>Tasks</span>
                {activePlan && activePlan.status === 'in_progress' && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
                {activeTab === 'tasks' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </button>

              {/* Sandbox Computer Tab (Available for Researcher or Overview) */}
              <button
                onClick={() => setActiveTab('computer')}
                className={`py-3 relative transition-colors flex items-center gap-1.5 ${
                  activeTab === 'computer' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Computers</span>
                {activeTab === 'computer' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 relative transition-colors ${
                  activeTab === 'settings' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>Settings</span>
                {activeTab === 'settings' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 flex flex-col p-5 overflow-y-auto">
              {/* TAB 1: CHAT */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  {/* Messages Stream */}
                  <div className="space-y-4 overflow-y-auto pr-1">
                    {chatMessages.map(msg => {
                      const isUser = msg.role === 'user';
                      const senderAgent = agents.find(a => a.id === msg.sender) || agents[0];

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isUser && (
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 mt-1">
                              <Image
                                src={senderAgent.avatar}
                                alt={senderAgent.name}
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] rounded-3xl p-4 leading-relaxed space-y-2.5 ${
                              isUser
                                ? 'bg-brand-500 text-white rounded-br-none shadow-brand'
                                : 'bg-gray-50/90 text-gray-800 rounded-bl-none border border-gray-100 shadow-xs'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.content}</p>

                            {/* Plan Card embedded in response */}
                            {msg.plan && (
                              <div className="mt-3 p-3.5 bg-white rounded-2xl border border-indigo-100 text-gray-800 space-y-2 shadow-xs">
                                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700">
                                  <span>Plan #{msg.plan.planNumber}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px]">
                                    {msg.plan.progress}
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-[11px]">
                                  {msg.plan.steps.map(st => (
                                    <div
                                      key={st.id}
                                      className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`w-2 h-2 rounded-full ${
                                            st.status === 'done'
                                              ? 'bg-emerald-500'
                                              : st.status === 'running'
                                              ? 'bg-sky-500 animate-pulse'
                                              : 'bg-gray-400'
                                          }`}
                                        />
                                        <span className="font-medium text-gray-900">{st.title}</span>
                                      </div>
                                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                                        {st.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Post Preview with Approve/Edit/Reject actions */}
                            {msg.postPreview && (
                              <div className="mt-3 p-3 bg-white rounded-2xl border border-gray-200 text-gray-800 space-y-2 shadow-xs">
                                <div className="flex items-center gap-3">
                                  {msg.postPreview.mediaUrl && (
                                    <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                                      <Image
                                        src={msg.postPreview.mediaUrl}
                                        alt="Draft preview"
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-xs truncate">{msg.postPreview.title}</h5>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      {msg.postPreview.caption}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                                  <button
                                    onClick={() => alert('Post approved and queued for publishing!')}
                                    className="flex-1 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-[11px] transition-colors"
                                  >
                                    Approve & Schedule
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (msg.postPreview?.mediaUrl) {
                                        setEditingImage(msg.postPreview.mediaUrl);
                                        setIsImageEditorOpen(true);
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-[11px] transition-colors"
                                  >
                                    Edit Image
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Quick Replies chips */}
                            {msg.quickReplies && (
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {msg.quickReplies.map((reply, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(reply)}
                                    className="px-2.5 py-1 rounded-full bg-white border border-indigo-100 text-indigo-700 hover:bg-indigo-50 font-medium text-[10px] transition-colors shadow-2xs"
                                  >
                                    {reply}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input Composer */}
                  <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder={`Tell ${activeAgent.name} what you need...`}
                        className="w-full pl-4 pr-12 py-3 rounded-2xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs text-gray-900 transition-all shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="absolute right-2 p-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 text-white transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                      <span>Pro-tip: Master Agent delegates tasks automatically across your team.</span>
                      <kbd className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                        Enter ↵
                      </kbd>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  {activePlan ? (
                    <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-sm space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-gray-900">{activePlan.title}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                activePlan.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-sky-50 text-sky-700 border border-sky-200'
                              }`}
                            >
                              {activePlan.status === 'completed' ? 'Completed' : 'In progress'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Plan #{activePlan.planNumber} • {activePlan.timeAgo}
                          </p>
                        </div>

                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-xl">
                          {activePlan.progress}
                        </span>
                      </div>

                      {/* Step Items */}
                      <div className="space-y-2.5">
                        {activePlan.steps.map(step => {
                          const assignedAgent = agents.find(a => a.id === step.agentId) || agents[0];
                          const isRunning = step.status === 'running';
                          const isDone = step.status === 'done';

                          return (
                            <div
                              key={step.id}
                              className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                                  <Image
                                    src={assignedAgent.avatar}
                                    alt={assignedAgent.name}
                                    width={32}
                                    height={32}
                                    className="object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="font-semibold text-xs text-gray-900">{step.title}</h4>
                                  <p className="text-[11px] text-gray-500">
                                    {assignedAgent.name} {step.subtext ? `• ${step.subtext}` : ''}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                    isDone
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : isRunning
                                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />}
                                  {isDone && <Check className="w-3 h-3 text-emerald-600" />}
                                  <span className="capitalize">{step.status}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Cancel Plan Button */}
                      {activePlan.status === 'in_progress' && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={cancelPlan}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-semibold transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel plan</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-gray-500">
                      No active tasks currently running. Ask Master Agent in the Chat tab to start work.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: COMPUTERS (E2B SANDBOX VIEWER - Screenshot ref 11) */}
              {activeTab === 'computer' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs text-sky-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                      <span className="font-semibold">Running</span>
                      <span className="text-sky-700">
                        This agent is using it · Searching google for "coffee shop instagram launch trending reels"
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-sky-600">E2B Desktop #8491</span>
                  </div>

                  {/* Browser Mockup Window */}
                  <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    {/* Browser Chrome Header */}
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex-1 bg-white rounded-lg px-3 py-1 text-[11px] text-gray-600 flex items-center gap-2 border border-gray-200 truncate">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        <span className="truncate">
                          https://www.google.com/search?q=coffee+shop+instagram+launch+trending+reels+morning+post+hashtags+2026
                        </span>
                      </div>
                      <button
                        onClick={() => alert('Full screen cloud sandbox')}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Expand"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Browser Content (Google AI Overview Mockup) */}
                    <div className="p-4 bg-white space-y-4 max-h-[340px] overflow-y-auto text-xs">
                      <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Overview · Social Media Trends 2026</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-[11px]">
                        Launching a coffee shop on Instagram in 2026 requires moving past basic latte-art and
                        &quot;we&apos;re open&quot; flyers. The algorithm now prioritizes viewer behavior—such as watch
                        time, saves, and shares—while keywords and on-screen text do the heavy lifting that hashtags
                        used to do.
                      </p>

                      <div className="space-y-2 pt-1 border-t border-gray-100">
                        <h5 className="font-bold text-gray-900 text-xs">Trending Morning Reel Concepts for 2026:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px]">
                          <li>
                            <strong>The 5-to-9 Morning Ritual:</strong> Quick cinematic cuts of a barista dialing in
                            the espresso machine, steam rising, and first customer sip.
                          </li>
                          <li>
                            <strong>Secret Menu / Cold Brew Reveal:</strong> Showcase single-origin 18-hour cold brew
                            pour with sound design (ASMR ice cubes).
                          </li>
                          <li>
                            <strong>Neighborhood Loyalty Hook:</strong> Tag local landmarks and encourage community
                            meetups.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Control Bar */}
                    <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsSandboxRunning(prev => !prev)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                        <button
                          onClick={() => setIsSandboxTakeover(prev => !prev)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            isSandboxTakeover
                              ? 'bg-amber-500 text-white'
                              : 'bg-brand-500 hover:bg-brand-600 text-white'
                          }`}
                        >
                          <span>{isSandboxTakeover ? 'Release control' : 'Take over'}</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        Pauses itself after 3 minutes without use
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    This agent&apos;s own computer, so it can work while your other agents use theirs. Its logins and files
                    stay on it between tasks.
                  </p>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-5 text-xs">
                  <div className="space-y-2">
                    <label className="font-bold text-gray-800">Agent Tone of Voice</label>
                    <select className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option>Friendly, concise and professional (Default)</option>
                      <option>Visionary & tech-forward</option>
                      <option>Casual, warm & humorous</option>
                      <option>Strictly data-driven & analytical</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="font-bold text-gray-800">Enabled Tools & Permissions</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-brand-500 focus:ring-brand-500" />
                        <div>
                          <div className="font-semibold text-gray-900">E2B Desktop Browser Sandbox</div>
                          <div className="text-[11px] text-gray-400">Can browse live web and capture screenshots</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-brand-500 focus:ring-brand-500" />
                        <div>
                          <div className="font-semibold text-gray-900">ImageKit AI Transformations</div>
                          <div className="text-[11px] text-gray-400">Auto-resize, background removal, filter presets</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-brand-500 focus:ring-brand-500" />
                        <div>
                          <div className="font-semibold text-gray-900">Blotato API Scheduling</div>
                          <div className="text-[11px] text-gray-400">Schedule posts directly into social calendar</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => alert('Agent settings saved!')}
                      className="px-4 py-2 rounded-xl bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Office Canvas (5 Cols) */}
        <div className="lg:col-span-5 h-[640px]">
          <OfficeCanvas className="h-full" />
        </div>
      </div>
    </div>
  );
}
