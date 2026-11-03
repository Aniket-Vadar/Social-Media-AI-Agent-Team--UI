'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export interface AppNotification {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  status?: number;
  duration?: number;
  timestamp?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContainerProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onDismiss,
}) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {notifications.map(item => (
        <ToastItem key={item.id} notification={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  notification: AppNotification;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = notification.duration ?? (notification.type === 'error' ? 8000 : 5000);
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 200);
  };

  const getTheme = () => {
    switch (notification.type) {
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
          bg: 'bg-white border-rose-200/90 shadow-rose-500/10',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          bar: 'bg-rose-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
          bg: 'bg-white border-amber-200/90 shadow-amber-500/10',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          bar: 'bg-amber-500',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
          bg: 'bg-white border-emerald-200/90 shadow-emerald-500/10',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          bar: 'bg-emerald-500',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />,
          bg: 'bg-white border-indigo-200/90 shadow-indigo-500/10',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          bar: 'bg-indigo-500',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      role="alert"
      className={`pointer-events-auto rounded-2xl border shadow-xl p-4 transition-all duration-200 relative overflow-hidden backdrop-blur-sm ${
        theme.bg
      } ${
        isExiting
          ? 'opacity-0 translate-y-2 scale-95'
          : 'animate-in fade-in slide-in-from-top-3 duration-200'
      }`}
    >
      {/* Accent color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bar}`} />

      <div className="flex items-start gap-3 pl-1">
        <div className="pt-0.5">{theme.icon}</div>

        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-gray-900 truncate">
              {notification.title}
            </h4>
            {notification.status && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${theme.badge}`}
              >
                HTTP {notification.status}
              </span>
            )}
          </div>

          <p className="text-[11px] text-gray-600 mt-1 leading-relaxed break-words whitespace-pre-wrap">
            {notification.message}
          </p>

          {notification.action && (
            <div className="mt-2.5">
              <button
                onClick={notification.action.onClick}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline transition-colors"
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

