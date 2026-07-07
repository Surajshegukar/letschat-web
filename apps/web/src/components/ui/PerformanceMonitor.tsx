"use client";

import React, { useState, useRef, useEffect } from "react";
import { Activity, X, Server, Cpu, Database, Network } from "lucide-react";
import { usePerformanceMetrics } from "@/hooks/use-performance-metrics";

interface MetricCardProps {
  label: string;
  value: string | number;
  valueClass?: string;
}

function MetricCard({ label, value, valueClass = "text-slate-800 dark:text-zinc-200" }: MetricCardProps) {
  return (
    <div className="p-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-150/40 dark:border-zinc-850/30">
      <span className="block text-[9px] text-zinc-450 truncate">{label}</span>
      <span className={`text-xs font-extrabold ${valueClass}`}>{value}</span>
    </div>
  );
}

interface MetricSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function MetricSection({ title, icon, children }: MetricSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-zinc-450 uppercase">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

export function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const metrics = usePerformanceMetrics();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const latencyColor =
    metrics.socketLatency < 50
      ? "text-emerald-500"
      : metrics.socketLatency < 150
        ? "text-amber-500"
        : "text-rose-500";

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:scale-[1.02] transition-all duration-250 group shadow-sm"
        title="Performance Metrics"
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${metrics.isConnected ? "bg-emerald-400" : "bg-rose-400"}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${metrics.isConnected ? "bg-emerald-500" : "bg-rose-500"}`}></span>
        </span>
        <Activity className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-550 group-hover:text-emerald-500 transition-colors" />
        <span className="text-[10px] font-bold text-zinc-550 dark:text-zinc-400">
          {metrics.isConnected ? `${metrics.socketLatency}ms` : "Offline"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed bottom-0 mt-2 right-0 z-50 w-[320px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 font-sans">
          <div className="flex items-center justify-between p-3.5 border-b border-zinc-200/40 dark:border-zinc-850/40 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-850 dark:text-zinc-200">
                Performance Monitor
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[360px] overflow-y-auto">
            <MetricSection title="Connection & Rooms" icon={<Network className="h-3 w-3" />}>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  label="Ping Latency"
                  value={metrics.isConnected ? `${metrics.socketLatency} ms` : "---"}
                  valueClass={latencyColor}
                />
                <MetricCard
                  label="Server Sockets"
                  value={metrics.isConnected ? metrics.activeConnectionsCount : 0}
                />
                <MetricCard
                  label="Rooms Joined"
                  value={metrics.totalRoomsJoined}
                />
                <MetricCard
                  label="Room Listeners"
                  value={metrics.currentRoomListeners || "---"}
                />
              </div>
            </MetricSection>

            <MetricSection title="HTTP API Requests" icon={<Database className="h-3 w-3" />}>
              <div className="grid grid-cols-3 gap-2">
                <MetricCard
                  label="Total"
                  value={metrics.totalApiCalls}
                />
                <MetricCard
                  label="Last 30s"
                  value={metrics.callsLast30s}
                />
                <MetricCard
                  label="Per Msg"
                  value={metrics.apiCallsPerLastMessage}
                  valueClass={metrics.apiCallsPerLastMessage === 0 ? "text-emerald-500" : "text-amber-500"}
                />
              </div>
            </MetricSection>

            <MetricSection title="Client Resources" icon={<Cpu className="h-3 w-3" />}>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  label="Load Time"
                  value={metrics.loadTime ? `${metrics.loadTime} ms` : "Calculating..."}
                />
                <MetricCard
                  label="JS Heap Limit"
                  value={metrics.memory ? `${metrics.memory.used} / ${metrics.memory.total} MB` : "---"}
                  valueClass="font-mono text-[10px]"
                />
              </div>
            </MetricSection>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceMonitor;
