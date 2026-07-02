"use client";

import React, { useState } from "react";
import { Link2, PhoneCall } from "lucide-react";
import { mockCalls } from "@/constants/mock-data";
import { CallsFilterPills } from "./CallsFilterPills";
import { CallRecordItem } from "./CallRecordItem";

interface CallsListProps {
  activeCallId: string | null;
  onSelectCall: (callId: string) => void;
}

export function CallsList({ activeCallId, onSelectCall }: CallsListProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "missed">("all");

  const filteredCalls = mockCalls.filter((call) => {
    if (activeFilter === "missed") return call.status === "missed";
    return true;
  });

  return (
    <div className="w-full max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
      {/* Title Header */}
      <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Calls</h2>
        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500">
          <PhoneCall className="h-5 w-5" />
        </button>
      </div>

      {/* Call list scroll area */}
      <div className="flex-1 overflow-y-auto">
        {/* Create call link row */}
        <div className="p-3 border-b border-zinc-150/40 dark:border-zinc-900/60">
          <button className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition text-left">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-500 to-[#19E68C]/80 text-[#09090B] flex items-center justify-center shadow-sm">
              <Link2 className="h-5 w-5 rotate-45" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-300">
                Create call link
              </p>
              <p className="text-xs text-zinc-450 mt-1">
                Share a link for your Let's Chat call
              </p>
            </div>
          </button>
        </div>

        {/* Filter pills */}
        <CallsFilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* Recent items list */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Recent
          </div>

          {filteredCalls.map((call) => (
            <CallRecordItem
              key={call.id}
              call={call}
              isActive={activeCallId === call.id}
              onSelect={() => onSelectCall(call.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default CallsList;
