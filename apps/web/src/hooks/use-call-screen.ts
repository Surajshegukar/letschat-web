import { useState, useEffect } from "react";

export function useCallScreen(isOpen: boolean, onClose: () => void) {
  const [callState, setCallState] = useState<"ringing" | "connected" | "ended">("ringing");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Simulated Ringing to Connected Transition
  useEffect(() => {
    if (!isOpen) return;

    setCallState("ringing");
    setDuration(0);
    setIsMinimized(false);

    const ringTimer = setTimeout(() => {
      setCallState("connected");
    }, 3000); // 3 seconds of ringing simulation

    return () => {
      clearTimeout(ringTimer);
    };
  }, [isOpen]);

  // Duration Timer Connection
  useEffect(() => {
    if (callState !== "connected") return;

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [callState]);

  const endCall = () => {
    setCallState("ended");
    setTimeout(() => {
      onClose();
    }, 800); // Small delay to show "Call Ended" feedback cleanly
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    callState,
    duration: formatDuration(duration),
    isMuted,
    setIsMuted,
    isVideoOff,
    setIsVideoOff,
    isSpeakerOn,
    setIsSpeakerOn,
    isMinimized,
    setIsMinimized,
    endCall,
  };
}
export type UseCallScreenReturn = ReturnType<typeof useCallScreen>;
