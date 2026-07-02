import { BrandLogo } from "@/components/BrandLogo";
import React from "react";

export function CallDetailsEmptyState() {
  return (
    <div
      className="flex-1 h-full flex flex-col bg-[#FAFAFC] dark:bg-[#09090B] select-none"
      style={{
        backgroundImage: "url('/assets/images/wallpaper.png')",
        backgroundSize: "360px",
        backgroundRepeat: "repeat",
      }}
    >
      {/* Empty State Header */}
      <div className="h-20 px-8 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950 flex-shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white leading-none">
            Call Details
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 leading-none">
            Select a call record to view details
          </p>
        </div>
      </div>

      {/* Empty State Body */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative">
        {/* overlay */}
        <div className="absolute top-0 left-0 w-full h-full content-[''] bg-[#0000000f] dark:bg-[#000000] z-1"></div>
        <BrandLogo size={80} />

        <h3 className="relative z-2 text-xl font-bold text-slate-800 dark:text-white mt-3">
          Your calls, all in one place
        </h3>
        <p className="relative z-2 text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">
          Select a call record from the left to view details or start a new conversation.
        </p>
      </div>
    </div>
  );
}
export default CallDetailsEmptyState;
