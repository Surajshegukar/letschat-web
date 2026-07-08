import React from "react";
import { Sun, Moon, Wallpaper, History, Archive } from "lucide-react";

interface SettingsChatsViewProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export function SettingsChatsView({ theme, setTheme }: SettingsChatsViewProps) {
  return (
    <div className="p-4 space-y-4 text-left">
      {/* Theme Selector */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-indigo-500" />
            ) : (
              <Sun className="h-5 w-5 text-amber-500" />
            )}
            <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
              Application Theme
            </span>
            <span className="bg-emerald-500/10 text-emerald-650 dark:text-[#19E68C] px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ml-2">
              Functional
            </span>
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-[#F0F2F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-normal font-semibold">
          Customize standard theme layouts dynamically based on your screen preferences.
        </p>
      </div>

      {/* Wallpaper controls */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallpaper className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-855 dark:text-zinc-200">
                Chat Wallpaper
              </p>
              <span className="bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
            <p className="text-[9px] text-zinc-450 dark:text-zinc-500 font-semibold mt-0.5">
              Choose backdrop details for message feeds.
            </p>
          </div>
        </div>
        <button
          onClick={() => alert("Wallpaper gallery selector coming soon!")}
          className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-[10px] font-bold rounded-xl text-slate-655 dark:text-zinc-400 transition"
        >
          Select
        </button>
      </div>

      {/* Archive controls */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
          <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
            Chat Archive Logs
          </span>
          <span className="bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ml-2">
            Coming Soon
          </span>
        </div>
        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-normal font-semibold">
          Archive all active conversations. Archived chats remain hidden until a new message is received.
        </p>
        <button
          onClick={() => alert("All chats archived.")}
          className="w-full py-2.5 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-bold rounded-xl text-slate-655 dark:text-zinc-400 transition flex items-center justify-center gap-2"
        >
          <Archive className="h-4 w-4" />
          <span>Archive All Conversations</span>
        </button>
      </div>
    </div>
  );
}

export default SettingsChatsView;
