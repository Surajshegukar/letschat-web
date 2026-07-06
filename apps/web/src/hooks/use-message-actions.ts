import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useReactToMessage, useDeleteMessage } from "@/hooks/api/use-conversations";
import { Message } from "@/types/chat";
import { toast } from "sonner";

const EDIT_DELETE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function isWithinEditWindow(createdAt?: string): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < EDIT_DELETE_WINDOW_MS;
}

export function useMessageActions(message: Message) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const setReplyingToMessage = useChatStore((state) => state.setReplyingToMessage);
  const setEditingMessage = useChatStore((state) => state.setEditingMessage);
  const reactMutation = useReactToMessage();
  const deleteMutation = useDeleteMessage();

  const canEditOrDelete = message.senderId === "me" && !message.isDeleted && isWithinEditWindow(message.createdAt);

  const handleReply = () => setReplyingToMessage(message);

  const handleEdit = () => {
    if (!canEditOrDelete) {
      toast.error("Messages can only be edited within 15 minutes of sending.");
      return;
    }
    setEditingMessage(message);
  };

  const handleDelete = () => {
    if (!canEditOrDelete) {
      toast.error("Messages can only be deleted within 15 minutes of sending.");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!activeRoomId) return;
    deleteMutation.mutate(
      { conversationId: activeRoomId, messageId: message.id },
      { onSettled: () => setShowDeleteConfirm(false) }
    );
  };

  const handleReact = (emoji: string) => {
    if (activeRoomId) {
      reactMutation.mutate({ conversationId: activeRoomId, messageId: message.id, emoji });
      setShowReactionPicker(false);
    }
  };

  const handleScrollToReply = () => {
    if (!message.replyTo) return;
    const element = document.getElementById(`msg-card-${message.replyTo.id}`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    const classes = ["ring-4", "ring-emerald-500/40", "dark:ring-[#19E68C]/30", "scale-[1.03]", "shadow-lg", "shadow-emerald-500/5", "z-20"];
    element.classList.add(...classes);
    setTimeout(() => element.classList.remove(...classes), 1500);
  };

  return {
    showReactionPicker,
    setShowReactionPicker,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting: deleteMutation.isPending,
    canEditOrDelete,
    handleReply,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleReact,
    handleScrollToReply,
  };
}
