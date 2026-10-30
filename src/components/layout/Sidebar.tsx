'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Layers,
  Calendar,
  BarChart3,
  Link2,
  Settings,
  ChevronDown,
  Plus,
  Check,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    user,
    signOut,
    signInWithGoogle,
    campaigns,
    activeCampaign,
    setActiveCampaignId,
    setIsCreateCampaignOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useApp();

  const [campaignMenuOpen, setCampaignMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'AI Agent', href: '/agents', icon: Bot, badge: '5' },
    { label: 'Posts', href: '/posts', icon: Layers },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Accounts', href: '/settings', icon: Link2 },
  ];

  const isRouteActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed top-4 left-4 bottom-4 z-40 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-xl transition-all duration-300 ease-in-out select-none ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 flex-shrink-0">
          <Sparkles className="w-5 h-5 fill-white/20" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-gray-900">Socialix</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">AI Agent Office</span>
          </div>
        )}
      </div>

      {/* Campaign Selector */}
      <div className="px-3 pt-4 pb-2 relative">
        <button
          onClick={() => setCampaignMenuOpen(prev => !prev)}
          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border border-gray-100/90 bg-gray-50/70 hover:bg-gray-100/70 hover:border-gray-200 transition-all text-left ${
            sidebarCollapsed ? 'justify-center p-2' : ''
          }`}
          title={activeCampaign.name}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm"
            style={{ backgroundColor: `${activeCampaign.color}15`, color: activeCampaign.color }}
          >
            {activeCampaign.logo}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0 pr-1">
              <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Campaign</div>
              <div className="text-xs font-semibold text-gray-800 truncate">{activeCampaign.name}</div>
            </div>
          )}
          {!sidebarCollapsed && (
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200" />
          )}
        </button>

        {/* Campaign Switcher Dropdown Menu */}
        {campaignMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setCampaignMenuOpen(false)}
            />
            <div className="absolute left-3 right-3 top-16 z-50 bg-white rounded-2xl border border-gray-100 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Your campaigns
              </div>
              <div className="space-y-1 my-1">
                {campaigns.map(camp => (
                  <button
                    key={camp.id}
                    onClick={() => {
                      setActiveCampaignId(camp.id);
                      setCampaignMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      camp.id === activeCampaign.id
                        ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-sm">{camp.logo}</span>
                      <span className="truncate">{camp.name}</span>
                    </div>
                    {camp.id === activeCampaign.id && (
                      <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-1.5 mt-1.5">
                <button
                  onClick={() => {
                    setCampaignMenuOpen(false);
                    setIsCreateCampaignOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create new campaign</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
        {!sidebarCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
        )}
        {navItems.map(item => {
          const active = isRouteActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 ${
                active
                  ? 'bg-indigo-50/80 text-indigo-600 font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 flex-shrink-0 ${
                  active ? 'text-indigo-600' : 'text-gray-500'
                }`}
              />
              {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
              {!sidebarCollapsed && item.badge && (
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer Section */}
      <div className="px-3 py-3 border-t border-gray-100/90 space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          }`}
          title={sidebarCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </Link>

        {user ? (
          <button
            onClick={() => signOut()}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-colors ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-red-500 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1 text-left">Log out</span>}
          </button>
        ) : (
          <button
            onClick={() => signInWithGoogle()}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-indigo-50/80 transition-colors ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Sign in with Google"
          >
            <LogIn className="w-4 h-4 text-brand-600 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1 text-left font-semibold">Sign in</span>}
          </button>
        )}

        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Toggle Sidebar (⌘B)"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4 text-gray-500" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="flex-1 text-left">Collapse</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 text-gray-500 rounded border border-gray-200">
                ⌘B
              </kbd>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
