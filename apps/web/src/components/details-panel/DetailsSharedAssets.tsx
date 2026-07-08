import React from "react";
import { ChevronRight, FileText, Star, Users } from "lucide-react";

interface DetailsSharedAssetsProps {
  onOpenMedia?: () => void;
  onOpenStarred?: () => void;
  starredCount: number;
  mediaCount: number;
}

export function DetailsSharedAssets({
  onOpenMedia,
  onOpenStarred,
  starredCount,
  mediaCount,
}: DetailsSharedAssetsProps) {
  const items = [
    { icon: FileText, label: "Media, Links & Files", count: mediaCount, onClick: onOpenMedia },
    { icon: Star, label: "Starred Messages", count: starredCount, onClick: onOpenStarred },
    { icon: Users, label: "Shared Groups", count: 0, onClick: undefined },
  ];

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          disabled={!item.onClick}
          className="w-full flex items-center justify-between py-2.5 px-1 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 rounded-xl transition text-left disabled:hover:bg-transparent"
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-100" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
              {item.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-450 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">
              {item.count}
            </span>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>
        </button>
      ))}
    </div>
  );
}
export default DetailsSharedAssets;
