"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Phone, 
  Video, 
  Info, 
  Paperclip, 
  Smile, 
  Send, 
  CheckCheck,
  Download,
  FileText,
  Sparkles
} from "lucide-react";
import { Message } from "@/types/chat";

interface ChatWindowProps {
  activeRoomId: string | null;
  onToggleDetails: () => void;
  isDetailsOpen: boolean;
}

const initialOliviaMessages: Message[] = [
  {
    id: "m1",
    senderId: "olivia",
    senderName: "Olivia Rhye",
    content: "Hey! How are you today? 👋",
    timestamp: "11:28 AM",
    status: "read",
  },
  {
    id: "m2",
    senderId: "me",
    senderName: "John Doe",
    content: "I'm good! Just working on the new dashboard design.",
    timestamp: "11:28 AM",
    status: "read",
  },
  {
    id: "m3",
    senderId: "olivia",
    senderName: "Olivia Rhye",
    content: "That's great! Can't wait to see it.",
    timestamp: "11:29 AM",
    status: "read",
  },
  {
    id: "m4",
    senderId: "me",
    senderName: "John Doe",
    content: "Here's a quick preview 👇",
    timestamp: "11:29 AM",
    status: "read",
  },
  {
    id: "m5",
    senderId: "me",
    senderName: "John Doe",
    content: "",
    timestamp: "11:29 AM",
    status: "read",
    attachment: {
      name: "dashboard-preview.png",
      size: "2.4 MB",
    },
  },
  {
    id: "m6",
    senderId: "olivia",
    senderName: "Olivia Rhye",
    content: "Wow! Looks amazing 😍",
    timestamp: "11:30 AM",
    status: "read",
  },
  {
    id: "m7",
    senderId: "me",
    senderName: "John Doe",
    content: "Thanks! Let me know your thoughts.",
    timestamp: "11:30 AM",
    status: "read",
  },
];

export function ChatWindow({ activeRoomId, onToggleDetails, isDetailsOpen }: ChatWindowProps) {
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    olivia: initialOliviaMessages,
  });
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages feed
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoomId]);

  const handleSendMessage = (e?: React.FormEvent) => {
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

    // Simulate typing answer after 2 seconds
    setTimeout(() => {
      const responseMsg: Message = {
        id: `msg-resp-${Date.now()}`,
        senderId: activeRoomId,
        senderName: activeRoomId === "olivia" ? "Olivia Rhye" : "System Notification",
        content: `Thanks for typing! This is a static theme demonstration. 👍`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => ({
        ...prev,
        [activeRoomId]: [...(prev[activeRoomId] || []), responseMsg],
      }));
    }, 1500);
  };

  const activeMessages = activeRoomId ? messages[activeRoomId] || [] : [];

  // 1. EMPTY STATE RENDER
  if (!activeRoomId) {
    return (
      <div className="flex-1 h-full flex flex-col bg-[#FAFAFC] dark:bg-[#09090B] select-none">
        {/* Empty State Header */}
        <div className="h-20 px-8 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white leading-none">Select a chat</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 leading-none">Choose a conversation from the list to start messaging</p>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"><Search className="h-5 w-5" /></button>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"><Phone className="h-5 w-5" /></button>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"><Video className="h-5 w-5" /></button>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"><Info className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Empty State Body */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="relative w-80 h-64 flex items-center justify-center">
            
            {/* Ambient Illustration background shapes */}
            <div className="absolute w-52 h-52 rounded-full bg-[#19E68C]/5 blur-3xl" />
            
            {/* SVG 3D-styled speech bubbles & paper plane */}
            <svg viewBox="0 0 200 200" className="w-56 h-56 drop-shadow-xl z-10">
              <defs>
                <linearGradient id="bubble3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#19E68C" />
                </linearGradient>
                <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#19E68C" />
                </linearGradient>
              </defs>
              {/* Back Bubble */}
              <path d="M60 85 C60 65, 95 65, 95 85 C95 105, 60 105, 60 85 Z" fill="#E4E4E7" className="dark:fill-zinc-800 opacity-60" />
              {/* Main 3D Bubble */}
              <circle cx="100" cy="100" r="32" fill="url(#bubble3DGrad)" />
              <path d="M85 125 L92 118 L104 126 Z" fill="#10B981" />
              <circle cx="88" cy="100" r="2.5" fill="#FFFFFF" />
              <circle cx="100" cy="100" r="2.5" fill="#FFFFFF" />
              <circle cx="112" cy="100" r="2.5" fill="#FFFFFF" />
              {/* Paper Plane */}
              <path d="M140 60 L180 40 L165 75 L155 68 Z" fill="url(#planeGrad)" />
              <path d="M140 60 L155 68 L180 40 Z" fill="#047857" opacity="0.3" />
              <path d="M145 68 Q130 85, 140 105 T170 120" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

          </div>

          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-4">
            Your conversations, all in one place
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">
            Select a chat from the left to view messages or start a new conversation.
          </p>

           
        </div>
      </div>
    );
  }

  // 2. ACTIVE CHAT STATE RENDER
  return (
    <div className="flex-1 h-full flex flex-col bg-[#FAFAFC] dark:bg-[#09090B] select-text">
      
      {/* Active Chat Header */}
      <div className="h-20 px-8 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
              className="h-10 w-10 rounded-full object-cover" 
              alt="Avatar" 
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-white dark:border-zinc-950" />
          </div>
          <div className="text-left">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white leading-none">Olivia Rhye</h3>
            <p className="text-[10px] text-zinc-400 mt-1.5 leading-none">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
          <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"><Search className="h-5 w-5" /></button>
          <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"><Phone className="h-5 w-5" /></button>
          <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"><Video className="h-5 w-5" /></button>
          <button 
            onClick={onToggleDetails}
            className={`p-2 rounded-xl transition ${
              isDetailsOpen 
                ? "bg-[#19E68C]/15 text-emerald-600 dark:bg-zinc-900 dark:text-[#19E68C]" 
                : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        
        {/* Today Centered Divider */}
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 rounded-full bg-zinc-200/50 dark:bg-zinc-800 text-[10px] sm:text-xs text-zinc-500 font-semibold tracking-wider uppercase">
            Today
          </span>
        </div>

        {activeMessages.map((msg) => {
          const isMe = msg.senderId === "me";

          // Image Attachment Card
          if (msg.attachment) {
            return (
              <div key={msg.id} className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-zinc-400">{msg.timestamp}</span>
                </div>
                <div className="w-[320px] rounded-2xl border border-zinc-200/80 bg-white shadow-md p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    <img 
                      src="https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=400" 
                      className="w-full h-full object-cover opacity-90" 
                      alt="Attachment Preview" 
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 px-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-8 w-8 text-[#19E68C] flex-shrink-0" />
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-250 truncate">{msg.attachment.name}</p>
                        <p className="text-[10px] text-zinc-400 leading-none mt-1">{msg.attachment.size}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl transition text-zinc-500">
                      <Download className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              
              {/* Message Meta Info */}
              <div className="flex items-center gap-2 mb-1">
                {!isMe && <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-455">{msg.senderName}</span>}
                <span className="text-[10px] text-zinc-400">{msg.timestamp}</span>
              </div>

              {/* Message Bubble Card */}
              <div 
                className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm ${
                  isMe 
                    ? "bg-[#EAFDF5] text-emerald-950 rounded-tr-none dark:bg-zinc-800 dark:text-zinc-100" 
                    : "bg-white text-slate-800 rounded-tl-none border border-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-250 dark:border-zinc-800"
                }`}
              >
                {msg.content}
              </div>

              {/* Read Receipt */}
              {isMe && (
                <div className="mt-1 flex justify-end">
                  <CheckCheck className="h-3.5 w-3.5 text-[#19E68C]" />
                </div>
              )}

            </div>
          );
        })}

        {/* Typing Indicator */}
        {activeRoomId === "olivia" && (
          <div className="flex flex-col items-start mt-2">
            <div className="flex items-center gap-1 bg-white border border-zinc-200/60 dark:bg-zinc-900 dark:border-zinc-800/80 px-4 py-2.5 rounded-full shadow-sm text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <span className="flex gap-1 items-center mr-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#19E68C] animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#19E68C] animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#19E68C] animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
              <span>Olivia is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Footer */}
      <div className="p-4 sm:p-6 border-t border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <button type="button" className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-400">
            <Paperclip className="h-5 w-5" />
          </button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-12 bg-[#FAFAFC] border border-zinc-250 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-150 outline-none rounded-xl px-4 text-xs sm:text-sm focus:border-[#19E68C]"
          />

          <button type="button" className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-400">
            <Smile className="h-5 w-5" />
          </button>

          <button 
            type="submit"
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#10B981] to-[#19E68C] text-zinc-950 shadow-md shadow-[#19E68C]/15 active:scale-[0.98] transition font-bold"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
