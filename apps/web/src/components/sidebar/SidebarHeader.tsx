import React from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarHeader({ isCollapsed, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <>
      {/* Pane Header */}
      {isCollapsed ? (
        <div className="h-20 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-xl transition text-slate-500"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo size={36} />
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Let's Chat
            </span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-xl transition text-slate-500 dark:text-zinc-400"
            title="Shrink Sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Pane Search */}
      {isCollapsed ? (
        <div className="p-4 flex justify-center border-b border-zinc-150/40 dark:border-zinc-900/40">
          <button
            onClick={onToggleCollapse}
            className="p-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="p-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm outline-none transition focus:border-[#19E68C] dark:text-zinc-205"
            />
          </div>
        </div>
      )}
    </>
  );
}
export default SidebarHeader;
