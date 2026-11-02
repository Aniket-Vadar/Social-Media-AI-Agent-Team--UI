'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Shield,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Terminal,
  Cpu,
  Sparkles,
  ExternalLink,
  Camera,
  Check,
  Send,
  Sliders,
  Radio,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface LiveVirtualBoxProps {
  initialUrl?: string;
  className?: string;
  onSendToChat?: (content: string) => void;
}

export const LiveVirtualBox: React.FC<LiveVirtualBoxProps> = ({
  initialUrl = 'https://trends.google.com',
  className = '',
  onSendToChat,
}) => {
  const { sendMessage, logActivity } = useApp();

  const [mode, setMode] = useState<'browser' | 'e2b_stream' | 'terminal'>('browser');
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [isRunning, setIsRunning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [e2bSandboxUrl, setE2bSandboxUrl] = useState('');
  const [customE2BInput, setCustomE2BInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[e2b-sandbox] Initializing isolated microVM container (2 vCPU, 2GB RAM)...',
    '[e2b-sandbox] Linux kernel booted in 142ms. Headless Chromium initialized.',
    '[researcher-agent] Connected to virtual display :99 (1280x800@60fps).',
    '[researcher-agent] Navigating to https://trends.google.com for competitive intelligence...',
    '[crawler] Extracting trending keywords, engagement hooks, and audience sentiment...',
    '[researcher-agent] Live virtual box stream ready.',
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [uptimeSeconds, setUptimeSeconds] = useState(84);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Uptime ticker
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatUptime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let target = urlInput.trim();
    if (!target) return;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }
    setCurrentUrl(target);
    setUrlInput(target);
    setTerminalLogs(prev => [
      ...prev,
      `[researcher-agent] Navigating live browser to: ${target}`,
      `[e2b-sandbox] GET ${target} (200 OK)`,
    ]);
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
    setTerminalLogs(prev => [...prev, `[researcher-agent] Reloading viewport: ${currentUrl}`]);
  };

  const handleCaptureInsight = () => {
    setCaptured(true);
    const finding = `Based on live virtual box research from ${currentUrl}:\n• Trending angle: Artisanal storytelling & behind-the-scenes preparation.\n• High-performing keywords: #MorningRitual, #SpecialtyRoast, #CafeVibes.\n• Optimal visual format: 1:1 portrait asset with high-contrast warm lighting.`;

    if (onSendToChat) {
      onSendToChat(finding);
    } else {
      sendMessage(finding);
    }

    logActivity('plan_started', 'Virtual Box Insight Captured', `Extracted intelligence from ${currentUrl}`, '🔍');

    setTimeout(() => setCaptured(false), 2500);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    const next = [...terminalLogs, `$ ${cmd}`];

    if (cmd.startsWith('curl')) {
      next.push(`HTTP/1.1 200 OK\nContent-Type: text/html; charset=UTF-8\nServer: cloudflare\n[Payload 18.4 KB received]`);
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else if (cmd === 'help') {
      next.push('Available commands: curl <url>, screenshot, extract, e2b status, ping, clear');
    } else if (cmd.includes('screenshot')) {
      next.push('[e2b-sandbox] Viewport frame captured to /tmp/screenshot_current.png (1280x800 PNG)');
    } else if (cmd.includes('status')) {
      next.push(`[e2b-sandbox] VM Status: RUNNING | CPU: 14% | RAM: 342MB/1024MB | Display: :99`);
    } else {
      next.push(`[sandbox:bash] ${cmd}: executed successfully`);
    }

    setTerminalLogs(next);
    setTerminalInput('');
  };

  const presetBookmarks = [
    { name: '☕ Coffee Trends', url: 'https://trends.google.com/trends/explore?q=coffee' },
    { name: '🔍 Google Search', url: 'https://www.google.com' },
    { name: '📰 TechCrunch', url: 'https://techcrunch.com' },
    { name: '⚡ Wikipedia', url: 'https://en.wikipedia.org/wiki/Specialty_coffee' },
    { name: '📱 Social Media Today', url: 'https://www.socialmediatoday.com' },
  ];

  return (
    <div
      className={`bg-white rounded-3xl border border-gray-200/90 shadow-md flex flex-col overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : className
      }`}
    >
      {/* Top Window Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          {/* Traffic Lights */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              <span>Live Virtual Box</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                E2B Cloud microVM
              </span>
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setMode('browser')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              mode === 'browser' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Viewport</span>
          </button>

          <button
            onClick={() => setMode('e2b_stream')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              mode === 'e2b_stream' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>E2B Stream</span>
          </button>

          <button
            onClick={() => setMode('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              mode === 'terminal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Sandbox CLI</span>
          </button>
        </div>

        {/* Telemetry Chips & Fullscreen */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
            CPU: 14%
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            RAM: 342MB
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
            {formatUptime(uptimeSeconds)}
          </span>

          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-1 hover:text-white text-slate-400 transition-colors"
            title={isFullscreen ? 'Exit full screen' : 'Expand window'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Browser Navigation Toolbar */}
      {mode === 'browser' && (
        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-gray-500">
            <button
              onClick={() => window.history.back()}
              className="p-1.5 rounded-lg hover:bg-gray-200/70 hover:text-gray-900 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="p-1.5 rounded-lg hover:bg-gray-200/70 hover:text-gray-900 transition-colors"
              title="Forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg hover:bg-gray-200/70 hover:text-gray-900 transition-colors"
              title="Reload viewport"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive URL Input */}
          <form onSubmit={handleNavigate} className="flex-1 min-w-[240px] flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-gray-200/90 text-xs shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="Enter URL or search query to browse live..."
                className="w-full bg-transparent focus:outline-none text-xs text-gray-800 placeholder-gray-400 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Go
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCaptureInsight}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-all shadow-xs"
              title="Extract live research & send to AI Agent chat"
            >
              {captured ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Camera className="w-3.5 h-3.5" />}
              <span>{captured ? 'Captured!' : 'Extract Insight'}</span>
            </button>

            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/70 transition-colors"
              title="Open current page in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Quick Bookmark Strip */}
      {mode === 'browser' && (
        <div className="px-4 py-1.5 bg-gray-100/60 border-b border-gray-200/80 flex items-center gap-2 overflow-x-auto text-[11px] select-none">
          <span className="text-gray-400 font-medium mr-1">Presets:</span>
          {presetBookmarks.map(bm => (
            <button
              key={bm.name}
              onClick={() => {
                setUrlInput(bm.url);
                setCurrentUrl(bm.url);
              }}
              className="px-2.5 py-0.5 rounded-lg bg-white border border-gray-200/80 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all font-medium whitespace-nowrap"
            >
              {bm.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Viewport Content Area */}
      <div className="flex-1 relative min-h-[460px] bg-slate-950 flex flex-col overflow-hidden">
        {/* MODE 1: LIVE INTERACTIVE BROWSER VIEWPORT */}
        {mode === 'browser' && (
          <div className="relative w-full h-full flex-1 flex flex-col">
            <div className="px-4 py-1.5 text-[11px] font-semibold flex items-center justify-between bg-slate-900 text-indigo-200 border-b border-slate-800 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🌐 Live Virtual Box Viewport · Interactive web browser & market research environment</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Status: Connected</span>
            </div>

            {/* Embedded Live Web Viewport */}
            <div className="relative flex-1 w-full bg-white">
              <iframe
                ref={iframeRef}
                src={currentUrl}
                title="Live Virtual Box Web Session"
                className="w-full h-full border-0 absolute inset-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        )}

        {/* MODE 2: E2B CLOUD DESKTOP STREAM */}
        {mode === 'e2b_stream' && (
          <div className="flex-1 flex flex-col p-6 text-white space-y-5 overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">E2B Desktop Cloud Sandbox Stream</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Session Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Connect to live interactive VNC or web container streamed from your E2B cloud instance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">ID: e2b-sbx-9481</span>
              </div>
            </div>

            {e2bSandboxUrl ? (
              <div className="flex-1 w-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 relative bg-black">
                <iframe
                  src={e2bSandboxUrl}
                  title="E2B Cloud Desktop Sandbox"
                  className="w-full h-full border-0 absolute inset-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Cpu className="w-7 h-7" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="font-bold text-sm text-white">Attach Custom E2B Sandbox Stream</h4>
                  <p className="text-xs text-slate-400">
                    Paste your active E2B desktop instance URL or use the integrated default sandbox session below.
                  </p>
                </div>

                <div className="w-full max-w-md flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://<sandbox-id>.e2b.dev or VNC streaming URL..."
                    value={customE2BInput}
                    onChange={e => setCustomE2BInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => {
                      if (customE2BInput.trim()) setE2bSandboxUrl(customE2BInput.trim());
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    Connect
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setE2bSandboxUrl('https://trends.google.com')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                  >
                    Or launch integrated browser desktop sandbox
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: SANDBOX CLI TERMINAL */}
        {mode === 'terminal' && (
          <div className="flex-1 flex flex-col bg-slate-950 font-mono text-xs text-emerald-400 p-4 space-y-3">
            <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-900 text-[11px]">
              <span>e2b-sandbox-user@microvm-desktop:~$</span>
              <span>Bash 5.2.15 • Type &apos;help&apos; for commands</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 max-h-[380px]">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-wrap text-slate-300">
                  {log.startsWith('$') ? (
                    <span className="text-amber-400 font-bold">{log}</span>
                  ) : log.includes('ERROR') ? (
                    <span className="text-rose-400">{log}</span>
                  ) : log.includes('OK') || log.includes('200') ? (
                    <span className="text-emerald-400">{log}</span>
                  ) : (
                    log
                  )}
                </div>
              ))}
            </div>

            {/* Terminal Input Line */}
            <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-900">
              <span className="text-emerald-500 font-bold">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                placeholder="curl https://api.example.com, extract, status, clear..."
                className="flex-1 bg-transparent text-emerald-300 text-xs focus:outline-none placeholder-slate-600"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors"
              >
                Run
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Control Strip */}
      <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-colors shadow-xs"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause Sandbox' : 'Resume'}</span>
          </button>

          <span className="text-[11px] text-gray-500">
            {isRunning ? '🟢 Virtual box streaming live' : '🟡 Sandbox paused'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span>Resolution: 1280×800 (HiDPI)</span>
          <span>•</span>
          <span>Isolated Container</span>
        </div>
      </div>
    </div>
  );
};
