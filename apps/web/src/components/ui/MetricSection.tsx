import React from "react";

interface MetricSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function MetricSection({ title, icon, children }: MetricSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-zinc-450 uppercase">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default MetricSection;
