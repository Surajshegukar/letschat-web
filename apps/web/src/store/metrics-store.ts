import { create } from "zustand";

interface MetricsState {
  socketLatency: number;
  activeConnectionsCount: number;
  totalRoomsJoined: number;
  currentRoomListeners: number;
  totalApiCalls: number;
  apiCallsInLast30s: number[];
  apiCallsForCurrentMessage: number;
  apiCallsPerLastMessage: number;
  isTrackingMessage: boolean;

  setSocketLatency: (latency: number) => void;
  setActiveConnectionsCount: (count: number) => void;
  setTotalRoomsJoined: (count: number) => void;
  setCurrentRoomListeners: (count: number) => void;
  incrementTotalApiCalls: () => void;
  cleanOldApiCalls: () => void;
  getApiCallsInLast30sCount: () => number;
  startMessageApiTracking: () => void;
  stopMessageApiTracking: () => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  socketLatency: 0,
  activeConnectionsCount: 0,
  totalRoomsJoined: 0,
  currentRoomListeners: 0,
  totalApiCalls: 0,
  apiCallsInLast30s: [],
  apiCallsForCurrentMessage: 0,
  apiCallsPerLastMessage: 0,
  isTrackingMessage: false,

  setSocketLatency: (latency) => set({ socketLatency: latency }),
  setActiveConnectionsCount: (count) => set({ activeConnectionsCount: count }),
  setTotalRoomsJoined: (count) => set({ totalRoomsJoined: count }),
  setCurrentRoomListeners: (count) => set({ currentRoomListeners: count }),

  incrementTotalApiCalls: () => {
    const now = Date.now();
    set((state) => {
      const updatedList = [...state.apiCallsInLast30s, now];
      const apiCallsForCurrentMessage = state.isTrackingMessage
        ? state.apiCallsForCurrentMessage + 1
        : state.apiCallsForCurrentMessage;

      return {
        totalApiCalls: state.totalApiCalls + 1,
        apiCallsInLast30s: updatedList,
        apiCallsForCurrentMessage,
      };
    });
    get().cleanOldApiCalls();
  },

  cleanOldApiCalls: () => {
    const cutoff = Date.now() - 30000;
    set((state) => ({
      apiCallsInLast30s: state.apiCallsInLast30s.filter((time) => time >= cutoff),
    }));
  },

  getApiCallsInLast30sCount: () => {
    get().cleanOldApiCalls();
    return get().apiCallsInLast30s.length;
  },

  startMessageApiTracking: () => {
    set({
      isTrackingMessage: true,
      apiCallsForCurrentMessage: 0,
    });
  },

  stopMessageApiTracking: () => {
    set((state) => ({
      isTrackingMessage: false,
      apiCallsPerLastMessage: state.apiCallsForCurrentMessage,
    }));
  },
}));

export default useMetricsStore;
