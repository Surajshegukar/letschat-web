import React from "react";
import { Minimize2, Lock } from "lucide-react";

interface CallTopBarProps {
  onMinimize: () => void;
}

export function CallTopBar({ onMinimize }: CallTopBarProps) {
  return (
    <div className="w-full flex items-center justify-between px-6 pt-6 z-30">
      <button
        onClick={onMinimize}
        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition text-zinc-300 border border-white/5"
        title="Minimize call"
      >
        <Minimize2 className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-zinc-400 font-semibold tracking-wider uppercase select-none">
        <Lock className="h-3 w-3 text-emerald-500" />
        <span>End-to-end encrypted</span>
      </div>

      <div className="w-10 h-10" />
    </div>
  );
}
