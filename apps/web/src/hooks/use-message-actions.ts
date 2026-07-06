import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useReactToMessage } from "@/hooks/api/use-conversations";
import { Message } from "@/types/chat";

export function useMessageActions(message: Message) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const setReplyingToMessage = useChatStore((state) => state.setReplyingToMessage);
  const reactMutation = useReactToMessage();

  const handleReply = () => setReplyingToMessage(message);

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
    handleReply,
    handleReact,
    handleScrollToReply,
  };
}
