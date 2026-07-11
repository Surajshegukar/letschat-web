"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  MessageSquare,
  Radio,
  Phone,
  CircleDashed,
  Users,
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarThemeToggle } from "./SidebarThemeToggle";
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
    // { icon: Radio, label: "Channels", href: "/channels" },
    // { icon: Users, label: "Communities", href: "/communities" },
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

      <SidebarThemeToggle
        isCollapsed={isCollapsed}
        isDark={isDark}
        isLogoutPending={logoutMutation.isPending}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <SidebarFooter
        isCollapsed={isCollapsed}
        avatarUrl={user?.avatarUrl}
        userName={user?.displayName || user?.username}
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
