"use client";

import React from "react";
import { Search, Loader2 } from "lucide-react";
import { Avatar } from "../ui";

interface ContactSelectionListProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    isLoadingUsers: boolean;
    usersList: any[];
    groupedContacts: Array<{ key: string; contacts: any[] }>;
    selectedUserIds?: Set<string>;
    onSelectContact: (userId: string) => void;
    isConnected: boolean;
    onlineUsers: Set<string>;
    isGroupSelectionMode?: boolean;
}

export function ContactSelectionList({
    searchTerm,
    setSearchTerm,
    isLoadingUsers,
    usersList,
    groupedContacts,
    selectedUserIds,
    onSelectContact,
    isConnected,
    onlineUsers,
    isGroupSelectionMode = false,
}: ContactSelectionListProps) {
    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Search Input */}
            <div className="p-4 flex gap-2 flex-shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    <input
                        type="text"
                        placeholder={isGroupSelectionMode ? "Search contacts" : "Search name or number"}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm outline-none transition focus:border-[#19E68C] dark:text-zinc-200"
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {isLoadingUsers ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                        <span className="text-xs text-zinc-400 font-medium">Loading contacts...</span>
                    </div>
                ) : usersList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-400 text-xs font-semibold">
                        No contacts found
                    </div>
                ) : (
                    <div className="space-y-4 pt-1">
                        {groupedContacts.map((group) => (
                            <div key={group.key} className="space-y-1">
                                <div className="px-3 py-1">
                                    <span className="text-xs font-bold text-emerald-600 dark:text-[#19E68C] uppercase tracking-wider">
                                        {group.key}
                                    </span>
                                </div>
                                <div className="space-y-0.5">
                                    {group.contacts.map((contact) => {
                                        const isSelected = selectedUserIds?.has(contact._id) || false;
                                        return (
                                            <button
                                                key={contact._id}
                                                onClick={() => onSelectContact(contact._id)}
                                                className={`w-full flex items-center justify-between p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-2xl transition border border-transparent hover:border-zinc-100 dark:hover:border-zinc-900 text-left ${
                                                    isSelected ? "bg-emerald-50/20 dark:bg-[#19E68C]/5" : ""
                                                }`}
                                            >
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <div className="relative flex-shrink-0">
                                                        <Avatar
                                                            src={contact.avatar || contact.avatarUrl}
                                                            name={contact.displayName || contact.username}
                                                            size="lg"
                                                            className="border border-zinc-200 dark:border-zinc-800 shadow-sm"
                                                        />
                                                        <span
                                                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950 ${
                                                                isConnected
                                                                    ? onlineUsers.has(contact._id)
                                                                        ? "bg-emerald-500"
                                                                        : "bg-zinc-400 dark:bg-zinc-600"
                                                                    : contact.isOnline
                                                                        ? "bg-emerald-500"
                                                                        : "bg-zinc-400 dark:bg-zinc-600"
                                                            }`}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-slate-850 dark:text-zinc-200 truncate">
                                                            {contact.displayName || contact.username}
                                                        </p>
                                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                                            {isGroupSelectionMode
                                                                ? contact.about || "Offline"
                                                                : (isConnected ? onlineUsers.has(contact._id) : contact.isOnline)
                                                                    ? "Online"
                                                                    : contact.lastSeen
                                                                        ? `Last seen ${new Date(contact.lastSeen).toLocaleDateString()}`
                                                                        : contact.about || "Offline"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isGroupSelectionMode && (
                                                    <div className="ml-3 flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => onSelectContact(contact._id)}
                                                            className="h-4.5 w-4.5 rounded text-emerald-500 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer"
                                                        />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
