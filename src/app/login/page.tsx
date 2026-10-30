'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ShieldCheck, AlertCircle, Bot, Zap, Lock, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');
  const { signInWithGoogle } = useApp();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(urlError ? 'Please sign in to access your workspace.' : null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize Google authentication');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-100 mb-1">
          <Sparkles className="w-7 h-7 fill-white/20" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Welcome to Socialix</h1>
        <p className="text-xs text-gray-500 max-w-xs">
          Sign in to access your autonomous AI Social Media Agent Office
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-100/80 space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-3 h-3" />
          </div>
          <span>5 Autonomous Specialized Agents (Supervisor, Creator, Analyst)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3 h-3" />
          </div>
          <span>Automated Multi-Platform Blotato Publishing</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Lock className="w-3 h-3" />
          </div>
          <span>Fast, Passwordless Google Workspace Authentication</span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <div className="space-y-3 pt-1">
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50/80 flex items-center justify-center gap-3 text-xs font-bold text-gray-800 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <p className="text-[11px] text-center text-gray-400">
          Sign-in is exclusively managed via Google OAuth 2.0 for security.
        </p>
      </div>

      {/* Footer Security Badges */}
      <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Enterprise Supabase Auth & Anti-Spam Shield</span>
        </div>
        <p className="text-[10px] text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4 select-none">
      <Suspense fallback={<div className="text-xs text-gray-400">Loading auth...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
