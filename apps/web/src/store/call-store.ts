import { create } from "zustand";

interface CallState {
  isCallActive: boolean;
  callType: "audio" | "video";
  callerName: string;
  callerAvatarUrl?: string;
  startCall: (name: string, avatarUrl?: string, type?: "audio" | "video") => void;
  endCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  isCallActive: false,
  callType: "audio",
  callerName: "",
  callerAvatarUrl: undefined,
  startCall: (name, avatarUrl, type = "audio") =>
    set({
      isCallActive: true,
      callType: type,
      callerName: name,
      callerAvatarUrl: avatarUrl,
    }),
  endCall: () =>
    set({
      isCallActive: false,
    }),
}));
export default useCallStore;
