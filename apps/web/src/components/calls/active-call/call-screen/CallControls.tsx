import React from "react";
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, PhoneOff } from "lucide-react";

interface CallControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  callType: "audio" | "video";
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}

export function CallControls({
  isMuted,
  isVideoOff,
  isSpeakerOn,
  callType,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onEndCall,
}: CallControlsProps) {
  return (
    <div className="pb-10 pt-4 px-6 z-30 flex items-center gap-5">
      <button
        onClick={onToggleMute}
        className={`p-3.5 rounded-2xl transition border ${
          isMuted
            ? "bg-zinc-800 text-rose-500 border-rose-500/20"
            : "bg-white/5 hover:bg-white/10 text-white border-white/5"
        }`}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMuted ? <MicOff className="h-5.5 w-5.5" /> : <Mic className="h-5.5 w-5.5" />}
      </button>

      <button
        onClick={onToggleVideo}
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

      <button
        onClick={onToggleSpeaker}
        className={`p-3.5 rounded-2xl transition border ${
          !isSpeakerOn
            ? "bg-zinc-800 text-zinc-500 border-zinc-700/20"
            : "bg-white/5 hover:bg-white/10 text-white border-white/5"
        }`}
        title={isSpeakerOn ? "Speaker on" : "Speaker off"}
      >
        {isSpeakerOn ? <Volume2 className="h-5.5 w-5.5" /> : <VolumeX className="h-5.5 w-5.5" />}
      </button>

      <button
        onClick={onEndCall}
        className="p-3.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.97] text-white rounded-2xl shadow-xl shadow-rose-600/10 transition font-bold"
        title="End current call"
      >
        <PhoneOff className="h-5.5 w-5.5" />
      </button>
    </div>
  );
}
