import { useState, useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { useChatStore } from "@/store/chat-store";

export function useChatWindow(
  activeRoomId: string | null,
  _initialMessages?: Record<string, Message[]>
) {
  const storeMessages = useChatStore((state) => state.messages);
  const sendMessageInStore = useChatStore((state) => state.sendMessage);
  const sendVoiceNoteInStore = useChatStore((state) => state.sendVoiceNote);
  const sendAttachmentInStore = useChatStore((state) => state.sendAttachment);
  const receiveMessageInStore = useChatStore((state) => state.receiveMessage);

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages feed when messages change or room changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [storeMessages, activeRoomId]);

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeRoomId) return;

    sendMessageInStore(activeRoomId, inputText);
    setInputText("");

    // Simulate typing answer after 1.5 seconds if talking to Olivia Rhye
    if (activeRoomId === "olivia") {
      setTimeout(() => {
        const responseMsg: Message = {
          id: `msg-resp-${Date.now()}`,
          senderId: activeRoomId,
          senderName: "Olivia Rhye",
          content: `Thanks for typing! This is a static theme demonstration. 👍`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        receiveMessageInStore(activeRoomId, responseMsg);
      }, 1500);
    }
  };

  const sendVoiceNote = (duration: string) => {
    if (!activeRoomId) return;
    sendVoiceNoteInStore(activeRoomId, duration);
  };

  const sendAttachment = (type: "image" | "document") => {
    if (!activeRoomId) return;
    sendAttachmentInStore(activeRoomId, type);
  };

  const activeMessages = activeRoomId ? storeMessages[activeRoomId] || [] : [];

  return {
    messages: storeMessages,
    inputText,
    setInputText,
    sendMessage,
    sendVoiceNote,
    sendAttachment,
    activeMessages,
    messagesEndRef,
  };
}

export type UseChatWindowReturn = ReturnType<typeof useChatWindow>;
