import React from "react";
import { Search } from "lucide-react";
import { SettingsOption } from "@/types/settings";
import { Avatar } from "../../ui";

interface SettingsRootViewProps {
  user: any;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredOptions: SettingsOption[];
  onSelectView: (view: any) => void;
  avatarPresets: string[];
}

export function SettingsRootView({
  user,
  searchQuery,
  setSearchQuery,
  filteredOptions,
  onSelectView,
  avatarPresets,
}: SettingsRootViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 1. Search Settings */}
      <div className="px-4 py-3 border-b border-zinc-150/40 dark:border-zinc-900/60 bg-white dark:bg-zinc-950 flex-shrink-0">
        <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 rounded-xl px-3 py-2 border border-zinc-200/50 dark:border-zinc-800/55 shadow-inner">
          <Search className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-zinc-450 dark:placeholder-zinc-500 focus:outline-none focus:ring-0 border-none p-0"
          />
        </div>
      </div>

      {/* 2. User Profile Card Link */}
      <div className="bg-white dark:bg-zinc-950 p-4 border-b border-zinc-150/40 dark:border-zinc-900/60">
        <button
          onClick={() => onSelectView("profile")}
          className="w-full flex items-center gap-4 p-4.5 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/40 hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 rounded-2xl shadow-sm transition text-left"
        >
          <div className="relative flex flex-col items-center">
            {/* Custom status badge */}
            {/* <div className="absolute top-[-38px] bg-gradient-to-r from-emerald-500/10 to-[#19E68C]/15 dark:from-emerald-955/40 dark:to-[#19E68C]/10 border border-[#19E68C]/30 text-emerald-755 dark:text-[#19E68C] px-3.5 py-1 rounded-full text-[10px] font-black shadow-sm whitespace-nowrap">
              <span>Available After 6 PM</span>
              <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-emerald-100 dark:border-t-emerald-950" />
            </div> */}

            <Avatar
              src={user?.avatarUrl}
              name={user?.displayName || user?.username}
              size="xl"
              className="border border-zinc-200 dark:border-zinc-850 shadow-sm flex-shrink-0"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">
              {user?.displayName || user?.username}
            </h3>
            <p className="text-[11px] text-zinc-450 dark:text-zinc-500 mt-1 truncate">
              {user?.about || "Hey there! I am using Let's Chat."}
            </p>
          </div>
        </button>
      </div>

      {/* 3. Settings Option List */}
      <div className="bg-white dark:bg-zinc-950 flex-1 py-2 p-3 space-y-2.5">
        {filteredOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => opt.view && onSelectView(opt.view)}
              className="w-full flex items-center gap-4 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 text-left transition"
            >
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-505 dark:text-zinc-450 shadow-sm flex-shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-medium text-slate-855 dark:text-zinc-200 capital tracking-wide">
                  {opt.title}
                </h4>
                <p className="text-[12px] text-zinc-455 dark:text-zinc-500 mt-1.5 leading-normal">
                  {opt.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SettingsRootView;
