"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  MessageSquare,
  Radio,
  Phone,
  Sun,
  Moon,
  CircleDashed,
  Users,
  LogOut,
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarFooter } from "./SidebarFooter";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { ConfirmDialog } from "@/components/ui";
import { useLogout } from "@/hooks/api/use-auth";

export function Sidebar() {
  const { isCollapsed, toggleSidebar, expandSidebar } = useSidebar(true);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const { user } = useAuthStore();
  const { openProfileDrawer } = useUIStore();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const isDark = mounted && theme === "dark";

  const navItems = [
    { icon: MessageSquare, label: "Chats", count: 12, href: "/chat" },
    { icon: CircleDashed, label: "Status", href: "/status" },
    { icon: Radio, label: "Channels", href: "/channels" },
    { icon: Users, label: "Communities", href: "/communities" },
    { icon: Phone, label: "Calls", count: 2, href: "/calls" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "#") return false;
    if (href === "/chat" && pathname === "/") return true; // Default
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <aside
      className={`h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-[#FAFAFC] dark:bg-zinc-950 flex-shrink-0 select-none transition-all duration-300 ${isCollapsed ? "w-[76px]" : "w-[280px]"
        }`}
    >
      {/* <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} /> */}

      {/* Navigation Links */}
      <div
        className={`flex-1 overflow-y-auto py-2 ${isCollapsed ? "px-2 space-y-2" : "px-3 space-y-1"
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
            onClickCollapsed={() => { }}
            href={item.href}
          />
        ))}
      </div>

      {/* Theme Toggle & Logout */}
      {isCollapsed ? (
        <div className="py-2 flex flex-col items-center gap-2 border-t border-zinc-150/40 dark:border-zinc-900/40 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center rounded-xl transition mx-auto text-slate-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-500 animate-pulse" /> : <Moon className="h-5 w-5 text-indigo-500" />}
          </button>
          <button
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center rounded-xl transition mx-auto text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            title="Log Out"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="px-3 py-2 border-t border-zinc-150/40 dark:border-zinc-900/40 flex flex-col gap-1.5 flex-shrink-0">
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>{logoutMutation.isPending ? "Logging Out..." : "Log Out"}</span>
          </button>
        </div>
      )}

      <SidebarFooter
        isCollapsed={isCollapsed}
        avatarUrl={user?.avatarUrl}
        userName={user?.username}
        status={user?.about}
        onClick={openProfileDrawer}
      />

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={() => logoutMutation.mutate()}
        title="Log Out"
        message="Are you sure you want to log out? Any active chat sessions will be closed."
        confirmText="Log Out"
        variant="danger"
        isConfirming={logoutMutation.isPending}
      />
    </aside>
  );
}
export default Sidebar;
