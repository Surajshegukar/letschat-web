"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Minimize2,
  Maximize2,
  Lock,
} from "lucide-react";
import { useCallScreen } from "@/hooks/use-call-screen";
import { AudioCallLayout } from "./AudioCallLayout";
import { VideoCallLayout } from "./VideoCallLayout";

interface ActiveCallScreenProps {
  isOpen: boolean;
  onClose: () => void;
  callerName: string;
  callerAvatarUrl?: string;
  callType: "audio" | "video";
}

export function ActiveCallScreen({
  isOpen,
  onClose,
  callerName,
  callerAvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  callType,
}: ActiveCallScreenProps) {
  const {
    callState,
    duration,
    isMuted,
    setIsMuted,
    isVideoOff,
    setIsVideoOff,
    isSpeakerOn,
    setIsSpeakerOn,
    isMinimized,
    setIsMinimized,
    endCall,
  } = useCallScreen(isOpen, onClose);

  if (!isOpen) return null;

  const statusText = callState === "ringing" ? "Ringing..." : duration;

  // 1. FLOATING MINIMIZED CALL CARD LAYOUT
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-[#0B132B]/95 border border-zinc-800/90 rounded-2xl p-4 shadow-2xl flex items-center justify-between text-white w-76 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center gap-3 min-w-0">
          <img src={callerAvatarUrl} className="h-10 w-10 rounded-full object-cover" alt="" />
          <div className="min-w-0 text-left">
            <p className="text-sm font-bold truncate leading-tight">{callerName}</p>
            <p className="text-[10px] text-emerald-450 mt-1 font-semibold leading-none">
              {callState === "ringing" ? "Ringing..." : duration}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition text-zinc-300"
            title="Maximize call screen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={endCall}
            className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
            title="End Call"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. FULLSCREEN calling overlay
  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] flex flex-col justify-between items-center text-white">
      {/* Top Bar Navigation */}
      <div className="w-full flex items-center justify-between px-6 pt-6 z-30">
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition text-zinc-300 border border-white/5"
          title="Minimize call"
        >
          <Minimize2 className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-zinc-400 font-semibold tracking-wider uppercase select-none">
          <Lock className="h-3 w-3 text-emerald-500" />
          <span>End-to-end encrypted</span>
        </div>

        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Main Calling Content Frame */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        {callType === "video" && !isVideoOff ? (
          <VideoCallLayout
            recipientName={callerName}
            recipientAvatarUrl={callerAvatarUrl}
            status={statusText}
            isSelfVideoOff={isMuted}
          />
        ) : (
          <AudioCallLayout
            avatarUrl={callerAvatarUrl}
            name={callerName}
            status={callState === "ringing" ? "Ringing..." : `Ongoing Call (${duration})`}
          />
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="pb-10 pt-4 px-6 z-30 flex items-center gap-5">
        {/* Toggle Audio Mute */}
        <button
          onClick={() => setIsMuted((m) => !m)}
          className={`p-3.5 rounded-2xl transition border ${
            isMuted
              ? "bg-zinc-800 text-rose-500 border-rose-500/20"
              : "bg-white/5 hover:bg-white/10 text-white border-white/5"
          }`}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOff className="h-5.5 w-5.5" /> : <Mic className="h-5.5 w-5.5" />}
        </button>

        {/* Toggle Video Feed */}
        <button
          onClick={() => setIsVideoOff((v) => !v)}
          className={`p-3.5 rounded-2xl transition border ${
            isVideoOff
              ? "bg-zinc-800 text-rose-500 border-rose-500/20"
              : "bg-white/5 hover:bg-white/10 text-white border-white/5"
          }`}
          title={isVideoOff ? "Start camera" : "Stop camera"}
          disabled={callType !== "video"}
        >
          {isVideoOff ? <VideoOff className="h-5.5 w-5.5" /> : <Video className="h-5.5 w-5.5" />}
        </button>

        {/* Toggle Speaker */}
        <button
          onClick={() => setIsSpeakerOn((s) => !s)}
          className={`p-3.5 rounded-2xl transition border ${
            !isSpeakerOn
              ? "bg-zinc-800 text-zinc-500 border-zinc-700/20"
              : "bg-white/5 hover:bg-white/10 text-white border-white/5"
          }`}
          title={isSpeakerOn ? "Speaker on" : "Speaker off"}
        >
          {isSpeakerOn ? <Volume2 className="h-5.5 w-5.5" /> : <VolumeX className="h-5.5 w-5.5" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={endCall}
          className="p-3.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.97] text-white rounded-2xl shadow-xl shadow-rose-600/10 transition font-bold"
          title="End current call"
        >
          <PhoneOff className="h-5.5 w-5.5" />
        </button>
      </div>
    </div>
  );
}
export default ActiveCallScreen;
