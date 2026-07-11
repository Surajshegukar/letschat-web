"use client";

import React from "react";
import {
  useConversations,
  useMessages,
  useUpdateGroup,
  useAddParticipants,
  useRemoveParticipant,
  usePromoteToAdmin
} from "@/hooks/api/use-conversations";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { formatConversation, RawConversation, formatMessage, RawMessage } from "@/utils/chat-helpers";
import { useRealtimeStore } from "@/store/realtime-store";
import { useSocket } from "@/providers/socket-provider";
import { DetailsHeader } from "./DetailsHeader";
import { DetailsProfileCard } from "./DetailsProfileCard";
import { DetailsAbout } from "./DetailsAbout";
import { DetailsSharedAssets } from "./DetailsSharedAssets";
import { DetailsSettings } from "./DetailsSettings";
import { GroupMembersList } from "./GroupMembersList";
import { ArrowLeft, Star, FileText, Pencil, Plus, LogOut, X, Search, Bell, MoreHorizontal, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockUser, useUnblockUser, useSearchUsers } from "@/hooks/api/use-user";
import { toast } from "sonner";
import { Avatar } from "../ui";

interface DetailsPanelProps {
  activeRoomId?: string | null;
  onClose: () => void;
  onOpenMedia?: () => void;
}

export function DetailsPanel({ activeRoomId, onClose, onOpenMedia }: DetailsPanelProps) {
  const { data: convResponse } = useConversations();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { isConnected } = useSocket();
  const onlineUsers = useRealtimeStore((state) => state.onlineUsers);

  const [subView, setSubView] = React.useState<"main" | "starred">("main");
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [editedDescription, setEditedDescription] = React.useState("");
  const [showAddMembers, setShowAddMembers] = React.useState(false);
  const [selectedAddUserIds, setSelectedAddUserIds] = React.useState<Set<string>>(new Set());

  const updateGroupMutation = useUpdateGroup();
  const addParticipantsMutation = useAddParticipants();
  const removeParticipantMutation = useRemoveParticipant();
  const promoteToAdminMutation = usePromoteToAdmin();

  React.useEffect(() => {
    setIsEditingName(false);
    setIsEditingDescription(false);
    setShowAddMembers(false);
    setSelectedAddUserIds(new Set());
  }, [activeRoomId]);

  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const queryClient = useQueryClient();

  const handleBlockToggle = () => {
    if (!room?.partnerId) return;
    if (room.isBlocked) {
      unblockMutation.mutate(room.partnerId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["messages", activeRoomId] });
        },
      });
    } else {
      blockMutation.mutate(room.partnerId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["messages", activeRoomId] });
        },
      });
    }
  };

  // Fetch messages in this room to extract assets
  const { data: messagesData } = useMessages(activeRoomId || null);

  const activeMessages = React.useMemo(() => {
    if (!messagesData || !currentUserId) return [];
    const allRawMessages = messagesData.pages.flatMap((page) => page.data.messages || []);
    return allRawMessages.map((msg: RawMessage) => formatMessage(msg, currentUserId)).reverse();
  }, [messagesData, currentUserId]);

  const starredMessages = React.useMemo(() => {
    return activeMessages.filter((msg) => msg.isStarred && !msg.isDeleted);
  }, [activeMessages]);

  const mediaAssetsCount = React.useMemo(() => {
    // Filter messages with attachments (image/video/doc/audio) or links
    return activeMessages.filter((msg) => {
      if (msg.isDeleted) return false;
      if (msg.attachment) return true;
      if (msg.content && /(https?:\/\/[^\s]+|www\.[^\s]+)/gi.test(msg.content)) return true;
      return false;
    }).length;
  }, [activeMessages]);

  const rawConversations = convResponse?.data?.conversations;

  // Find active room info to dynamically populate details
  const rawActiveConv = React.useMemo(() => {
    if (!activeRoomId || !rawConversations) return null;
    return rawConversations.find((c: { _id: string }) => c._id === activeRoomId);
  }, [rawConversations, activeRoomId]);

  const room = React.useMemo(() => {
    if (!rawActiveConv || !currentUserId) return null;
    return formatConversation(rawActiveConv as unknown as RawConversation, currentUserId);
  }, [rawActiveConv, currentUserId]);

  if (!room) {
    return (
      <div className="fixed inset-0 z-40 md:static md:z-auto md:w-80 md:h-full md:flex-shrink-0 flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 select-none items-center justify-center p-6 text-zinc-400">
        <span>No active conversation</span>
      </div>
    );
  }

  const name = room.name;
  const avatarUrl = room.avatar;
  const isOnline = isConnected
    ? room.type !== "group" && !!room.partnerId && onlineUsers.has(room.partnerId)
    : !!room.isOnline;

  const status = room.type === "group" ? "Group Chat" : isOnline ? "Online" : "Offline";
  const bio = room.type === "group"
    ? room.description || "No description set for this group."
    : room.about || "Hey there! I am using Let's Chat.";

  // Extract participants list for group chat display
  const participants = (rawActiveConv as any)?.participants || [];

  const isAdmin = React.useMemo(() => {
    if (room.type !== "group" || !currentUserId) return false;
    const member = participants.find(
      (p: any) => p.userId && (p.userId._id || p.userId).toString() === currentUserId && !p.isDeleted
    );
    return member?.role === "admin";
  }, [room, participants, currentUserId]);

  const { data: usersResponse } = useSearchUsers("");
  const allUsers = usersResponse?.data?.users || [];

  const nonMembers = React.useMemo(() => {
    const memberIds = new Set(
      participants.filter((p: any) => !p.isDeleted).map((p: any) => {
        if (typeof p.userId === "object" && p.userId !== null) return p.userId._id;
        return p.userId;
      })
    );
    return allUsers.filter((u: any) => u._id !== currentUserId && !memberIds.has(u._id));
  }, [allUsers, participants, currentUserId]);

  const handleSaveName = () => {
    if (!activeRoomId || !editedName.trim()) return;
    updateGroupMutation.mutate(
      { id: activeRoomId, data: { name: editedName.trim() } },
      {
        onSuccess: () => {
          setIsEditingName(false);
          toast.success("Group name updated");
        },
      }
    );
  };

  const handleSaveDescription = () => {
    if (!activeRoomId) return;
    updateGroupMutation.mutate(
      { id: activeRoomId, data: { description: editedDescription.trim() } },
      {
        onSuccess: () => {
          setIsEditingDescription(false);
          toast.success("Group description updated");
        },
      }
    );
  };

  const handleAddMembersSubmit = () => {
    if (!activeRoomId || selectedAddUserIds.size === 0) return;
    addParticipantsMutation.mutate(
      { id: activeRoomId, participantIds: Array.from(selectedAddUserIds) },
      {
        onSuccess: () => {
          setShowAddMembers(false);
          setSelectedAddUserIds(new Set());
        },
      }
    );
  };

  const handlePromoteMember = (userId: string) => {
    if (!activeRoomId) return;
    promoteToAdminMutation.mutate({ id: activeRoomId, userId });
  };

  const handleRemoveMember = (userId: string) => {
    if (!activeRoomId) return;
    if (confirm("Are you sure you want to remove this member from the group?")) {
      removeParticipantMutation.mutate({ id: activeRoomId, userId });
    }
  };

  const handleLeaveGroup = () => {
    if (!activeRoomId || !currentUserId) return;
    if (confirm("Are you sure you want to leave this group?")) {
      removeParticipantMutation.mutate(
        { id: activeRoomId, userId: currentUserId },
        {
          onSuccess: () => {
            toast.success("You left the group");
            useChatStore.getState().setActiveRoomId(null);
            onClose();
          },
        }
      );
    }
  };

  if (subView === "starred") {
    return (
      <div className="fixed inset-0 z-40 md:static md:z-auto md:w-80 md:h-full md:flex-shrink-0 flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-955 select-none animate-fadeIn">
        <div className="h-16 px-6 border-b border-zinc-300 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900 flex-shrink-0">
          <button
            onClick={() => setSubView("main")}
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
                <p className="text-xs text-slate-650 dark:text-zinc-350 line-clamp-3 leading-relaxed break-all">
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

  return (
    <div className="fixed inset-0 z-40 md:static md:z-auto md:w-80 md:h-full md:flex-shrink-0 flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 select-none">
      <DetailsHeader onClose={onClose} />

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
        {/* Custom Group Card or Profile Card */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {room.type === "group" ? (
              <div className="h-20 w-20 rounded-full bg-[#19E68C]/15 text-emerald-650 flex items-center justify-center font-bold text-2xl dark:bg-[#19E68C]/10 dark:text-[#19E68C] shadow-md border-2 border-zinc-100 dark:border-zinc-800">
                {name.charAt(0)}
              </div>
            ) : (
              <Avatar
                src={avatarUrl}
                name={name}
                className="!h-20 !w-20 shadow-md border-2 border-zinc-100 dark:border-zinc-800"
              />
            )}
            {room.type !== "group" && isOnline && (
              <span className="absolute bottom-0 right-1.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-950" />
            )}
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-2 mt-3 w-full animate-fadeIn">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-grow bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#19E68C] dark:text-zinc-200"
                maxLength={50}
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={updateGroupMutation.isPending || !editedName.trim()}
                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex-shrink-0"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setEditedName(name);
                }}
                className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 rounded-xl text-xs font-bold transition flex-shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mt-3 w-full">
              <h4 className="text-base font-bold text-slate-800 dark:text-white leading-none truncate max-w-[80%]">
                {name}
              </h4>
              {room.type === "group" && isAdmin && (
                <button
                  onClick={() => {
                    setIsEditingName(true);
                    setEditedName(name);
                  }}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-400 hover:text-emerald-500 transition"
                  title="Edit Group Name"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-green-505 dark:text-green-400 mt-2 leading-none">{status}</p>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-3 gap-2 border-b border-zinc-150 dark:border-zinc-900 pb-5 w-full mt-6">
            <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-zinc-400">
              <Search className="h-5 w-5 text-slate-650 dark:text-zinc-300" />
              <span className="text-[12px] text-zinc-400 mt-1.5 font-semibold">Search</span>
            </button>
            <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-zinc-400">
              <Bell className="h-5 w-5 text-slate-650 dark:text-zinc-300" />
              <span className="text-[12px] text-zinc-400 mt-1.5 font-semibold">Mute</span>
            </button>
            <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-zinc-400">
              <MoreHorizontal className="h-5 w-5 text-slate-655 dark:text-zinc-300" />
              <span className="text-[12px] text-zinc-400 mt-1.5 font-semibold">More</span>
            </button>
          </div>
        </div>

        {/* Custom Group Description or DetailsAbout */}
        {room.type === "group" && isAdmin ? (
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider">
                Description
              </span>
              {isEditingDescription ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDescription}
                    disabled={updateGroupMutation.isPending}
                    className="text-xs font-bold text-emerald-500 hover:underline"
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
              )}
            </div>
            {isEditingDescription ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                maxLength={200}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#19E68C] dark:text-zinc-250 resize-none h-16"
                autoFocus
              />
            ) : (
              <p className="text-xs sm:text-sm text-slate-655 dark:text-zinc-300 leading-relaxed font-semibold">
                {bio}
              </p>
            )}
          </div>
        ) : (
          <DetailsAbout bio={bio} />
        )}

        {/* Group members list, add members panel — hidden for removed participants */}
        {room.type === "group" && !room.isRemoved && (
          <div className="space-y-3 text-left">
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
              <div className="bg-zinc-50/50 dark:bg-zinc-900/40 p-3.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 space-y-3 animate-slideDown">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Add to Group</span>
                  <button
                    onClick={() => {
                      setShowAddMembers(false);
                      setSelectedAddUserIds(new Set());
                    }}
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
                        className={`w-full flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-805 rounded-xl text-left transition ${
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
                  onClick={handleAddMembersSubmit}
                  disabled={addParticipantsMutation.isPending || selectedAddUserIds.size === 0}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {addParticipantsMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Add Selected ({selectedAddUserIds.size})
                </button>
              </div>
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
            disabled={removeParticipantMutation.isPending}
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
