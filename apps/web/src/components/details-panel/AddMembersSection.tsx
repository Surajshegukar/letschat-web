"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import { Avatar } from "../ui";

interface AddMembersSectionProps {
    onClose: () => void;
    nonMembers: any[];
    selectedAddUserIds: Set<string>;
    setSelectedAddUserIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    onSubmit: () => void;
    isPending: boolean;
}

export function AddMembersSection({
    onClose,
    nonMembers,
    selectedAddUserIds,
    setSelectedAddUserIds,
    onSubmit,
    isPending,
}: AddMembersSectionProps) {
    return (
        <div className="bg-zinc-50/50 dark:bg-zinc-900/40 p-3.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 space-y-3 animate-slideDown">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Add to Group</span>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-650 transition"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {nonMembers.map((u: any) => {
                    const isSelected = selectedAddUserIds.has(u._id);
                    return (
                        <button
                            key={u._id}
                            onClick={() => {
                                setSelectedAddUserIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(u._id)) next.delete(u._id);
                                    else next.add(u._id);
                                    return next;
                                });
                            }}
                            className={`w-full flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-left transition ${
                                isSelected ? "bg-emerald-50/30 dark:bg-[#19E68C]/5" : ""
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <Avatar src={u.avatar || u.avatarUrl} name={u.displayName || u.username} size="sm" />
                                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 truncate">
                                    {u.displayName || u.username}
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 border-zinc-350 dark:border-zinc-700 cursor-pointer"
                            />
                        </button>
                    );
                })}
            </div>
            <button
                onClick={onSubmit}
                disabled={isPending || selectedAddUserIds.size === 0}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Add Selected ({selectedAddUserIds.size})
            </button>
        </div>
    );
}
