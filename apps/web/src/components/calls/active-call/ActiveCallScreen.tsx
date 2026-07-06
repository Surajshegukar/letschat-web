"use client";

import React from "react";
import { useCallScreen } from "@/hooks/use-call-screen";
import { AudioCallLayout } from "./AudioCallLayout";
import { VideoCallLayout } from "./VideoCallLayout";
import { MinimizedCallCard } from "./call-screen/MinimizedCallCard";
import { CallTopBar } from "./call-screen/CallTopBar";
import { CallControls } from "./call-screen/CallControls";

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

  if (isMinimized) {
    return (
      <MinimizedCallCard
        callerName={callerName}
        callerAvatarUrl={callerAvatarUrl}
        statusText={statusText}
        onMaximize={() => setIsMinimized(false)}
        onEndCall={endCall}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] flex flex-col justify-between items-center text-white">
      <CallTopBar onMinimize={() => setIsMinimized(true)} />

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

      <CallControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isSpeakerOn={isSpeakerOn}
        callType={callType}
        onToggleMute={() => setIsMuted((m) => !m)}
        onToggleVideo={() => setIsVideoOff((v) => !v)}
        onToggleSpeaker={() => setIsSpeakerOn((s) => !s)}
        onEndCall={endCall}
      />
    </div>
  );
}

export default ActiveCallScreen;
