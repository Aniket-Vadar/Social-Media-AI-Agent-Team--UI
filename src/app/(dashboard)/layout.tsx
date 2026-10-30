'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { CreateCampaignModal } from '@/components/modals/CreateCampaignModal';
import { CreatePostModal } from '@/components/modals/CreatePostModal';
import { ImageEditorModal } from '@/components/modals/ImageEditorModal';
import { CommandPalette } from '@/components/modals/CommandPalette';
import { PostDetailSheet } from '@/components/modals/PostDetailSheet';
import { useApp } from '@/context/AppContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ease-in-out p-6 md:p-8 min-h-screen ${
          sidebarCollapsed ? 'ml-24' : 'ml-72'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Global Modals & Sheets */}
      <CreateCampaignModal />
      <CreatePostModal />
      <ImageEditorModal />
      <CommandPalette />
      <PostDetailSheet />
    </div>
  );
}
