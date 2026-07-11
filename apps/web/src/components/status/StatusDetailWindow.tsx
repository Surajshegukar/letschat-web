import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, ChevronLeft, ChevronRight, Send, CircleDashed, Smile } from "lucide-react";
import { UserStatus, StatusStoryReaction } from "@/types/status";
import { toast } from "sonner";
import { StatusProgressBars } from "./StatusProgressBars";
import { useAuthStore } from "@/store/auth-store";

interface StatusDetailWindowProps {
  activeUserStatus: UserStatus | null;
  onClearSelection: () => void;
  onNextUserStatus: () => void;
  onPrevUserStatus: () => void;
  onMarkRead: (userId: string) => void;
  onReactStory: (storyId: string, emoji: string) => void;
  onReplyToStory: (storyId: string, message: string) => void;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number; // offset x percentage
  delay: number;
}

const EMOJI_REACTIONS = ["❤️", "😂", "😮", "😢", "🙏", "🔥"];

function formatViewerTimestamp(dateStr: string, action = "Viewed"): string {
  try {
    const date = new Date(dateStr);
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${action} at ${timeStr}`;
  } catch {
    return "";
  }
}

export function StatusDetailWindow({
  activeUserStatus,
  onClearSelection,
  onNextUserStatus,
  onPrevUserStatus,
  onMarkRead,
  onReactStory,
  onReplyToStory,
}: StatusDetailWindowProps) {
  const currentUser = useAuthStore((state) => state.user);
  
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  // Views and Reactions Sheet State
  const [isViewsListOpen, setIsViewsListOpen] = useState(false);
  const [viewerTab, setViewerTab] = useState<"views" | "reactions">("views");

  // Floating emojis state
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const emojiIdCounter = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stories = activeUserStatus?.stories || [];
  const currentStory = stories[currentStoryIndex];

  // Navigation Handlers
  const handlePrev = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else {
      setProgress(0);
      onPrevUserStatus();
    }
  }, [currentStoryIndex, onPrevUserStatus]);

  const handleNext = useCallback(() => {
    if (!activeUserStatus) return;
    const stories = activeUserStatus.stories;
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      setProgress(0);
      onNextUserStatus();
    }
  }, [currentStoryIndex, activeUserStatus, onNextUserStatus]);

  // Reset index when active status changes
  useEffect(() => {
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
    setIsViewsListOpen(false);
    
    // Mark as read when opened
    if (activeUserStatus) {
      onMarkRead(activeUserStatus.userId);
    }
  }, [activeUserStatus]);

  // Handle auto-advancing when progress reaches 100
  useEffect(() => {
    if (progress >= 100 && activeUserStatus) {
      handleNext();
    }
  }, [progress, activeUserStatus, handleNext]);

  // Story Autoplay Logic for Text/Image (Paused for Video)
  useEffect(() => {
    if (!activeUserStatus || isPaused || currentStory?.type === "video") return;

    const duration = 5000; // 5 seconds per story
    const step = 50; // interval step in ms
    const increment = (step / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + increment;
      });
    }, step);

    return () => clearInterval(timer);
  }, [activeUserStatus, isPaused, currentStoryIndex, currentStory?.type]);

  // Manage Video Play/Pause state
  useEffect(() => {
    if (currentStory?.type === "video" && videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused, currentStoryIndex, currentStory?.type]);

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

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

  if (!currentStory) return null;

  const isSelf = activeUserStatus.userId === "me" || activeUserStatus.userId === currentUser?.id;

  // Reply submit handler
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onReplyToStory(currentStory.id, replyText.trim());
    setReplyText("");
    setIsPaused(false);
  };

  // Emoji Reactions Trigger
  const triggerEmojiReaction = (emoji: string) => {
    // Send API reaction
    onReactStory(currentStory.id, emoji);

    // Spawn floating emoji animation
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
            {activeUserStatus.userAvatar ? (
              <img
                src={activeUserStatus.userAvatar}
                className="h-10 w-10 rounded-full border border-white/20 object-cover"
                alt={activeUserStatus.userName}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-zinc-700 text-white font-bold flex items-center justify-center text-sm border border-white/20">
                {activeUserStatus.userName.charAt(0).toUpperCase()}
              </div>
            )}
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
          ) : currentStory.type === "video" ? (
            /* Video Story */
            <motion.div
              key={currentStory.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-h-[70vh] max-w-xl aspect-[3/4] md:aspect-[9/16] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black flex flex-col justify-center"
            >
              <video
                ref={videoRef}
                src={currentStory.content}
                autoPlay
                playsInline
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleNext}
                className="w-full h-full object-contain pointer-events-none"
              />
              
              {currentStory.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/75 to-transparent px-6 py-6 text-white text-center text-sm font-semibold leading-relaxed border-t border-white/5">
                  {currentStory.caption}
                </div>
              )}
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

      {/* 5. Bottom Section: Views bar (Self) OR Reply & Picker bar (Contact) */}
      {isSelf ? (
        /* Self Status: Views & Reactions Indicator Bar */
        <div className="w-full max-w-xl px-4 pb-6 pt-2 z-20 flex flex-col gap-3 select-none">
          <button
            onClick={() => {
              setIsViewsListOpen(true);
              setIsPaused(true);
            }}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between text-white transition active:scale-98 cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450">
                <CircleDashed className="h-4.5 w-4.5 animate-[spin_8s_linear_infinite]" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block leading-none">Views</span>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  {currentStory.viewedBy?.length || 0} views • {currentStory.reactions?.length || 0} reactions
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick preview of reactions */}
              <div className="flex -space-x-1.5 mr-1">
                {(currentStory.reactions || [])
                  .map((rx: StatusStoryReaction) => rx.emoji)
                  .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
                  .slice(0, 3)
                  .map((emoji: string, i: number) => (
                    <span key={i} className="text-sm bg-zinc-900 border border-white/10 rounded-full h-5 w-5 flex items-center justify-center">
                      {emoji}
                    </span>
                  ))}
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </div>
          </button>
        </div>
      ) : (
        /* Contact Status: Emoji Quick Reactions & Reply Bar */
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
      )}

      {/* 6. Views and Reactions List Bottom Sheet */}
      <AnimatePresence>
        {isViewsListOpen && (
          <div className="absolute inset-0 z-40 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsViewsListOpen(false);
                setIsPaused(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sheet Card */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl bg-zinc-950 border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col max-h-[75vh] z-10 overflow-hidden"
            >
              {/* Drag Indicator handle */}
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto my-3 flex-shrink-0" />

              {/* Tabs Row */}
              <div className="px-6 pb-2 border-b border-white/5 flex gap-4 text-sm font-bold text-zinc-400 flex-shrink-0">
                <button
                  onClick={() => setViewerTab("views")}
                  className={`pb-2.5 relative transition ${viewerTab === "views" ? "text-white" : "hover:text-zinc-350"}`}
                >
                  <span>Views ({currentStory.viewedBy?.length || 0})</span>
                  {viewerTab === "views" && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
                <button
                  onClick={() => setViewerTab("reactions")}
                  className={`pb-2.5 relative transition ${viewerTab === "reactions" ? "text-white" : "hover:text-zinc-350"}`}
                >
                  <span>Reactions ({currentStory.reactions?.length || 0})</span>
                  {viewerTab === "reactions" && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
              </div>

              {/* List Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {viewerTab === "views" ? (
                  /* Views List */
                  (currentStory.viewedBy || []).length > 0 ? (
                    (currentStory.viewedBy || []).map((view, index) => {
                      // Find if this viewer also reacted
                      const userReaction = (currentStory.reactions || []).find(
                        (rx: StatusStoryReaction) => rx.userId === view.userId
                      );

                      return (
                        <div key={index} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition">
                          <div className="flex items-center gap-3">
                            {view.userAvatar ? (
                              <img
                                src={view.userAvatar}
                                className="h-9 w-9 rounded-full object-cover border border-white/10"
                                alt={view.userName}
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center text-xs border border-white/10">
                                {view.userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="text-left">
                              <span className="text-xs font-bold text-white block">{view.userName}</span>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">
                                {formatViewerTimestamp(view.viewedAt)}
                              </span>
                            </div>
                          </div>

                          {userReaction && (
                            <span className="text-lg bg-zinc-800 h-7 w-7 rounded-full flex items-center justify-center border border-white/5">
                              {userReaction.emoji}
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-zinc-500 text-xs">
                      No views yet.
                    </div>
                  )
                ) : (
                  /* Reactions List */
                  (currentStory.reactions || []).length > 0 ? (
                    (currentStory.reactions || []).map((rx: StatusStoryReaction, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition">
                        <div className="flex items-center gap-3">
                          {rx.userAvatar ? (
                            <img
                              src={rx.userAvatar}
                              className="h-9 w-9 rounded-full object-cover border border-white/10"
                              alt={rx.userName}
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center text-xs border border-white/10">
                              {rx.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="text-left">
                            <span className="text-xs font-bold text-white block">{rx.userName}</span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              {formatViewerTimestamp(rx.reactedAt, "Reacted")}
                            </span>
                          </div>
                        </div>

                        <span className="text-xl bg-zinc-800 h-8 w-8 rounded-full flex items-center justify-center border border-white/5 shadow-md">
                          {rx.emoji}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-zinc-500 text-xs">
                      No reactions yet.
                    </div>
                  )
                )}
              </div>

              {/* Close button */}
              <div className="p-4 border-t border-white/5 flex justify-end flex-shrink-0">
                <button
                  onClick={() => {
                    setIsViewsListOpen(false);
                    setIsPaused(false);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 text-white rounded-xl transition uppercase tracking-wide cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default StatusDetailWindow;
