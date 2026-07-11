"use client";

import React from "react";
import { Pencil, Plus, LogOut } from "lucide-react";
import { DetailsHeader } from "./DetailsHeader";
import { DetailsProfileCard } from "./DetailsProfileCard";
import { DetailsAbout } from "./DetailsAbout";
import { DetailsSharedAssets } from "./DetailsSharedAssets";
import { DetailsSettings } from "./DetailsSettings";
import { GroupMembersList } from "./GroupMembersList";
import { StarredMessagesView } from "./StarredMessagesView";
import { AddMembersSection } from "./AddMembersSection";
import { useDetailsPanel } from "./hooks/use-details-panel";

interface DetailsPanelProps {
  activeRoomId?: string | null;
  onClose: () => void;
  onOpenMedia?: () => void;
}

export function DetailsPanel({ activeRoomId, onClose, onOpenMedia }: DetailsPanelProps) {
  const {
    room,
    subView,
    setSubView,
    isEditingName,
    setIsEditingName,
    editedName,
    setEditedName,
    isEditingDescription,
    setIsEditingDescription,
    editedDescription,
    setEditedDescription,
    showAddMembers,
    setShowAddMembers,
    selectedAddUserIds,
    setSelectedAddUserIds,
    starredMessages,
    mediaAssetsCount,
    participants,
    isAdmin,
    nonMembers,
    name,
    avatarUrl,
    status,
    bio,
    isConnected,
    onlineUsers,
    currentUserId,
    handleSaveName,
    handleSaveDescription,
    handleAddMembersSubmit,
    handlePromoteMember,
    handleRemoveMember,
    handleLeaveGroup,
    handleBlockToggle,
    isAddPending,
    isRemovePending,
  } = useDetailsPanel(activeRoomId, onClose);

  if (!room) {
    return (
      <div className="fixed inset-0 z-40 md:static md:z-auto md:w-80 md:h-full md:flex-shrink-0 flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-955 select-none items-center justify-center p-6 text-zinc-400 animate-fadeIn">
        <span>No active conversation</span>
      </div>
    );
  }

  if (subView === "starred") {
    return (
      <StarredMessagesView
        onBack={() => setSubView("main")}
        starredMessages={starredMessages}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-40 md:static md:z-auto md:w-80 md:h-full md:flex-shrink-0 flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 select-none animate-fadeIn">
      <DetailsHeader onClose={onClose} />

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
        {/* Custom Group Card or Profile Card */}
        {room.type === "group" ? (
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-[#19E68C]/15 text-emerald-650 flex items-center justify-center font-bold text-2xl dark:bg-[#19E68C]/10 dark:text-[#19E68C] shadow-md border-2 border-zinc-100 dark:border-zinc-800 animate-fadeIn">
                {name.charAt(0)}
              </div>
            </div>

            <div className="mt-3 w-full flex flex-col items-center">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full max-w-[200px] animate-fadeIn">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    maxLength={50}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#19E68C] text-center dark:text-zinc-200"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-xs font-bold text-emerald-655 dark:text-[#19E68C] hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setEditedName(name);
                    }}
                    className="text-xs font-bold text-zinc-450 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-800 dark:text-white leading-none">
                    {name}
                  </h4>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setEditedName(name);
                      }}
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-400 hover:text-emerald-500 transition"
                      title="Edit Group Name"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 leading-none">{status}</p>
          </div>
        ) : (
          <DetailsProfileCard
            name={name}
            avatarUrl={avatarUrl}
            status={status}
          />
        )}

        {/* Group Description or User Bio */}
        {room.type === "group" ? (
          <div className="bg-zinc-50/50 dark:bg-zinc-900/40 p-4.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 text-left space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Group Description
              </span>
              {isAdmin && (
                isEditingDescription ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDescription}
                      className="text-xs font-bold text-emerald-600 dark:text-[#19E68C] hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingDescription(false);
                        setEditedDescription(bio);
                      }}
                      className="text-xs font-bold text-zinc-450 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingDescription(true);
                      setEditedDescription(bio === "No description set for this group." ? "" : bio);
                    }}
                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-400 hover:text-emerald-500 transition"
                    title="Edit Group Description"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )
              )}
            </div>
            {isEditingDescription ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                maxLength={200}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#19E68C] dark:text-zinc-200 resize-none h-16"
                autoFocus
              />
            ) : (
              <p className="text-xs sm:text-sm text-slate-650 dark:text-zinc-300 leading-relaxed font-semibold">
                {bio}
              </p>
            )}
          </div>
        ) : (
          <DetailsAbout bio={bio} />
        )}

        {/* Group members list, add members panel — hidden for removed participants */}
        {room.type === "group" && !room.isRemoved && (
          <div className="space-y-3 text-left animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider">
                Group Members ({participants.filter((p: any) => !p.isDeleted).length})
              </span>
              {isAdmin && !showAddMembers && nonMembers.length > 0 && (
                <button
                  onClick={() => setShowAddMembers(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-[#19E68C] hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add Members
                </button>
              )}
            </div>

            {showAddMembers && nonMembers.length > 0 && (
              <AddMembersSection
                onClose={() => {
                  setShowAddMembers(false);
                  setSelectedAddUserIds(new Set());
                }}
                nonMembers={nonMembers}
                selectedAddUserIds={selectedAddUserIds}
                setSelectedAddUserIds={setSelectedAddUserIds}
                onSubmit={handleAddMembersSubmit}
                isPending={isAddPending}
              />
            )}

            <GroupMembersList
              participants={participants}
              currentUserId={currentUserId}
              onlineUsers={onlineUsers}
              isConnected={isConnected}
              isAdmin={isAdmin}
              onPromote={handlePromoteMember}
              onRemove={handleRemoveMember}
            />
          </div>
        )}

        <DetailsSharedAssets
          onOpenMedia={onOpenMedia}
          onOpenStarred={() => setSubView("starred")}
          starredCount={starredMessages.length}
          mediaCount={mediaAssetsCount}
        />

        <DetailsSettings
          isBlocked={room.type === "direct" ? !!room.isBlocked : undefined}
          onBlockToggle={room.type === "direct" ? handleBlockToggle : undefined}
        />

        {/* Leave group button */}
        {room.type === "group" && !room.isRemoved && (
          <button
            onClick={handleLeaveGroup}
            disabled={isRemovePending}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-red-200/50 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition font-bold text-xs justify-center uppercase tracking-wider mt-4 text-red-500"
          >
            <LogOut className="h-4 w-4" />
            <span>Leave Group</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default DetailsPanel;
