import React, { useState, useEffect, useRef } from "react";
import { Megaphone, MessageSquare, Info, X, ShieldAlert, Smile, Send } from "lucide-react";
import { Community, CommunityGroup, GroupMessage } from "@/types/communities";

interface CommunityChatWindowProps {
  activeCommunity: Community;
  activeGroup: CommunityGroup;
  onSelectGroup: (communityId: string, groupId: string | null) => void;
  onSendMessageToGroup: (communityId: string, groupId: string, text: string) => void;
  currentMessages: GroupMessage[];
}

export function CommunityChatWindow({
  activeCommunity,
  activeGroup,
  onSelectGroup,
  onSendMessageToGroup,
  currentMessages,
}: CommunityChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat feed to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeGroup, currentMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessageToGroup(activeCommunity.id, activeGroup.id, inputText);
    setInputText("");
  };

  return (
    <>
      {/* Subgroup Header */}
      <div className="h-16 md:h-20 px-4 md:px-6 border-b border-zinc-200/80 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 flex-shrink-0">
            {activeGroup.type === "announcement" ? <Megaphone className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
              {activeGroup.name}
            </h3>
            <p className="text-[10px] text-zinc-450 mt-0.5 truncate max-w-sm">
              Part of {activeCommunity.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => alert(`Details for subgroup: ${activeGroup.name}`)}
            className="p-2 hover:bg-zinc-150/60 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
            title="Channel Info"
          >
            <Info className="h-4.5 w-4.5" />
          </button>

          <button
            onClick={() => onSelectGroup(activeCommunity.id, null)}
            className="p-2 hover:bg-zinc-150/60 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
            title="Back to Org profile"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Subgroup Chat conversation Scroll Container */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-zinc-50 dark:bg-[#0c0c0e] flex flex-col"
      >
        {/* Megaphone description overlay */}
        {activeGroup.type === "announcement" && (
          <div className="w-full max-w-md mx-auto p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex gap-2.5 items-start leading-relaxed shadow-sm">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Official Announcement Group</p>
              <p className="text-[10px] mt-0.5 text-amber-600/90 dark:text-amber-400/80">
                Only administrators can submit announcements. General participant discussions are disabled.
              </p>
            </div>
          </div>
        )}

        {/* Messages Loops */}
        {currentMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-md md:max-w-lg rounded-2xl p-3 px-4 shadow-sm relative flex flex-col gap-1 ${
                msg.isMe
                  ? "bg-gradient-to-br from-[#00C9FF] to-[#19E68C] text-white"
                  : "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-zinc-150 dark:border-zinc-850"
              }`}
            >
              {!msg.isMe && (
                <span className="text-[10px] font-extrabold text-emerald-650 dark:text-[#19E68C]">
                  {msg.sender}
                </span>
              )}
              
              <p className="text-xs md:text-sm leading-relaxed break-words whitespace-pre-wrap select-text pr-4">
                {msg.text}
              </p>
              
              <span className={`text-[9px] font-medium mt-1 self-end ${
                msg.isMe ? "text-white/80" : "text-zinc-400"
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {currentMessages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400/85">
            <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-800 mb-2" />
            <p className="text-xs">No messages in this subgroup yet.</p>
            <p className="text-[10px] mt-0.5">Send a message to kick off discussions!</p>
          </div>
        )}
      </div>

      {/* Subgroup Chat Input Box */}
      <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 z-10">
        {activeGroup.type === "announcement" ? (
          <div className="w-full text-center py-2.5 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl text-xs font-semibold text-zinc-400/80 border border-dashed border-zinc-200/50 dark:border-zinc-800/50">
            Only administrators can broadcast messages to announcements.
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl px-4 py-2.5 focus-within:border-emerald-500/30 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all">
              <Smile className="h-4.5 w-4.5 text-zinc-400 hover:text-emerald-500 transition cursor-pointer mr-2.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Type message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-slate-800 dark:text-zinc-200 placeholder-zinc-450"
              />
            </div>
            
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-[#19E68C] text-[#09090B] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shadow-md transition-all duration-200 active:scale-95 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export default CommunityChatWindow;
