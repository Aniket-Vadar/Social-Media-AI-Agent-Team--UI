'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Server,
  Zap,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BACKEND_URL, BACKEND_DOCS_URL, backendApi } from '@/lib/api/backend';

interface EndpointItem {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  tag: string;
  summary: string;
  description: string;
  authRequired: boolean;
}

const API_ENDPOINTS: EndpointItem[] = [
  // Health
  {
    method: 'GET',
    path: '/api/v1/healthz',
    tag: 'Health',
    summary: 'Health Check',
    description: 'Liveness and readiness health probe returning service status.',
    authRequired: false,
  },
  // Agents
  {
    method: 'GET',
    path: '/api/v1/agents',
    tag: 'Agents',
    summary: 'Get Agent Roster',
    description: 'Retrieves all 5 autonomous agents (Master, Researcher, Creator, Scheduler, Analytics) and their live states.',
    authRequired: true,
  },
  {
    method: 'GET',
    path: '/api/v1/agents/{agent_id}',
    tag: 'Agents',
    summary: 'Get Agent Details',
    description: 'Retrieve live workload, current tasks, and desk telemetry for a specific agent.',
    authRequired: true,
  },
  {
    method: 'GET',
    path: '/api/v1/agents/threads/{thread_id}/messages',
    tag: 'Agents',
    summary: 'Get Thread Messages',
    description: 'Fetch chat history and agent conversation steps for a specific thread.',
    authRequired: true,
  },
  // Runs
  {
    method: 'POST',
    path: '/api/v1/runs',
    tag: 'Agent Runs',
    summary: 'Start Autonomous Run',
    description: 'Start multi-agent LangGraph workflow execution with user instructions.',
    authRequired: true,
  },
  {
    method: 'GET',
    path: '/api/v1/runs/{run_id}/events',
    tag: 'Agent Runs',
    summary: 'Stream Run Events (SSE)',
    description: 'Real-time Server-Sent Events stream emitting node executions, tokens, and agent status changes.',
    authRequired: false,
  },
  {
    method: 'POST',
    path: '/api/v1/runs/{run_id}/resume',
    tag: 'Agent Runs',
    summary: 'Resume Run',
    description: 'Resume paused run with human-in-the-loop approvals, edits, or rejection feedback.',
    authRequired: true,
  },
  // Campaigns
  {
    method: 'GET',
    path: '/api/v1/campaigns',
    tag: 'Campaigns',
    summary: 'List Campaigns',
    description: 'List all campaigns scoped to current workspace tenant.',
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/api/v1/campaigns',
    tag: 'Campaigns',
    summary: 'Create Campaign',
    description: 'Create a new marketing campaign with brand voice, target audience, and posting goals.',
    authRequired: true,
  },
  {
    method: 'GET',
    path: '/api/v1/campaigns/{campaign_id}',
    tag: 'Campaigns',
    summary: 'Get Campaign Details',
    description: 'Retrieve detailed configuration and statistics for a specific campaign.',
    authRequired: true,
  },
  {
    method: 'PATCH',
    path: '/api/v1/campaigns/{campaign_id}',
    tag: 'Campaigns',
    summary: 'Update Campaign',
    description: 'Update brand voice, approval mode, goals, or office theme.',
    authRequired: true,
  },
  {
    method: 'DELETE',
    path: '/api/v1/campaigns/{campaign_id}',
    tag: 'Campaigns',
    summary: 'Delete Campaign',
    description: 'Archive or permanently delete a campaign.',
    authRequired: true,
  },
  // Posts
  {
    method: 'GET',
    path: '/api/v1/posts',
    tag: 'Posts',
    summary: 'List Posts',
    description: 'Query posts with filters by status (draft, scheduled, published) and platform.',
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/api/v1/posts',
    tag: 'Posts',
    summary: 'Create Post',
    description: 'Create a new post manually or schedule via Blotato integration.',
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/api/v1/posts/{post_id}/approve',
    tag: 'Posts',
    summary: 'Approve Post',
    description: 'Approve agent-generated post, optionally providing final caption or schedule edits.',
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/api/v1/posts/{post_id}/reject',
    tag: 'Posts',
    summary: 'Reject Post',
    description: 'Reject a draft with feedback to trigger AI agent revision workflow.',
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/api/v1/posts/{post_id}/reschedule',
    tag: 'Posts',
    summary: 'Reschedule Post',
    description: 'Change the scheduled publication time slot.',
    authRequired: true,
  },
  {
    method: 'DELETE',
    path: '/api/v1/posts/{post_id}',
    tag: 'Posts',
    summary: 'Delete Post',
    description: 'Remove post from the campaign schedule.',
    authRequired: true,
  },
  // Social Accounts
  {
    method: 'GET',
    path: '/api/v1/social-accounts',
    tag: 'Social Accounts',
    summary: 'List Social Accounts',
    description: 'List all connected channels (Instagram, TikTok, YouTube, X, LinkedIn).',
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/api/v1/social-accounts',
    tag: 'Social Accounts',
    summary: 'Connect Social Account',
    description: 'Register a Blotato-connected social channel.',
    authRequired: true,
  },
  // Calendar & Analytics
  {
    method: 'GET',
    path: '/api/v1/calendar/events',
    tag: 'Calendar',
    summary: 'Get Calendar Events',
    description: 'Retrieve scheduled posts and marketing milestones across a date range.',
    authRequired: true,
  },
  {
    method: 'GET',
    path: '/api/v1/analytics/dashboard',
    tag: 'Analytics',
    summary: 'Get Analytics Dashboard',
    description: 'Retrieve high-level KPIs, timeseries trends, and AI strategic insights.',
    authRequired: true,
  },
  // Media & ImageKit
  {
    method: 'POST',
    path: '/api/v1/media/imagekit-auth',
    tag: 'Media',
    summary: 'Get ImageKit Auth Signature',
    description: 'Generate secure client-side upload tokens for ImageKit asset management.',
    authRequired: false,
  },
  {
    method: 'POST',
    path: '/api/v1/media/transform',
    tag: 'Media',
    summary: 'Transform Media Asset',
    description: 'Apply URL-based visual transformations (resize, smart crop, aspect ratio).',
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/api/v1/media/ai-edit',
    tag: 'Media',
    summary: 'AI Image Edit',
    description: 'Trigger generative AI modifications on visual assets.',
    authRequired: true,
  },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'swagger' | 'endpoints' | 'schema'>('swagger');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    service?: string;
    version?: string;
    latencyMs?: number;
    checking: boolean;
  }>({
    status: 'checking',
    checking: true,
  });
  const [schemaJson, setSchemaJson] = useState<string>('');
  const [loadingSchema, setLoadingSchema] = useState(false);

  const checkHealth = async () => {
    setBackendHealth(prev => ({ ...prev, checking: true }));
    const start = performance.now();
    try {
      const data = await backendApi.getHealth();
      const latencyMs = Math.round(performance.now() - start);
      setBackendHealth({
        status: data.status === 'healthy' || data.status === 'online' ? 'online' : 'error',
        service: data.service,
        version: data.version,
        latencyMs,
        checking: false,
      });
    } catch {
      setBackendHealth({
        status: 'offline',
        latencyMs: 0,
        checking: false,
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const loadSchema = async () => {
    if (schemaJson) return;
    setLoadingSchema(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/openapi.json`);
      if (res.ok) {
        const json = await res.json();
        setSchemaJson(JSON.stringify(json, null, 2));
      } else {
        setSchemaJson(JSON.stringify({ error: `Failed to load schema (${res.status})` }, null, 2));
      }
    } catch (e: any) {
      setSchemaJson(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(id);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const tags = ['All', ...Array.from(new Set(API_ENDPOINTS.map(e => e.tag)))];

  const filteredEndpoints = API_ENDPOINTS.filter(ep => {
    const matchesTag = selectedTag === 'All' || ep.tag === selectedTag;
    const matchesSearch =
      ep.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'POST':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PATCH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="API Documentation"
        subtitle="Live production backend documentation for Socialix AI Agent Office"
      />

      {/* Hero Banner with Live Service Status & Actions */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Production AI Agent Service
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    FastAPI + LangGraph
                  </span>
                </h2>
                <p className="text-xs text-indigo-200/80 font-mono mt-0.5 flex items-center gap-2">
                  <span>{BACKEND_URL}</span>
                  <button
                    onClick={() => handleCopy(BACKEND_URL, 'base-url')}
                    className="hover:text-white transition-colors"
                    title="Copy backend URL"
                  >
                    {copiedPath === 'base-url' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Live Health Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  backendHealth.checking
                    ? 'bg-amber-400 animate-ping'
                    : backendHealth.status === 'online'
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                    : 'bg-rose-400 shadow-sm shadow-rose-400'
                }`}
              />
              <span className="font-semibold text-white capitalize">
                {backendHealth.checking
                  ? 'Checking...'
                  : backendHealth.status === 'online'
                  ? 'Backend Online'
                  : 'Backend Sleeping / Cold'}
              </span>
              {backendHealth.latencyMs !== undefined && (
                <span className="text-[10px] font-mono text-indigo-200 bg-white/10 px-2 py-0.5 rounded-md">
                  {backendHealth.latencyMs}ms
                </span>
              )}
              <button
                onClick={checkHealth}
                className="hover:rotate-180 transition-transform duration-300 text-indigo-300 hover:text-white ml-1"
                title="Refresh health check"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Swagger External Link */}
            <a
              href={BACKEND_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all group"
            >
              <span>Open Swagger UI</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-indigo-800/40">
          <button
            onClick={() => setActiveTab('swagger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'swagger'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Swagger UI</span>
          </button>

          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'endpoints'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Endpoints Directory ({API_ENDPOINTS.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('schema');
              loadSchema();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'schema'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>OpenAPI 3.1 JSON</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Embedded Interactive Swagger UI */}
      {activeTab === 'swagger' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-gray-800">Embedded Swagger Sandbox</span>
              <span className="text-gray-400 font-mono text-[11px]">— {BACKEND_DOCS_URL}</span>
            </div>
            <a
              href={BACKEND_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5"
            >
              <span>Full Screen Window</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full h-[800px] relative bg-white">
            <iframe
              src={BACKEND_DOCS_URL}
              title="Socialix AI Backend Swagger Documentation"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Native Endpoints Directory */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search endpoints by path, action, or description..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoints List */}
          <div className="space-y-2.5">
            {filteredEndpoints.map(ep => {
              const fullUrl = `${BACKEND_URL}${ep.path}`;
              const isCopied = copiedPath === ep.path;

              return (
                <div
                  key={`${ep.method}-${ep.path}`}
                  className="bg-white rounded-2xl border border-gray-100/90 hover:border-indigo-200 hover:shadow-md p-4 transition-all duration-150 group"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 ${getMethodBadgeClass(
                          ep.method
                        )}`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-semibold text-gray-900 truncate">
                        {ep.path}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                        {ep.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleCopy(fullUrl, ep.path)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Copy full URL"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold text-[11px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-600 pl-0 sm:pl-[74px]">
                    <div className="font-medium text-gray-800">{ep.summary}</div>
                    <p className="text-gray-500 mt-0.5 leading-relaxed">{ep.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: OpenAPI 3.1 JSON Specification */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">OpenAPI 3.1.0 JSON Specification</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Machine-readable API contract served live from {BACKEND_URL}/api/v1/openapi.json
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(schemaJson, 'openapi-schema')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                {copiedPath === 'openapi-schema' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
              <a
                href={`${BACKEND_URL}/api/v1/openapi.json`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <span>Raw OpenAPI</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {loadingSchema ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs">Fetching OpenAPI schema from backend...</span>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-2xl overflow-x-auto max-h-[650px] leading-relaxed">
                {schemaJson || 'Click to fetch schema...'}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

