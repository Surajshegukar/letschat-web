import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  isCollapsed: boolean;
  onClickCollapsed?: () => void;
  href?: string;
}

export function SidebarNavItem({
  icon: Icon,
  label,
  count,
  active = false,
  isCollapsed,
  onClickCollapsed,
  href,
}: SidebarNavItemProps) {
  if (isCollapsed) {
    const collapsedClasses = `relative w-12 h-12 flex items-center justify-center rounded-xl transition mx-auto ${
      active
        ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]"
        : "text-slate-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
    }`;

    const collapsedContent = (
      <>
        <Icon className="h-5 w-5" />
        {count ? (
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#19E68C] border-2 border-[#FAFAFC] dark:border-zinc-950" />
        ) : null}
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          className={collapsedClasses}
          title={label}
          onClick={onClickCollapsed}
        >
          {collapsedContent}
        </Link>
      );
    }

    return (
      <button
        onClick={onClickCollapsed}
        className={collapsedClasses}
        title={label}
      >
        {collapsedContent}
      </button>
    );
  }

  const expandedClasses = `w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
    active
      ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]"
      : "text-slate-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
  }`;

  const expandedContent = (
    <>
      <div className="flex items-center gap-3">
        <Icon className="h-4.5 w-4.5" />
        <span>{label}</span>
      </div>
      {count ? (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            active
              ? "bg-[#19E68C]/20 text-emerald-650 dark:bg-[#19E68C]/20 dark:text-[#19E68C]"
              : "bg-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-450"
          }`}
        >
          {count}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={expandedClasses}>
        {expandedContent}
      </Link>
    );
  }

  return (
    <button className={expandedClasses}>
      {expandedContent}
    </button>
  );
}
export default SidebarNavItem;
