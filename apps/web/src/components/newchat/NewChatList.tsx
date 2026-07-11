"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Search, UserPlus, Users, Grid, Loader2, X } from "lucide-react";
import { useSearchUsers } from "@/hooks/api/use-user";
import { useCreateConversation } from "@/hooks/api/use-conversations";
import { useAuthStore } from "@/store/auth-store";
import { useRealtimeStore } from "@/store/realtime-store";
import { useSocket } from "@/providers/socket-provider";
import { toast } from "sonner";
import { Avatar } from "../ui";

interface NewChatListProps {
    onBack: () => void;
    onSelectRoom: (roomId: string) => void;
}

export function NewChatList({ onBack, onSelectRoom }: NewChatListProps) {
    const currentUser = useAuthStore((state) => state.user);
    const { isConnected } = useSocket();
    // Subscribe to the Set directly so re-renders fire when it changes
    const onlineUsers = useRealtimeStore((state) => state.onlineUsers);
    const [view, setView] = useState<"menu" | "group_create">("menu");
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchTerm);
        }, 250);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data: usersResponse, isLoading: isLoadingUsers } = useSearchUsers(debouncedQuery);
    const createConvMutation = useCreateConversation();

    const handleSelectUser = (targetUserId: string) => {
        if (targetUserId === currentUser?.id) {
            toast.info("Messaging yourself is not supported on the backend yet.");
            return;
        }

        createConvMutation.mutate(
            {
                type: "direct",
                participantIds: [targetUserId],
            },
            {
                onSuccess: (response) => {
                    const newRoomId = response.data?.conversation?._id;
                    if (newRoomId) {
                        onSelectRoom(newRoomId);
                    }
                },
            }
        );
    };

    const handleToggleSelectForGroup = (userId: string) => {
        setSelectedUserIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const handleCreateGroup = () => {
        if (!groupName.trim()) {
            toast.error("Please enter a group name.");
            return;
        }
        if (selectedUserIds.size === 0) {
            toast.error("Please select at least one contact to join the group.");
            return;
        }

        createConvMutation.mutate(
            {
                type: "group",
                name: groupName.trim(),
                description: groupDescription.trim() || undefined,
                participantIds: Array.from(selectedUserIds),
            },
            {
                onSuccess: (response) => {
                    const newRoomId = response.data?.conversation?._id;
                    if (newRoomId) {
                        toast.success("Group created successfully!");
                        onSelectRoom(newRoomId);
                        setView("menu");
                        setGroupName("");
                        setGroupDescription("");
                        setSelectedUserIds(new Set());
                    }
                },
            }
        );
    };

    const usersList = usersResponse?.data?.users || [];

    // Group contacts alphabetically
    const groupedContacts = useMemo(() => {
        const groups: Record<string, any[]> = {};

        usersList.forEach((user: any) => {
            // Skip current user (rendered separately at the top)
            if (user._id === currentUser?.id) return;

            const name = user.displayName || user.username || "";
            let firstLetter = name.charAt(0).toUpperCase();

            // Check if alphabetical character, else group under '#'
            if (!/^[A-Z]$/.test(firstLetter)) {
                firstLetter = "#";
            }

            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            groups[firstLetter]!.push(user);
        });

        // Sort the keys alphabetically, with '#' at the end or top. Let's place '#' at the beginning
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === "#") return -1;
            if (b === "#") return 1;
            return a.localeCompare(b);
        });

        const sortedGroups: Array<{ key: string; contacts: any[] }> = [];
        sortedKeys.forEach((key) => {
            // Sort contacts inside each group alphabetically by display name
            const groupList = groups[key] || [];
            groupList.sort((c1, c2) => {
                const n1 = c1.displayName || c1.username || "";
                const n2 = c2.displayName || c2.username || "";
                return n1.localeCompare(n2);
            });
            sortedGroups.push({ key, contacts: groupList });
        });

        return sortedGroups;
    }, [usersList, currentUser]);

    if (view === "group_create") {
        const selectedUsers = usersList.filter((u: any) => selectedUserIds.has(u._id));

        return (
            <div className="w-full md:w-100 md:min-w-[430px] md:max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none animate-fadeIn">
                {/* 1. Header */}
                <div className="h-20 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setView("menu");
                                setSelectedUserIds(new Set());
                                setGroupName("");
                                setGroupDescription("");
                            }}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C]"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                            New group
                        </h2>
                    </div>
                    <button
                        onClick={handleCreateGroup}
                        disabled={createConvMutation.isPending || !groupName.trim() || selectedUserIds.size === 0}
                        className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                    >
                        {createConvMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                        Create
                    </button>
                </div>

                {/* 2. Group info inputs */}
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

                {/* 3. Selected chips */}
                {selectedUsers.length > 0 && (
                    <div className="px-4 py-3 border-b border-zinc-150/40 dark:border-zinc-900/40 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0 bg-zinc-50/20 dark:bg-zinc-950">
                        {selectedUsers.map((user: any) => (
                            <div key={user._id} className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 dark:text-zinc-300 flex-shrink-0 animate-scaleIn border border-zinc-200/40 dark:border-zinc-850">
                                <Avatar
                                    src={user.avatar || user.avatarUrl}
                                    name={user.displayName || user.username}
                                    size="xs"
                                />
                                <span className="max-w-[70px] truncate">{user.displayName || user.username}</span>
                                <button
                                    onClick={() => handleToggleSelectForGroup(user._id)}
                                    className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. Search within contacts */}
                <div className="p-4 flex gap-2 flex-shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search contacts"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm outline-none transition focus:border-[#19E68C] dark:text-zinc-200"
                        />
                    </div>
                </div>

                {/* 5. Contacts list with checkbox selection */}
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
                                            const isSelected = selectedUserIds.has(contact._id);
                                            return (
                                                <button
                                                    key={contact._id}
                                                    onClick={() => handleToggleSelectForGroup(contact._id)}
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
                                                                {contact.about || "Offline"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3 flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleSelectForGroup(contact._id)}
                                                            className="h-4.5 w-4.5 rounded text-emerald-500 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer"
                                                        />
                                                    </div>
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

    return (
        <div className="w-full md:w-100 md:min-w-[430px] md:max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
            {/* 1. Header */}
            <div className="h-20 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                        New chat
                    </h2>
                </div>
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C]">
                    <Grid className="h-5 w-5" />
                </button>
            </div>

            {/* 2. Search Input */}
            <div className="p-4 flex gap-2 flex-shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search name or number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm outline-none transition focus:border-[#19E68C] dark:text-zinc-200"
                    />
                </div>
            </div>

            {/* 3. List Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Quick action items */}
                <div className="space-y-1">
                    <button
                        onClick={() => setView("group_create")}
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

                {/* Message Yourself Section */}
                {currentUser && !searchTerm && (
                    <div className="space-y-1 border-t border-zinc-150/40 dark:border-zinc-900/40 pt-3">
                        <button
                            onClick={() => handleSelectUser(currentUser.id)}
                            className="w-full flex items-center gap-4 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-2xl transition text-left"
                        >
                            <Avatar
                                src={currentUser.avatarUrl}
                                name={currentUser.displayName || currentUser.username}
                                size="lg"
                                className="border border-zinc-200 dark:border-zinc-800 shadow-sm"
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-850 dark:text-zinc-200 truncate">
                                    {currentUser.displayName || currentUser.username} (You)
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                    Message yourself
                                </p>
                            </div>
                        </button>
                    </div>
                )}

                {/* User Search/List Loader */}
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
                    /* Alphabetically Grouped Contacts List */
                    <div className="space-y-4 pt-1">
                        {groupedContacts.map((group) => (
                            <div key={group.key} className="space-y-1">
                                {/* Group Letter Heading */}
                                <div className="px-3 py-1">
                                    <span className="text-xs font-bold text-emerald-600 dark:text-[#19E68C] uppercase tracking-wider">
                                        {group.key}
                                    </span>
                                </div>

                                {/* Group Contacts */}
                                <div className="space-y-0.5">
                                    {group.contacts.map((contact) => (
                                        <button
                                            key={contact._id}
                                            onClick={() => handleSelectUser(contact._id)}
                                            disabled={createConvMutation.isPending}
                                            className="w-full flex items-center gap-4 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-2xl transition border border-transparent hover:border-zinc-100 dark:hover:border-zinc-900 text-left disabled:opacity-70"
                                        >
                                            {/* Avatar with online dot */}
                                            <div className="relative flex-shrink-0">
                                                <Avatar
                                                    src={contact.avatar || contact.avatarUrl}
                                                    name={contact.displayName || contact.username}
                                                    size="lg"
                                                    className="border border-zinc-200 dark:border-zinc-800 shadow-sm"
                                                />
                                                {/* Online/Offline indicator */}
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
                                                    {(isConnected ? onlineUsers.has(contact._id) : contact.isOnline)
                                                        ? "Online"
                                                        : contact.lastSeen
                                                            ? `Last seen ${new Date(contact.lastSeen).toLocaleDateString()}`
                                                            : contact.about || "Offline"}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NewChatList;
