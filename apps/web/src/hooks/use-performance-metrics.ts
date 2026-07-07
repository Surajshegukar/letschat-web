"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/providers/socket-provider";
import { useMetricsStore } from "@/store/metrics-store";
import { useChatStore } from "@/store/chat-store";
import { useConversations } from "@/hooks/api/use-conversations";
import { PerformanceMetricsData } from "@/types/metrics";

export function usePerformanceMetrics(): PerformanceMetricsData {
  const { socket, isConnected } = useSocket();
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const { data: convResponse } = useConversations();
  const conversationsCount = convResponse?.data?.conversations?.length || 0;

  const {
    socketLatency,
    activeConnectionsCount,
    totalRoomsJoined,
    currentRoomListeners,
    totalApiCalls,
    apiCallsPerLastMessage,
    setSocketLatency,
    setActiveConnectionsCount,
    setTotalRoomsJoined,
    setCurrentRoomListeners,
    getApiCallsInLast30sCount,
  } = useMetricsStore();

  const [callsLast30s, setCallsLast30s] = useState(0);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [memory, setMemory] = useState<{ used: number; total: number } | null>(null);

  // 1. Calculate and update rolling 30s call rate
  useEffect(() => {
    const interval = setInterval(() => {
      setCallsLast30s(getApiCallsInLast30sCount());
    }, 1000);
    return () => clearInterval(interval);
  }, [getApiCallsInLast30sCount]);

  // 2. Update total rooms joined (conversations + personal room)
  useEffect(() => {
    setTotalRoomsJoined(isConnected ? conversationsCount + 1 : 0);
  }, [conversationsCount, isConnected, setTotalRoomsJoined]);

  // 3. Socket event mapping (latency, connections, room listeners)
  useEffect(() => {
    if (!socket || !isConnected) {
      setActiveConnectionsCount(0);
      setCurrentRoomListeners(0);
      return;
    }

    const onPong = (timestamp: number) => {
      const latency = Date.now() - timestamp;
      setSocketLatency(latency);
    };

    const onConnectionsCount = (count: number) => {
      setActiveConnectionsCount(count);
    };

    const onRoomListenersCount = (data: { conversationId: string; count: number }) => {
      if (data.conversationId === activeRoomId) {
        setCurrentRoomListeners(data.count);
      }
    };

    socket.on("pong_test", onPong);
    socket.on("active_connections_count", onConnectionsCount);
    socket.on("room_listeners_count", onRoomListenersCount);

    // Initial ping test
    socket.emit("ping_test", Date.now());

    // Set up periodic ping interval (every 5 seconds)
    const pingInterval = setInterval(() => {
      socket.emit("ping_test", Date.now());
    }, 5000);

    return () => {
      socket.off("pong_test", onPong);
      socket.off("active_connections_count", onConnectionsCount);
      socket.off("room_listeners_count", onRoomListenersCount);
      clearInterval(pingInterval);
    };
  }, [socket, isConnected, activeRoomId, setSocketLatency, setActiveConnectionsCount, setCurrentRoomListeners]);

  // 4. Measure client page load time
  useEffect(() => {
    if (typeof window !== "undefined") {
      const getLoadTime = () => {
        const entries = performance.getEntriesByType("navigation");
        if (entries.length > 0) {
          const perf = entries[0] as PerformanceNavigationTiming;
          setLoadTime(Math.round(perf.duration));
        } else {
          const timing = performance.timing;
          setLoadTime(timing.loadEventEnd - timing.navigationStart);
        }
      };

      if (document.readyState === "complete") {
        getLoadTime();
      } else {
        window.addEventListener("load", getLoadTime);
        return () => window.removeEventListener("load", getLoadTime);
      }
    }
  }, []);

  // 5. Measure browser heap memory usage (Chrome/Edge/Opera spec)
  useEffect(() => {
    const memoryInterval = setInterval(() => {
      const perf = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (perf) {
        setMemory({
          used: Math.round(perf.usedJSHeapSize / 1024 / 1024),
          total: Math.round(perf.jsHeapSizeLimit / 1024 / 1024),
        });
      }
    }, 2000);

    return () => clearInterval(memoryInterval);
  }, []);

  // 6. Reset listeners count if room changes or goes null
  useEffect(() => {
    if (!activeRoomId) {
      setCurrentRoomListeners(0);
    }
  }, [activeRoomId, setCurrentRoomListeners]);

  return {
    socketLatency,
    activeConnectionsCount,
    totalRoomsJoined,
    currentRoomListeners,
    totalApiCalls,
    callsLast30s,
    apiCallsPerLastMessage,
    loadTime,
    memory,
    isConnected,
  };
}
