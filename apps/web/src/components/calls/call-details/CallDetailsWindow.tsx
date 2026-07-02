"use client";

import React from "react";
import { Phone, Video, Info, ArrowLeft } from "lucide-react";
import { mockCalls } from "@/constants/mock-data";
import { CallDetailsEmptyState } from "./CallDetailsEmptyState";
import { CallProfileCard } from "./CallProfileCard";
import { CallHistoryRow } from "./CallHistoryRow";

interface CallDetailsWindowProps {
  activeCallId: string | null;
  onClearSelection?: () => void;
  onStartAudioCall?: (name: string, avatarUrl?: string) => void;
  onStartVideoCall?: (name: string, avatarUrl?: string) => void;
}

export function CallDetailsWindow({
  activeCallId,
  onClearSelection,
  onStartAudioCall,
  onStartVideoCall,
}: CallDetailsWindowProps) {
  // Find active call record
  const call = activeCallId ? mockCalls.find((c) => c.id === activeCallId) : null;

  // 1. EMPTY WINDOW STATE
  if (!call) {
    return <CallDetailsEmptyState />;
  }

  const handleAudioCall = () => {
    if (onStartAudioCall) onStartAudioCall(call.name, call.avatar);
  };

  const handleVideoCall = () => {
    if (onStartVideoCall) onStartVideoCall(call.name, call.avatar);
  };

  // 2. ACTIVE WINDOW STATE
  return (
    <div className="flex-1 h-full flex flex-col bg-[#FAFAFC] dark:bg-[#09090B]">
      {/* Active Call Header */}
      <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950 flex-shrink-0">
        <div className="flex items-center gap-3">
          {onClearSelection && (
            <button
              onClick={onClearSelection}
              className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 mr-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="relative">
            <img src={call.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
            {call.isOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-white dark:border-zinc-950" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white leading-none">
              {call.name}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1.5 leading-none">
              {call.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
          <button
            onClick={handleAudioCall}
            className="p-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition text-emerald-600 dark:text-[#19E68C] border border-zinc-150/40 dark:border-zinc-800/80"
            title="Start voice call"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            onClick={handleVideoCall}
            className="p-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition text-emerald-600 dark:text-[#19E68C] border border-zinc-150/40 dark:border-zinc-800/80"
            title="Start video call"
          >
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition">
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Active Call Logs history area */}
      <div
        className="flex-1 overflow-y-auto px-8 py-8 space-y-6 bg-zinc-50/90 dark:bg-[#09090B]/95 dark:bg-blend-multiply relative"
        style={{
          backgroundImage: "url('/assets/images/wallpaper.png')",
          backgroundSize: "360px",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          {/* Card profile panel */}
          <CallProfileCard
            name={call.name}
            avatarUrl={call.avatar}
            isOnline={call.isOnline}
            onStartAudioCall={handleAudioCall}
            onStartVideoCall={handleVideoCall}
          />

          {/* Call Log details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800 rounded-3xl shadow-md overflow-hidden">
            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/60 border-b border-zinc-150 dark:border-zinc-800/80 px-6">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Call Activity History
              </h4>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {call.history.map((record) => (
                <CallHistoryRow key={record.id} record={record} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CallDetailsWindow;
