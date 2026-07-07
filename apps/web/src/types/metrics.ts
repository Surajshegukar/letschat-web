export interface MemoryStats {
  used: number;
  total: number;
}

export interface PerformanceMetricsData {
  socketLatency: number;
  activeConnectionsCount: number;
  totalRoomsJoined: number;
  currentRoomListeners: number;
  totalApiCalls: number;
  callsLast30s: number;
  apiCallsPerLastMessage: number;
  loadTime: number | null;
  memory: MemoryStats | null;
  isConnected: boolean;
}
