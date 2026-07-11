import React from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useRealtimeStore } from "@/store/realtime-store";
import { useSocket } from "@/providers/socket-provider";
import { useSearchUsers, useBlockUser, useUnblockUser } from "@/hooks/api/use-user";
import { formatConversation, RawConversation, formatMessage, RawMessage } from "@/utils/chat-helpers";
import { toast } from "sonner";

export function useDetailsPanel(activeRoomId: string | null | undefined, onClose: () => void) {
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
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    setIsEditingName(false);
    setIsEditingDescription(false);
    setShowAddMembers(false);
    setSelectedAddUserIds(new Set());
  }, [activeRoomId]);

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

  const name = room?.name || "";
  const avatarUrl = room?.avatar;
  const isOnline = isConnected
    ? room?.type !== "group" && !!room?.partnerId && onlineUsers.has(room.partnerId)
    : !!room?.isOnline;

  const status = room?.type === "group" ? "Group Chat" : isOnline ? "Online" : "Offline";
  const bio = room?.type === "group"
    ? room?.description || "No description set for this group."
    : room?.about || "Hey there! I am using Let's Chat.";

  // Extract participants list for group chat display
  const participants = (rawActiveConv as any)?.participants || [];

  const isAdmin = React.useMemo(() => {
    if (room?.type !== "group" || !currentUserId) return false;
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

  return {
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
    isAddPending: addParticipantsMutation.isPending,
    isRemovePending: removeParticipantMutation.isPending,
  };
}
