import React from "react";
import { User, X } from "lucide-react";

interface DetailsHeaderProps {
  onClose: () => void;
}

export function DetailsHeader({ onClose }: DetailsHeaderProps) {
  return (
    <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
        <User className="h-5 w-5 text-zinc-500" />
        <span>Details</span>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
export default DetailsHeader;
