import React from "react";
import { Sun, Moon, LogOut } from "lucide-react";

interface SidebarThemeToggleProps {
  isCollapsed: boolean;
  isDark: boolean;
  isLogoutPending: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function SidebarThemeToggle({
  isCollapsed,
  isDark,
  isLogoutPending,
  onToggleTheme,
  onLogout,
}: SidebarThemeToggleProps) {
  const themeIcon = isDark
    ? <Sun className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
    : <Moon className="h-4.5 w-4.5 text-indigo-500" />;

  if (isCollapsed) {
    return (
      <div className="py-2 flex flex-col items-center gap-2 border-t border-zinc-150/40 dark:border-zinc-900/40 flex-shrink-0">
        <button
          onClick={onToggleTheme}
          className="w-12 h-12 flex items-center justify-center rounded-xl transition mx-auto text-slate-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-500 animate-pulse" /> : <Moon className="h-5 w-5 text-indigo-500" />}
        </button>
        <button
          onClick={onLogout}
          className="w-12 h-12 flex items-center justify-center rounded-xl transition mx-auto text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          title="Log Out"
          disabled={isLogoutPending}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-t border-zinc-150/40 dark:border-zinc-900/40 flex flex-col gap-1.5 flex-shrink-0">
      <button
        onClick={onToggleTheme}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition text-slate-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
      >
        <div className="flex items-center gap-3">
          {themeIcon}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </div>
        <div className={`w-8 h-4.5 rounded-full p-0.5 transition ${isDark ? "bg-[#19E68C]" : "bg-zinc-300 dark:bg-zinc-800"}`}>
          <div className={`w-3.5 h-3.5 rounded-full bg-white transition shadow-sm ${isDark ? "translate-x-3.5" : "translate-x-0"}`} />
        </div>
      </button>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
        disabled={isLogoutPending}
      >
        <LogOut className="h-4.5 w-4.5" />
        <span>{isLogoutPending ? "Logging Out..." : "Log Out"}</span>
      </button>
    </div>
  );
}
