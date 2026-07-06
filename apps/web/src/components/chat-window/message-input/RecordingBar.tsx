import React from "react";
import { Trash2, Check } from "lucide-react";

interface RecordingBarProps {
  recordingSeconds: number;
  formatRecordTime: (secs: number) => string;
  onCancel: () => void;
  onSend: () => void;
}

export function RecordingBar({ recordingSeconds, formatRecordTime, onCancel, onSend }: RecordingBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-red-200/30 dark:border-zinc-800/40 animate-pulse w-full">
      <div className="flex items-center gap-2.5 pl-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
        <span className="text-xs font-extrabold text-rose-600 dark:text-rose-455">
          Recording Voice Note ({formatRecordTime(recordingSeconds)})
        </span>
      </div>
      <div className="flex items-center gap-2 pr-1">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-red-100 dark:hover:bg-zinc-800 text-rose-500 hover:text-rose-600 rounded-lg transition"
          title="Cancel Recording"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSend}
          className="h-8.5 w-8.5 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-[#19E68C] text-[#09090B] rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition"
          title="Send Voice Note"
        >
          <Check className="h-4.5 w-4.5 font-bold" />
        </button>
      </div>
    </div>
  );
}
