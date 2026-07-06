import React from "react";
import { Image as ImageIcon, FileText } from "lucide-react";

interface AttachmentMenuProps {
  onPhotoClick: () => void;
  onDocClick: () => void;
}

export function AttachmentMenu({ onPhotoClick, onDocClick }: AttachmentMenuProps) {
  return (
    <div className="absolute bottom-16 left-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-2xl shadow-xl z-20 space-y-1 w-44">
      <button
        onClick={onPhotoClick}
        className="w-full flex items-center gap-2.5 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition text-left text-xs font-bold text-slate-700 dark:text-zinc-300"
      >
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#19E68C]">
          <ImageIcon className="h-4 w-4" />
        </div>
        <span>Send Photo / Video</span>
      </button>
      <button
        onClick={onDocClick}
        className="w-full flex items-center gap-2.5 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition text-left text-xs font-bold text-slate-700 dark:text-zinc-300"
      >
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#19E68C]">
          <FileText className="h-4 w-4" />
        </div>
        <span>Send Document</span>
      </button>
    </div>
  );
}
