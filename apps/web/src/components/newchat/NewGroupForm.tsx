"use client";

import React from "react";
import { X } from "lucide-react";
import { Avatar } from "../ui";

interface NewGroupFormProps {
    groupName: string;
    setGroupName: (val: string) => void;
    groupDescription: string;
    setGroupDescription: (val: string) => void;
    selectedUsers: any[];
    onRemoveUser: (userId: string) => void;
}

export function NewGroupForm({
    groupName,
    setGroupName,
    groupDescription,
    setGroupDescription,
    selectedUsers,
    onRemoveUser,
}: NewGroupFormProps) {
    return (
        <>
            {/* Group info inputs */}
            <div className="p-4 border-b border-zinc-150/60 dark:border-zinc-900 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/10 flex-shrink-0">
                <div>
                    <input
                        type="text"
                        placeholder="Group Subject (required)"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        maxLength={50}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[#19E68C] dark:text-zinc-200"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Group Description (optional)"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        maxLength={200}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[#19E68C] dark:text-zinc-200"
                    />
                </div>
            </div>

            {/* Selected chips */}
            {selectedUsers.length > 0 && (
                <div className="px-4 py-3 border-b border-zinc-150/40 dark:border-zinc-900/40 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0 bg-zinc-50/20 dark:bg-zinc-950">
                    {selectedUsers.map((user) => (
                        <div key={user._id} className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 dark:text-zinc-300 flex-shrink-0 animate-scaleIn border border-zinc-200/40 dark:border-zinc-850">
                            <Avatar
                                src={user.avatar || user.avatarUrl}
                                name={user.displayName || user.username}
                                size="xs"
                            />
                            <span className="max-w-[70px] truncate">{user.displayName || user.username}</span>
                            <button
                                onClick={() => onRemoveUser(user._id)}
                                className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
