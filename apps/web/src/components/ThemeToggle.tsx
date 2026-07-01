import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center justify-between px-10 py-6 z-50">
      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-600">
        <Sparkles className="h-4 w-4 text-[#19E68C]" />
        <span className="text-xs font-medium uppercase tracking-[0.2em]">Web Client Desktop</span>
      </div>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/40 shadow-sm backdrop-blur-sm transition-all hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
        title="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-4.5 w-4.5 text-amber-500" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-indigo-600" />
        )}
      </button>
    </div>
  );
}
