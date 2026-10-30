'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, Clock, ArrowLeft, RefreshCw } from 'lucide-react';

function BlockedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const isRateLimit = reason === 'rate_limit';

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 mx-auto flex items-center justify-center shadow-md shadow-red-100">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">
          {isRateLimit ? 'Too Many Requests' : 'Access Temporarily Suspended'}
        </h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          {isRateLimit
            ? 'Our security system detected rapid bursts of requests from your network. Please wait a minute before trying again.'
            : 'Your IP address has been flagged and temporarily banned for suspicious activity or spam request patterns.'}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 space-y-2 text-left">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-500">Protection Layer:</span>
          <span className="font-mono text-gray-800">Edge Rate Limiter / Anti-Spam</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-500">Status Code:</span>
          <span className="font-mono text-red-600 font-bold">
            {isRateLimit ? '429 Too Many Requests' : '403 Forbidden'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-500">Auto-Expiry:</span>
          <span className="flex items-center gap-1 font-mono text-gray-800">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {isRateLimit ? '60 seconds' : '24 hours'}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check again</span>
        </button>

        <Link
          href="/"
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
}

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4 select-none">
      <Suspense fallback={<div className="text-xs text-gray-400">Loading security check...</div>}>
        <BlockedContent />
      </Suspense>
    </div>
  );
}
