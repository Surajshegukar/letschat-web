"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Avatar } from "../ui";
import { useNewChat } from "./hooks/use-new-chat";
import { NewChatHeader } from "./NewChatHeader";
import { NewChatMenu } from "./NewChatMenu";
import { NewGroupForm } from "./NewGroupForm";
import { ContactSelectionList } from "./ContactSelectionList";

interface NewChatListProps {
    onBack: () => void;
    onSelectRoom: (roomId: string) => void;
}

export function NewChatList({ onBack, onSelectRoom }: NewChatListProps) {
    const {
        currentUser,
        isConnected,
        onlineUsers,
        view,
        setView,
        groupName,
        setGroupName,
        groupDescription,
        setGroupDescription,
        selectedUserIds,
        setSelectedUserIds,
        searchTerm,
        setSearchTerm,
        isLoadingUsers,
        usersList,
        groupedContacts,
        selectedUsers,
        handleSelectUser,
        handleToggleSelectForGroup,
        handleCreateGroup,
        isCreatingConversation,
    } = useNewChat(onSelectRoom);

    if (view === "group_create") {
        return (
            <div className="w-full md:w-100 md:min-w-[430px] md:max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none animate-fadeIn">
                {/* Header */}
                <NewChatHeader
                    title="New group"
                    onBack={() => {
                        setView("menu");
                        setSelectedUserIds(new Set());
                        setGroupName("");
                        setGroupDescription("");
                    }}
                    rightElement={
                        <button
                            onClick={handleCreateGroup}
                            disabled={isCreatingConversation || !groupName.trim() || selectedUserIds.size === 0}
                            className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                        >
                            {isCreatingConversation && <Loader2 className="h-3 w-3 animate-spin" />}
                            Create
                        </button>
                    }
                />

                {/* Group Metadata Form */}
                <NewGroupForm
                    groupName={groupName}
                    setGroupName={setGroupName}
                    groupDescription={groupDescription}
                    setGroupDescription={setGroupDescription}
                    selectedUsers={selectedUsers}
                    onRemoveUser={handleToggleSelectForGroup}
                />

                {/* Contact Selection list */}
                <ContactSelectionList
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    isLoadingUsers={isLoadingUsers}
                    usersList={usersList}
                    groupedContacts={groupedContacts}
                    selectedUserIds={selectedUserIds}
                    onSelectContact={handleToggleSelectForGroup}
                    isConnected={isConnected}
                    onlineUsers={onlineUsers}
                    isGroupSelectionMode
                />
            </div>
        );
    }

    return (
        <div className="w-full md:w-100 md:min-w-[430px] md:max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
            {/* Header */}
            <NewChatHeader title="New chat" onBack={onBack} showGridButton />

            {/* List Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-3 space-y-4">
                    {/* Quick actions menu */}
                    <NewChatMenu onNewGroup={() => setView("group_create")} />

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

                    {/* Contact list display */}
                    <ContactSelectionList
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        isLoadingUsers={isLoadingUsers}
                        usersList={usersList}
                        groupedContacts={groupedContacts}
                        onSelectContact={handleSelectUser}
                        isConnected={isConnected}
                        onlineUsers={onlineUsers}
                    />
                </div>
            </div>
        </div>
    );
}

export default NewChatList;
