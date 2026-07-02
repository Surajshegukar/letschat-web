import React from "react";
import { Phone, Video, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { CallRecord } from "@/types/calls";

interface CallRecordItemProps {
  call: CallRecord;
  isActive: boolean;
  onSelect: () => void;
}

export function CallRecordItem({ call, isActive, onSelect }: CallRecordItemProps) {
  const getCallIcon = (status: "incoming" | "outgoing" | "missed") => {
    switch (status) {
      case "incoming":
        return <PhoneIncoming className="h-3.5 w-3.5 text-emerald-500" />;
      case "outgoing":
        return <PhoneOutgoing className="h-3.5 w-3.5 text-slate-450" />;
      case "missed":
        return <PhoneIncoming className="h-3.5 w-3.5 text-rose-500" />;
      default:
        return <PhoneOutgoing className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between p-3 rounded-2xl transition text-left ${
        isActive
          ? "bg-[#19E68C]/15 text-slate-800 dark:bg-zinc-900 dark:text-[#19E68C]"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative flex-shrink-0">
          <img src={call.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
          {call.isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-950" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-bold truncate leading-tight ${
              call.status === "missed" ? "text-rose-500 dark:text-rose-400" : "text-slate-800 dark:text-zinc-300"
            }`}
          >
            {call.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 leading-none">
            {getCallIcon(call.status)}
            <span className="text-[11px] text-zinc-450 dark:text-zinc-500">{call.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="ml-2 flex-shrink-0">
        {call.type === "video" ? (
          <Video className="h-4.5 w-4.5 text-emerald-600 dark:text-[#19E68C]" />
        ) : (
          <Phone className="h-4.5 w-4.5 text-emerald-600 dark:text-[#19E68C]" />
        )}
      </div>
    </button>
  );
}
export default CallRecordItem;
