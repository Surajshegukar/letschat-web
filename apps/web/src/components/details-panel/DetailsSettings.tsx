import React from "react";
import { CircleAlert, Unlock } from "lucide-react";

interface DetailsSettingsProps {
  notificationsOn?: boolean;
  chatTheme?: string;
  isBlocked?: boolean;
  onBlockToggle?: () => void;
}

export function DetailsSettings({
  notificationsOn = true,
  chatTheme = "System",
  isBlocked = false,
  onBlockToggle,
}: DetailsSettingsProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
          Notifications
        </span>
        <span className="text-xs font-bold text-emerald-600 dark:text-[#19E68C]">
          {notificationsOn ? "On" : "Off"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
          Chat Theme
        </span>
        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-300">{chatTheme}</span>
      </div>

      {/* Block alert button */}
      {onBlockToggle && (
        <button
          onClick={onBlockToggle}
          className={`w-full flex items-center gap-2 p-2.5 rounded-xl border transition font-bold text-xs justify-center uppercase tracking-wider mt-4 ${
            isBlocked
              ? "text-emerald-600 border-emerald-250/50 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              : "text-red-500 border-red-200/50 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10"
          }`}
        >
          {isBlocked ? (
            <>
              <Unlock className="h-4 w-4" />
              <span>Unblock User</span>
            </>
          ) : (
            <>
              <CircleAlert className="h-4 w-4" />
              <span>Block User</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
export default DetailsSettings;
