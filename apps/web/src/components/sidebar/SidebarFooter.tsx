import React from "react";

interface SidebarFooterProps {
  isCollapsed: boolean;
  avatarUrl?: string;
  userName?: string;
  status?: string;
  onClick?: () => void;
}

export function SidebarFooter({
  isCollapsed,
  avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  userName = "John Doe",
  status = "Online",
  onClick,
}: SidebarFooterProps) {
  const isOnline = status.toLowerCase() === "online";

  return (
    <>
      {/* User Footer Profile */}
      {isCollapsed ? (
        <button
          onClick={onClick}
          className="p-4 border-t border-zinc-200/80 dark:border-zinc-900 flex justify-center bg-white dark:bg-zinc-950 w-full hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition"
        >
          <div className="relative">
            <img
              src={avatarUrl}
              className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
              alt="Profile"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-white dark:border-zinc-950" />
            )}
          </div>
        </button>
      ) : (
        <button
          onClick={onClick}
          className="p-4 border-t border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950 w-full hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={avatarUrl}
                className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                alt="Profile"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-white dark:border-zinc-950" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">
                {userName}
              </p>
              <p className="text-[10px] text-zinc-400 mt-1 leading-none truncate max-w-[150px]">{status}</p>
            </div>
          </div>
        </button>
      )}
    </>
  );
}
export default SidebarFooter;
