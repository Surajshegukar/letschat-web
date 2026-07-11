import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  valueClass?: string;
}

export function MetricCard({ label, value, valueClass = "text-slate-800 dark:text-zinc-200" }: MetricCardProps) {
  return (
    <div className="p-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-150/40 dark:border-zinc-850/30">
      <span className="block text-[9px] text-zinc-455 dark:text-zinc-500 truncate">{label}</span>
      <span className={`text-xs font-extrabold ${valueClass}`}>{value}</span>
    </div>
  );
}

export default MetricCard;
