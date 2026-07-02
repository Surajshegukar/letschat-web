"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  MessageSquare,
  AtSign,
  Pin,
  MailOpen,
  Users,
  Radio,
  Archive,
  Trash2,
  Phone,
  Sun,
  Moon,
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
  const { isCollapsed, toggleSidebar, expandSidebar } = useSidebar(true);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const isDark = mounted && theme === "dark";

  const navItems = [
    { icon: MessageSquare, label: "Chats", count: 12, href: "/chat" },
    { icon: Phone, label: "Calls", count: 2, href: "/calls" },
    { icon: Radio, label: "Channels", href: "#" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "#") return false;
    if (href === "/chat" && pathname === "/") return true; // Default
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <aside
      className={`h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-[#FAFAFC] dark:bg-zinc-950 flex-shrink-0 select-none transition-all duration-300 ${
        isCollapsed ? "w-[76px]" : "w-[280px]"
      }`}
    >
      <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />

      {/* Navigation Links */}
      <div
        className={`flex-1 overflow-y-auto py-2 ${
          isCollapsed ? "px-2 space-y-2" : "px-3 space-y-1"
        }`}
      >
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            count={item.count}
            active={isLinkActive(item.href)}
            isCollapsed={isCollapsed}
            onClickCollapsed={expandSidebar}
            href={item.href}
          />
        ))}
      </div>

      {/* Theme Toggle */}
      {isCollapsed ? (
        <div className="py-2 flex justify-center border-t border-zinc-150/40 dark:border-zinc-900/40 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center rounded-xl transition mx-auto text-slate-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-500 animate-pulse" /> : <Moon className="h-5 w-5 text-indigo-500" />}
          </button>
        </div>
      ) : (
        <div className="px-3 py-2 border-t border-zinc-150/40 dark:border-zinc-900/40 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition text-slate-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Sun className="h-4.5 w-4.5 text-amber-500 animate-pulse" /> : <Moon className="h-4.5 w-4.5 text-indigo-500" />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full p-0.5 transition ${isDark ? "bg-[#19E68C]" : "bg-zinc-300 dark:bg-zinc-800"}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition shadow-sm ${isDark ? "translate-x-3.5" : "translate-x-0"}`} />
            </div>
          </button>
        </div>
      )}

      <SidebarFooter isCollapsed={isCollapsed} />
    </aside>
  );
}
export default Sidebar;
