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

      {/* Pane 2: Recents Calls list view & Create Meeting Link action */}
      <CallsList activeCallId={activeCallId} onSelectCall={setActiveCallId} />

      {/* Pane 3: Call Record detail panel or Call log empty dashboard */}
      <CallDetailsWindow
        activeCallId={activeCallId}
        onClearSelection={() => setActiveCallId(null)}
        onStartAudioCall={(name, avatar) => startCall(name, avatar, "audio")}
        onStartVideoCall={(name, avatar) => startCall(name, avatar, "video")}
      />
    </>
  );
}
export type CallsPageReturn = ReturnType<typeof CallsPage>;
