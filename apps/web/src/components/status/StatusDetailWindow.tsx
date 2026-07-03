import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, ChevronLeft, ChevronRight, Send, CircleDashed, Smile } from "lucide-react";
import { UserStatus } from "@/types/status";
import { toast } from "sonner";
import { StatusProgressBars } from "./StatusProgressBars";

interface StatusDetailWindowProps {
  activeUserStatus: UserStatus | null;
  onClearSelection: () => void;
  onNextUserStatus: () => void;
  onPrevUserStatus: () => void;
  onMarkRead: (userId: string) => void;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number; // offset x percentage
  delay: number;
}

const EMOJI_REACTIONS = ["❤️", "😂", "😮", "😢", "🙏", "🔥"];

export function StatusDetailWindow({
  activeUserStatus,
  onClearSelection,
  onNextUserStatus,
  onPrevUserStatus,
  onMarkRead,
}: StatusDetailWindowProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  // Floating emojis state
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const emojiIdCounter = useRef(0);

  // Reset index when active status changes
  useEffect(() => {
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
    
    // Mark as read when opened
    if (activeUserStatus) {
      onMarkRead(activeUserStatus.userId);
    }
  }, [activeUserStatus]);

  // Story Autoplay Logic
  useEffect(() => {
    if (!activeUserStatus || isPaused) return;

    const duration = 5000; // 5 seconds per story
    const step = 50; // interval step in ms
    const increment = (step / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, step);

    return () => clearInterval(timer);
  }, [activeUserStatus, isPaused, currentStoryIndex]);

  if (!activeUserStatus) {
    /* 1. EMPTY STATE VIEW (No status selected) */
    return (
      <div className="flex-1 h-full bg-zinc-50 dark:bg-[#0c0c0e] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative flex items-center justify-center h-24 w-24">
          {/* Animated Glow Rings */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#19E68C] animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-dashed border-[#00C9FF] animate-[spin_8s_linear_infinite_reverse]" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00C9FF]/5 to-[#19E68C]/5 filter blur-md animate-pulse" />
          
          <CircleDashed className="h-10 w-10 text-emerald-500/80 dark:text-[#19E68C]/80" />
        </div>
        
        <h3 className="mt-8 text-xl font-bold text-slate-800 dark:text-zinc-200">
          Status Updates
        </h3>
        
        <p className="mt-2 text-sm text-zinc-450 max-w-sm">
          Click on a contact's status in the list to view their story updates. Stories disappear after 24 hours.
        </p>
      </div>
    );
  }

  const stories = activeUserStatus.stories;
  const currentStory = stories[currentStoryIndex];

  if (!currentStory) return null;

  // Navigation Handlers
  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else {
      onPrevUserStatus();
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      onNextUserStatus();
    }
  };

  // Reply submit handler
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    toast.success(`Reply sent to ${activeUserStatus.userName}!`);
    setReplyText("");
    setIsPaused(false);
  };

  // Emoji Reactions Trigger
  const triggerEmojiReaction = (emoji: string) => {
    // Spawn floating emoji
    const id = emojiIdCounter.current++;
    const x = 30 + Math.random() * 40; // Random x coordinate between 30% and 70% width
    const delay = Math.random() * 0.2;
    
    setFloatingEmojis((prev) => [...prev, { id, emoji, x, delay }]);
    
    // Remove after animation ends (1.8s)
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
  };

  return (
    <div className="flex-1 h-full bg-[#09090B] dark:bg-black flex flex-col relative select-none overflow-hidden items-center justify-between">
      
      {/* 2. Floating Emojis Layer */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {floatingEmojis.map((item) => (
            <motion.div
              key={item.id}
              initial={{ y: "100%", x: `${item.x}vw`, scale: 0.8, opacity: 1 }}
              animate={{ 
                y: "-10%", 
                x: `${item.x + (Math.sin(item.id) * 10)}vw`, // sway wave
                scale: 1.5, 
                opacity: [1, 0.9, 0.4, 0] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut", delay: item.delay }}
              className="absolute bottom-16 text-4xl select-none"
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 3. Top Section: Segmented Progress Bars & Metadata */}
      <div className="w-full max-w-xl px-4 pt-4 pb-2 z-20 bg-gradient-to-b from-black/80 to-transparent flex flex-col gap-3">
        {/* Progress Bar Segments */}
        <StatusProgressBars
          stories={stories}
          currentStoryIndex={currentStoryIndex}
          progress={progress}
        />

        {/* User Info Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={activeUserStatus.userAvatar}
              className="h-10 w-10 rounded-full border border-white/20 object-cover"
              alt={activeUserStatus.userName}
            />
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {activeUserStatus.userName}
              </h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {currentStory.timestamp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Play / Pause Controls */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
              title={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play className="h-4.5 w-4.5 fill-white" /> : <Pause className="h-4.5 w-4.5 fill-white" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClearSelection}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
              title="Close viewer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Center Section: Immersive Story Content Area */}
      <div 
        className="flex-1 w-full flex items-center justify-center p-6 relative"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Tapping screen sectors for navigation */}
        <div 
          onClick={handlePrev} 
          className="absolute left-0 top-0 bottom-0 w-[20%] cursor-pointer z-10" 
          title="Previous"
        />
        <div 
          onClick={handleNext} 
          className="absolute right-0 top-0 bottom-0 w-[80%] cursor-pointer z-10" 
          title="Next"
        />

        {/* Side Hover Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-6 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition hidden md:flex z-20 group"
        >
          <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-6 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition hidden md:flex z-20 group"
        >
          <ChevronRight className="h-6 w-6 group-hover:scale-110 transition" />
        </button>

        {/* Dynamic Story Views */}
        <AnimatePresence mode="wait">
          {currentStory.type === "text" ? (
            /* Text Story */
            <motion.div
              key={currentStory.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-lg aspect-[4/3] rounded-3xl bg-gradient-to-tr ${
                currentStory.backgroundColor || "from-zinc-800 to-zinc-950"
              } flex items-center justify-center p-8 shadow-2xl relative text-center`}
            >
              <h2 className={`text-white text-xl md:text-3xl font-extrabold select-text break-words leading-relaxed max-w-full px-4 ${
                currentStory.fontFamily || "font-sans"
              }`}>
                {currentStory.content}
              </h2>
            </motion.div>
          ) : (
            /* Image Story */
            <motion.div
              key={currentStory.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-h-[70vh] max-w-xl aspect-[3/4] md:aspect-[9/16] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black flex flex-col justify-center"
            >
              <img
                src={currentStory.content}
                alt="Story"
                className="w-full h-full object-contain pointer-events-none"
              />
              
              {currentStory.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/75 to-transparent px-6 py-6 text-white text-center text-sm font-semibold leading-relaxed border-t border-white/5">
                  {currentStory.caption}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Bottom Section: Emoji Quick Reactions & Reply Bar */}
      <div className="w-full max-w-xl px-6 pb-6 pt-2 z-20 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4">
        
        {/* Emoji Quick Picker */}
        <div className="flex justify-between items-center bg-white/5 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider pl-1 select-none">
            Quick Reply
          </span>
          <div className="flex gap-2">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  triggerEmojiReaction(emoji);
                  toast.success(`Reaction ${emoji} sent!`);
                }}
                className="text-xl hover:scale-125 transition-all duration-200 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Form */}
        <form onSubmit={handleSendReply} className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus-within:border-white/20 focus-within:bg-white/10 transition-all">
            <Smile className="h-4.5 w-4.5 text-zinc-400 mr-2.5 flex-shrink-0 cursor-pointer hover:text-white" />
            <input
              type="text"
              placeholder={`Reply to ${activeUserStatus.userName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm placeholder-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="h-11 w-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-[#19E68C] text-[#09090B] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shadow-lg active:scale-95 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}

export default StatusDetailWindow;
