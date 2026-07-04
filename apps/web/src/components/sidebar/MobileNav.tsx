"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageSquare, CircleDashed, Radio, Users, Phone } from "lucide-react";

const navItems = [
  { icon: MessageSquare, label: "Chats", href: "/chat" },
  { icon: CircleDashed, label: "Status", href: "/status" },
  { icon: Radio, label: "Channels", href: "/channels" },
  { icon: Users, label: "Communities", href: "/communities" },
  { icon: Phone, label: "Calls", href: "/calls" },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/chat" && pathname === "/") return true;
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-900 flex items-center justify-around px-2 pb-safe">
      {navItems.map(({ icon: Icon, label, href }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 py-3 px-3 rounded-xl transition min-w-0 ${
              active
                ? "text-emerald-500 dark:text-[#19E68C]"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "stroke-[2.5]" : ""}`} />
            <span className={`text-[10px] font-semibold truncate ${active ? "font-bold" : ""}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileNav;
