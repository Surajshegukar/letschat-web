"use client";

import React from "react";
import { 
  X, 
  User, 
  Search, 
  Bell, 
  MoreHorizontal, 
  ChevronRight, 
  FileText,
  Star,
  Users,
  CircleAlert
} from "lucide-react";

interface DetailsPanelProps {
  onClose: () => void;
}

const sharedItems = [
  { icon: FileText, label: "Media, Links & Files", count: 128 },
  { icon: Star, label: "Starred Messages", count: 12 },
  { icon: Users, label: "Shared Groups", count: 4 },
];

export function DetailsPanel({ onClose }: DetailsPanelProps) {
  return (
    <div className="w-80 h-full flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
      
      {/* Header */}
      <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
          <User className="h-5 w-5 text-zinc-500" />
          <span>Details</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Profile Card Section */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" 
              className="h-20 w-20 rounded-full object-cover shadow-md border-2 border-zinc-100 dark:border-zinc-800" 
              alt="Avatar" 
            />
            <span className="absolute bottom-0 right-1.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-950" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white mt-3 leading-none">Olivia Rhye</h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 leading-none">Online</p>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-4 gap-2 border-b border-zinc-150 dark:border-zinc-900 pb-5">
          <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
            <User className="h-5 w-5 text-slate-600 dark:text-zinc-450" />
            <span className="text-[10px] text-zinc-400 mt-1.5 font-medium">Profile</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
            <Search className="h-5 w-5 text-slate-600 dark:text-zinc-455" />
            <span className="text-[10px] text-zinc-400 mt-1.5 font-medium">Search</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
            <Bell className="h-5 w-5 text-slate-600 dark:text-zinc-455" />
            <span className="text-[10px] text-zinc-400 mt-1.5 font-medium">Mute</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
            <MoreHorizontal className="h-5 w-5 text-slate-600 dark:text-zinc-455" />
            <span className="text-[10px] text-zinc-400 mt-1.5 font-medium">More</span>
          </button>
        </div>

        {/* About Section */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">About</span>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
            Product Designer @ Let's Chat. Passionate about UI/UX design and building beautiful products.
          </p>
        </div>

        {/* Shared Assets List */}
        <div className="space-y-1.5">
          {sharedItems.map((item) => (
            <button 
              key={item.label}
              className="w-full flex items-center justify-between py-2.5 px-1 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 rounded-xl transition text-left"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-350">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">{item.count}</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Settings Block */}
        <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-900">
          
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-350">Notifications</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-[#19E68C]">On</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-350">Chat Theme</span>
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">System</span>
          </div>

          {/* Block alert button */}
          <button className="w-full flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2.5 rounded-xl border border-red-200/50 dark:border-red-500/20 transition font-bold text-xs justify-center uppercase tracking-wider mt-4">
            <CircleAlert className="h-4 w-4" />
            <span>Block User</span>
          </button>

        </div>

      </div>

    </div>
  );
}
