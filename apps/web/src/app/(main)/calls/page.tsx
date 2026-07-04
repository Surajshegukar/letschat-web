"use client";

import React, { useState } from "react";
import { CallsList } from "@/components/calls/calls-list/CallsList";
import { CallDetailsWindow } from "@/components/calls/call-details/CallDetailsWindow";
import { useCallStore } from "@/store/call-store";

export default function CallsPage() {
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const { startCall } = useCallStore();

  return (
    <>
      <div className={`${activeCallId ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
        <CallsList activeCallId={activeCallId} onSelectCall={setActiveCallId} />
      </div>

      <div className={`${activeCallId ? "flex" : "hidden md:flex"} flex-1 min-w-0`}>
        <CallDetailsWindow
          activeCallId={activeCallId}
          onClearSelection={() => setActiveCallId(null)}
          onStartAudioCall={(name, avatar) => startCall(name, avatar, "audio")}
          onStartVideoCall={(name, avatar) => startCall(name, avatar, "video")}
        />
      </div>
    </>
  );
}
export type CallsPageReturn = ReturnType<typeof CallsPage>;
