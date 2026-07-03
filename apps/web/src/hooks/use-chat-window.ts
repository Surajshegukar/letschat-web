import { useState, useEffect, useRef } from "react";
import { Message } from "@/types/chat";

export function useChatWindow(
  activeRoomId: string | null,
  initialMessages: Record<string, Message[]>
) {
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages feed when messages change or room changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoomId]);

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeRoomId) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      senderName: "John Doe",
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "read",
    };

    setMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMsg],
    }));

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
        setMessages((prev) => ({
          ...prev,
          [activeRoomId]: [...(prev[activeRoomId] || []), responseMsg],
        }));
      }, 1500);
    }
  };

  const sendVoiceNote = (duration: string) => {
    if (!activeRoomId) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      senderName: "John Doe",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "read",
      attachment: {
        name: "Voice note",
        size: duration,
        type: "audio",
      },
    };

    setMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMsg],
    }));
  };

  const sendAttachment = (type: "image" | "document") => {
    if (!activeRoomId) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      senderName: "John Doe",
      content: type === "image" ? "Check out this beautiful setup!" : "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "read",
      attachment: {
        name: type === "image" ? "workspace_mockup.jpg" : "letschat_documentation.pdf",
        size: type === "image" ? "142 KB" : "1.2 MB",
        url: type === "image" ? "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600" : undefined,
        type,
      },
    };

    setMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMsg],
    }));
  };

  const activeMessages = activeRoomId ? messages[activeRoomId] || [] : [];

  return {
    messages,
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
