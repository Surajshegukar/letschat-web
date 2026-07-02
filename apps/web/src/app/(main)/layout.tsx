"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ActiveCallScreen } from "@/components/calls/active-call/ActiveCallScreen";
import { useCallStore } from "@/store/call-store";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCallActive, callType, callerName, callerAvatarUrl, endCall } = useCallStore();

  return (
    <div className="h-screen w-screen flex bg-zinc-100 dark:bg-zinc-950 overflow-hidden font-sans select-none">
      {/* Shared Pane 1: Main Sidebar Nav */}
      <Sidebar />
      {children}

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
