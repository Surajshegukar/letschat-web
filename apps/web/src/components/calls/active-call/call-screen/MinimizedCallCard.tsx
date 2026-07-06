import React from "react";
import { PhoneOff, Maximize2 } from "lucide-react";

interface MinimizedCallCardProps {
  callerName: string;
  callerAvatarUrl: string;
  statusText: string;
  onMaximize: () => void;
  onEndCall: () => void;
}

export function MinimizedCallCard({
  callerName,
  callerAvatarUrl,
  statusText,
  onMaximize,
  onEndCall,
}: MinimizedCallCardProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#0B132B]/95 border border-zinc-800/90 rounded-2xl p-4 shadow-2xl flex items-center justify-between text-white w-76 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <img src={callerAvatarUrl} className="h-10 w-10 rounded-full object-cover" alt="" />
        <div className="min-w-0 text-left">
          <p className="text-sm font-bold truncate leading-tight">{callerName}</p>
          <p className="text-[10px] text-emerald-450 mt-1 font-semibold leading-none">{statusText}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onMaximize}
          className="p-2 hover:bg-white/10 rounded-lg transition text-zinc-300"
          title="Maximize call screen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={onEndCall}
          className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
          title="End Call"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
