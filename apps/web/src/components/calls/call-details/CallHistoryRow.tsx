import React from "react";
import { PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { CallHistoryItem } from "@/types/calls";

interface CallHistoryRowProps {
  record: CallHistoryItem;
}

export function CallHistoryRow({ record }: CallHistoryRowProps) {
  const getHistoryIcon = (type: "incoming" | "outgoing" | "missed") => {
    switch (type) {
      case "incoming":
        return <PhoneIncoming className="h-4 w-4 text-emerald-500" />;
      case "outgoing":
        return <PhoneOutgoing className="h-4 w-4 text-slate-450" />;
      case "missed":
        return <PhoneIncoming className="h-4 w-4 text-rose-500" />;
      default:
        return <PhoneOutgoing className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getHistoryStatusText = (type: "incoming" | "outgoing" | "missed", duration?: string) => {
    switch (type) {
      case "incoming":
        return `Incoming call answered (${duration || "0s"})`;
      case "outgoing":
        return `Outgoing call answered (${duration || "0s"})`;
      case "missed":
        return "Missed call";
      default:
        return "Unknown call";
    }
  };

  return (
    <div className="p-4 px-6 flex items-start gap-4 text-left">
      <div className="p-2 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-150/40 dark:border-zinc-800 mt-0.5">
        {getHistoryIcon(record.type)}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-snug ${
            record.type === "missed"
              ? "text-rose-500 dark:text-rose-400 font-bold"
              : "text-slate-800 dark:text-zinc-200"
          }`}
        >
          {getHistoryStatusText(record.type, record.duration)}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-400 leading-none">
          <Clock className="h-3 w-3 text-zinc-450" />
          <span>{record.timestamp}</span>
        </div>
      </div>
    </div>
  );
}
export default CallHistoryRow;
