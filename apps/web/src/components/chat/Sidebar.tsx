"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  AtSign, 
  Pin, 
  MailOpen, 
  Users, 
  Radio, 
  Archive, 
  Trash2, 
  Search, 
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const navItems = [
  { icon: MessageSquare, label: "Chats", count: 12, active: true },
  { icon: AtSign, label: "Mentions", count: 3 },
  { icon: Pin, label: "Pinned" },
  { icon: MailOpen, label: "Unread", count: 12 },
  { icon: Users, label: "Groups" },
  { icon: Radio, label: "Channels" },
  { icon: Archive, label: "Archive" },
  { icon: Trash2, label: "Trash" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside className={`h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-[#FAFAFC] dark:bg-zinc-950 flex-shrink-0 select-none transition-all duration-300 ${
      isCollapsed ? "w-[76px]" : "w-[280px]"
    }`}>
      
      {/* Pane Header */}
      {isCollapsed ? (
        <div className="h-20 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-center">
          <button 
            onClick={() => setIsCollapsed(false)} 
            className="p-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-xl transition text-slate-500"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo size={36} />
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Let's Chat</span>
          </div>
          <button 
            onClick={() => setIsCollapsed(true)} 
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-xl transition text-slate-500 dark:text-zinc-400"
            title="Shrink Sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Pane Search */}
      {isCollapsed ? (
        <div className="p-4 flex justify-center border-b border-zinc-150/40 dark:border-zinc-900/40">
          <button 
            onClick={() => setIsCollapsed(false)} 
            className="p-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="p-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search (⌘K)" 
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm outline-none transition focus:border-[#19E68C] dark:text-zinc-205"
            />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto py-2 ${
        isCollapsed ? "px-2 space-y-2" : "px-3 space-y-1"
      }`}>
        {navItems.map((item) => {
          if (isCollapsed) {
            return (
              <button 
                key={item.label}
                onClick={() => setIsCollapsed(false)}
                className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition mx-auto ${
                  item.active 
                    ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]" 
                    : "text-slate-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
                }`}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
                {item.count && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#19E68C] border-2 border-[#FAFAFC] dark:border-zinc-950" />
                )}
              </button>
            );
          }

          return (
            <button 
              key={item.label}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                item.active 
                  ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]" 
                  : "text-slate-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </div>
              {item.count && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.active 
                    ? "bg-[#19E68C]/20 text-emerald-650 dark:bg-[#19E68C]/20 dark:text-[#19E68C]" 
                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-450"
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Footer Profile */}
      {isCollapsed ? (
        <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-900 flex justify-center bg-white dark:bg-zinc-950">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" 
              className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" 
              alt="Profile" 
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-white dark:border-zinc-950" />
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" 
                className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" 
                alt="Profile" 
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-white dark:border-zinc-950" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">John Doe</p>
              <p className="text-[10px] text-zinc-400 mt-1 leading-none">Online</p>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
