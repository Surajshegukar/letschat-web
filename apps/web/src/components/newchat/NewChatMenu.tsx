"use client";

import React from "react";
import { Users, UserPlus } from "lucide-react";

interface NewChatMenuProps {
    onNewGroup: () => void;
}

export function NewChatMenu({ onNewGroup }: NewChatMenuProps) {
    return (
        <div className="space-y-1">
            <button
                onClick={onNewGroup}
                className="w-full flex items-center gap-4 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-2xl transition text-left"
            >
                <div className="h-11 w-11 rounded-full bg-emerald-500 dark:bg-emerald-500/20 text-white dark:text-[#19E68C] flex items-center justify-center shadow-sm">
                    <Users className="h-5.5 w-5.5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-850 dark:text-zinc-200">New group</p>
                </div>
            </button>

            <button
                onClick={() => alert("New Contact feature is coming soon!")}
                className="w-full flex items-center gap-4 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-2xl transition text-left"
            >
                <div className="h-11 w-11 rounded-full bg-emerald-500 dark:bg-emerald-500/20 text-white dark:text-[#19E68C] flex items-center justify-center shadow-sm">
                    <UserPlus className="h-5.5 w-5.5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-850 dark:text-zinc-200">New contact</p>
                </div>
            </button>

            <button
                onClick={() => alert("New Community feature is coming soon!")}
                className="w-full flex items-center gap-4 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-2xl transition text-left"
            >
                <div className="h-11 w-11 rounded-full bg-emerald-500 dark:bg-emerald-500/20 text-white dark:text-[#19E68C] flex items-center justify-center shadow-sm">
                    <Users className="h-5.5 w-5.5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-850 dark:text-zinc-200">New community</p>
                </div>
            </button>
        </div>
    );
}
