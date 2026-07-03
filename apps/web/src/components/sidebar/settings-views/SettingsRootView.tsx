import React from "react";
import { Search } from "lucide-react";
import { SettingsOption } from "@/types/settings";

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
        <div className="relative flex items-center bg-zinc-100/70 dark:bg-zinc-900/40 border border-transparent focus-within:border-zinc-200 dark:focus-within:border-zinc-800 rounded-xl px-3.5 py-2 transition-all">
          <Search className="h-4 w-4 text-zinc-455 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none focus:ring-0 text-sm text-slate-800 dark:text-zinc-250 placeholder-zinc-455 w-full"
          />
        </div>
      </div>

      {/* 2. User Profile Summary card */}
      <div className="p-3 bg-white dark:bg-zinc-950/20 border-b border-zinc-200/40 dark:border-zinc-900/60 flex-shrink-0">
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

            <img
              src={user?.avatarUrl || avatarPresets[0]}
              className="h-14 w-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-850 shadow-sm bg-zinc-100 dark:bg-zinc-800 flex-shrink-0"
              alt="User Avatar"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">
              {user?.username}
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
