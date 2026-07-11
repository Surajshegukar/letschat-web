"use client";

import React from "react";
import { ArrowLeft, Star, FileText } from "lucide-react";

interface StarredMessagesViewProps {
    onBack: () => void;
    starredMessages: any[];
}

export function StarredMessagesView({ onBack, starredMessages }: StarredMessagesViewProps) {
    return (
        <div className="fixed inset-0 z-40 md:static md:z-auto md:w-80 md:h-full md:flex-shrink-0 flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 select-none animate-fadeIn">
            <div className="h-16 px-6 border-b border-zinc-300 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900 flex-shrink-0">
                <button
                    onClick={onBack}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-bold text-slate-800 dark:text-white">Starred Messages</span>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-900">
                {starredMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 p-6 text-center">
                        <Star className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                        <p className="text-xs font-semibold">No starred messages</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-1 max-w-[180px] leading-relaxed">
                            Star messages from the message menu to save them here.
                        </p>
                    </div>
                ) : (
                    starredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-150/60 dark:border-zinc-800/80 shadow-sm flex flex-col text-left group hover:border-amber-500/35 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200">
                                    {msg.senderName}
                                </span>
                                <span className="text-[9px] text-zinc-400">{msg.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-650 dark:text-zinc-355 line-clamp-3 leading-relaxed break-all">
                                {msg.content}
                            </p>
                            {msg.attachment && (
                                <div className="mt-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150/40 dark:border-zinc-800 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-emerald-500" />
                                    <span className="text-[10px] font-medium text-zinc-550 dark:text-zinc-400 truncate flex-1">
                                        {msg.attachment.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
