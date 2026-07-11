"use client";

import React from "react";
import { useConversations, useDeleteConversation, useClearConversation, useDeleteMessage } from "@/hooks/api/use-conversations";
import { useAuthStore } from "@/store/auth-store";
import { formatConversation, RawConversation } from "@/utils/chat-helpers";
import { useRealtimeStore } from "@/store/realtime-store";
import { useChatWindow } from "@/hooks/use-chat-window";
import { EmptyChatState } from "./EmptyChatState";
import { ChatHeader } from "./ChatHeader";
import { MessageFeed } from "./MessageFeed";
import { MessageInput } from "./MessageInput";
import { useSocket } from "@/providers/socket-provider";
import { useChatStore } from "@/store/chat-store";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ChatWindowProps {
  activeRoomId: string | null;
  onToggleDetails: () => void;
  isDetailsOpen: boolean;
  onStartAudioCall?: (name: string, avatarUrl?: string) => void;
  onStartVideoCall?: (name: string, avatarUrl?: string) => void;
  onBack?: () => void;
}

const EMPTY_ARRAY: string[] = [];

export function ChatWindow({
  activeRoomId,
  onToggleDetails,
  isDetailsOpen,
  onStartAudioCall,
  onStartVideoCall,
  onBack,
}: ChatWindowProps) {
  const {
    inputText,
    setInputText,
    sendMessage,
    sendVoiceNote,
    sendAttachment,
    sendFiles,
    activeMessages,
    messagesEndRef,
  } = useChatWindow(activeRoomId);

  const [isSearchingMessages, setIsSearchingMessages] = React.useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = React.useState("");
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setIsSearchingMessages(false);
    setMessageSearchQuery("");
    setIsSelectionMode(false);
    setSelectedMessageIds(new Set());
  }, [activeRoomId]);

  const filteredMessages = React.useMemo(() => {
    if (!messageSearchQuery.trim()) return activeMessages;
    return activeMessages.filter((msg) =>
      msg.content?.toLowerCase().includes(messageSearchQuery.toLowerCase())
    );
  }, [activeMessages, messageSearchQuery]);

  const handleToggleSelectMessage = React.useCallback((messageId: string) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  }, []);

  const clearChatMutation = useClearConversation();
  const deleteChatMutation = useDeleteConversation();
  const deleteMessageMutation = useDeleteMessage();
  const setActiveRoomId = useChatStore((state) => state.setActiveRoomId);

  const handleClearChat = () => {
    if (!activeRoomId) return;
    if (confirm("Are you sure you want to clear all messages in this chat? This cannot be undone.")) {
      clearChatMutation.mutate(activeRoomId);
    }
  };

  const handleDeleteChat = () => {
    if (!activeRoomId) return;
    if (confirm("Are you sure you want to delete this conversation? This will wipe all messages and remove it from your chat list.")) {
      deleteChatMutation.mutate(activeRoomId, {
        onSuccess: () => {
          setActiveRoomId(null);
        }
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMessageIds.size === 0) return;
    if (confirm(`Are you sure you want to delete the ${selectedMessageIds.size} selected messages?`)) {
      try {
        const ids = Array.from(selectedMessageIds);
        for (const msgId of ids) {
          await deleteMessageMutation.mutateAsync({ conversationId: activeRoomId!, messageId: msgId });
        }
        setIsSelectionMode(false);
        setSelectedMessageIds(new Set());
        toast.success("Selected messages deleted");
      } catch (error) {
        toast.error("Failed to delete some messages");
      }
    }
  };

  const { data: convResponse } = useConversations();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const rawConversations = convResponse?.data?.conversations;

  const rawActiveConv = React.useMemo(() => {
    if (!activeRoomId || !rawConversations) return null;
    return rawConversations.find((c: { _id: string }) => c._id === activeRoomId);
  }, [rawConversations, activeRoomId]);

  const room = React.useMemo(() => {
    if (!rawActiveConv || !currentUserId) return null;
    return formatConversation(rawActiveConv as unknown as RawConversation, currentUserId);
  }, [rawActiveConv, currentUserId]);

  const activeMembersCount = React.useMemo(() => {
    if (!rawActiveConv || rawActiveConv.type !== "group") return 0;
    const participants = (rawActiveConv as any).participants || [];
    return participants.filter((p: any) => !p.isDeleted).length;
  }, [rawActiveConv]);

  const typingUsers = useRealtimeStore((state) => {
    if (!activeRoomId) return EMPTY_ARRAY;
    return state.typingUsers[activeRoomId] || EMPTY_ARRAY;
  });
  const isSomeoneTyping = typingUsers.length > 0;
  const typingSenderName = typingUsers.join(", ");

  const { isConnected } = useSocket();
  const onlineUsers = useRealtimeStore((state) => state.onlineUsers);

  // 1. EMPTY STATE RENDER
  if (!activeRoomId) {
    return <EmptyChatState />;
  }

  const roomName = room ? room.name : "Chat Room";
  const avatarUrl = room?.avatar;
  const isGroup = room?.type === "group";
  const isOnline = isConnected
    ? room?.type !== "group" && !!room?.partnerId && onlineUsers.has(room.partnerId)
    : !!room?.isOnline;

  // 2. ACTIVE CHAT STATE RENDER
  return (
    <div
      className="flex-1 h-full flex flex-col bg-zinc-50/90 dark:bg-[#09090B]/95 bg-blend-multiply select-text relative"
      style={{ backgroundImage: "url('/assets/images/wallpaper.png')", backgroundSize: "360px", backgroundRepeat: "repeat" }}
    >
      <ChatHeader
        roomName={roomName}
        avatarUrl={avatarUrl}
        isGroup={isGroup}
        isOnline={isOnline}
        memberCount={activeMembersCount}
        isRemoved={!!room?.isRemoved}
        isDetailsOpen={isDetailsOpen}
        onToggleDetails={onToggleDetails}
        onStartAudioCall={onStartAudioCall ? () => onStartAudioCall(roomName, avatarUrl) : undefined}
        onStartVideoCall={onStartVideoCall ? () => onStartVideoCall(roomName, avatarUrl) : undefined}
        onBack={onBack}
        isSearchingMessages={isSearchingMessages}
        setIsSearchingMessages={setIsSearchingMessages}
        messageSearchQuery={messageSearchQuery}
        setMessageSearchQuery={setMessageSearchQuery}
        onToggleSelectionMode={() => setIsSelectionMode((p) => !p)}
        onClearChat={handleClearChat}
        onDeleteChat={handleDeleteChat}
      />

      <MessageFeed
        messages={filteredMessages}
        activeRoomId={activeRoomId}
        messagesEndRef={messagesEndRef}
        isTyping={isSomeoneTyping}
        typingSenderName={typingSenderName}
        searchQuery={messageSearchQuery}
        isSelectionMode={isSelectionMode}
        selectedMessageIds={selectedMessageIds}
        onToggleSelectMessage={handleToggleSelectMessage}
      />

      {isSelectionMode ? (
        <div className="p-4 bg-[#FAFAFC] dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between animate-fadeIn z-10">
          <div className="flex items-center gap-3 pl-2">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              {selectedMessageIds.size} messages selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMessageIds(new Set());
              }}
              className="px-4 py-2 text-xs font-bold text-slate-650 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedMessageIds.size === 0}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Delete Selected
            </button>
          </div>
        </div>
      ) : room?.isRemoved ? (
        <div className="p-4.5 md:p-6 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200/60 dark:border-zinc-800/50 flex items-center justify-center select-none text-center z-10 animate-fadeIn">
          <p className="text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 max-w-[85%] leading-relaxed">
            🚫 You can't send messages to this group because you're no longer a participant.
          </p>
        </div>
      ) : (
        <MessageInput
          inputText={inputText}
          onChangeInput={setInputText}
          onSendMessage={sendMessage}
          onSendVoiceNote={sendVoiceNote}
          onSendAttachment={sendAttachment}
          onSendFiles={sendFiles}
          isBlocked={room?.isBlocked}
          hasBlockedMe={room?.hasBlockedMe}
        />
      )}
    </div>
  );
}
export default ChatWindow;
