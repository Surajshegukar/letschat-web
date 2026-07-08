"use client";

import React from "react";
import { ExternalLink, Globe } from "lucide-react";
import { useLinkPreview } from "@/hooks/api/use-link-preview";

interface LinkPreviewProps {
  url: string;
  isMe: boolean;
}

function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-200 dark:bg-zinc-700 ${className}`}
    />
  );
}

export function LinkPreview({ url, isMe }: LinkPreviewProps) {
  const { data, isLoading, isError } = useLinkPreview(url);

  // Skeleton while loading
  if (isLoading) {
    return (
      <div
        className={`mt-2 rounded-xl overflow-hidden border ${
          isMe
            ? "border-emerald-200/60 dark:border-zinc-700/60"
            : "border-zinc-200/80 dark:border-zinc-700/60"
        }`}
      >
        <Skeleton className="w-full h-32" />
        <div className="p-2.5 space-y-1.5">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
    );
  }

  // No data or error — render nothing
  if (isError || !data) return null;

  const domain = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-2 block rounded-xl overflow-hidden border transition-all duration-200 hover:shadow-md group ${
        isMe
          ? "border-emerald-200/70 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-900"
          : "border-zinc-200/80 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-900"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Hero image */}
      {data.image && (
        <div className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800" style={{ maxHeight: 160 }}>
          <img
            src={data.image}
            alt={data.title || "Link preview"}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            style={{ maxHeight: 160 }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Text content */}
      <div className="px-3 py-2.5 space-y-1">
        {/* Domain + external icon */}
        <div className="flex items-center gap-1.5">
          {data.favicon ? (
            <img
              src={data.favicon}
              alt=""
              className="h-3.5 w-3.5 rounded-sm object-contain flex-shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Globe className="h-3 w-3 text-zinc-400 flex-shrink-0" />
          )}
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide truncate">
            {data.siteName || domain}
          </span>
          <ExternalLink className="h-2.5 w-2.5 text-zinc-300 dark:text-zinc-600 ml-auto flex-shrink-0" />
        </div>

        {/* Title */}
        {data.title && (
          <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 leading-snug line-clamp-2">
            {data.title}
          </p>
        )}

        {/* Description */}
        {data.description && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
            {data.description}
          </p>
        )}
      </div>
    </a>
  );
}

export default LinkPreview;
