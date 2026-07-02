import React from "react";

interface AudioCallLayoutProps {
  avatarUrl?: string;
  name: string;
  status: string;
}

export function AudioCallLayout({
  avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  name,
  status,
}: AudioCallLayoutProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Pulse wave animation surrounding avatar */}
      <div className="relative flex items-center justify-center h-64 w-64 my-6">
        <div className="absolute inset-0 rounded-full bg-[#19E68C]/5 border border-[#19E68C]/10 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute inset-4 rounded-full bg-[#19E68C]/10 border border-[#19E68C]/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
        <div className="absolute inset-8 rounded-full bg-[#19E68C]/15 border border-[#19E68C]/30 animate-pulse" />

        {/* User avatar */}
        <img
          src={avatarUrl}
          className="relative h-36 w-36 rounded-full object-cover shadow-2xl border-4 border-zinc-800"
          alt={name}
        />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-white mt-4 leading-snug">{name}</h2>
      <p className="text-sm font-medium text-emerald-450 dark:text-[#19E68C] tracking-wide mt-2">
        {status}
      </p>
    </div>
  );
}
export default AudioCallLayout;
