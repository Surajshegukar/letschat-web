"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { SettingsDrawer } from "@/components/sidebar/SettingsDrawer";
import { ActiveCallScreen } from "@/components/calls/active-call/ActiveCallScreen";
import { MobileNav } from "@/components/sidebar/MobileNav";
import { useCallStore } from "@/store/call-store";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCallActive, callType, callerName, callerAvatarUrl, endCall } = useCallStore();

  return (
    <div className="h-screen w-screen flex bg-zinc-100 dark:bg-zinc-950 overflow-hidden font-sans select-none">
      {/* Shared Pane 1: Main Sidebar Nav — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex relative overflow-hidden h-full pb-[60px] md:pb-0">
        <SettingsDrawer />
        {children}
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      <ActiveCallScreen
        isOpen={isCallActive}
        onClose={endCall}
        callerName={callerName}
        callerAvatarUrl={callerAvatarUrl}
        callType={callType}
      />
    </div>
  );
}
