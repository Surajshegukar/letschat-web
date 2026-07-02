import React from "react";

interface CallsFilterPillsProps {
  activeFilter: "all" | "missed";
  onFilterChange: (filter: "all" | "missed") => void;
}

export function CallsFilterPills({ activeFilter, onFilterChange }: CallsFilterPillsProps) {
  return (
    <div className="px-4 py-3 flex gap-2 flex-shrink-0">
      <button
        onClick={() => onFilterChange("all")}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${activeFilter === "all"
          ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C] dark:border dark:border-[#19E68C]"
          : "bg-zinc-100/70 hover:bg-zinc-200/60 text-slate-600 dark:bg-zinc-900/40 dark:text-zinc-300 dark:border"
          }`}
      >
        All
      </button>
      <button
        onClick={() => onFilterChange("missed")}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${activeFilter === "missed"
          ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C] dark:border dark:border-[#19E68C]"
          : "bg-zinc-100/70 hover:bg-zinc-200/60 text-slate-600 dark:bg-zinc-900/40 dark:text-zinc-300 dark:border"
          }`}
      >
        Missed
      </button>
    </div>
  );
}
export default CallsFilterPills;
