import React from "react";
import clsx from "clsx";
import { calculateStatusRing } from "@/utils/status-helpers";

interface StatusAvatarProps {
  src?: string;
  storiesCount: number;
  unreadCount: number;
  size?: number;
  userName?: string;
  className?: string;
}

export function StatusAvatar({
  src,
  storiesCount,
  unreadCount,
  size = 52,
  userName = "User",
  className,
}: StatusAvatarProps) {
  // If there are no stories, render a standard avatar with no ring
  if (storiesCount === 0) {
    return (
      <div 
        className={clsx("relative flex items-center justify-center flex-shrink-0", className)}
        style={{ width: size, height: size }}
      >
        <img
          src={src || "/avatar.png"}
          className="rounded-full object-cover w-full h-full border border-zinc-200 dark:border-zinc-800"
          alt={userName}
        />
      </div>
    );
  }

  const strokeWidth = 2.5;
  const padding = 5; // space between avatar and ring
  const { radius, cx, cy, strokeDasharray, isUnread } = calculateStatusRing(
    size,
    storiesCount,
    unreadCount,
    strokeWidth
  );

  return (
    <div
      className={clsx("relative flex items-center justify-center flex-shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* SVG Ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute transform -rotate-90 pointer-events-none"
      >
        <defs>
          <linearGradient id="status-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C9FF" />
            <stop offset="100%" stopColor="#19E68C" />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          stroke={isUnread ? "url(#status-ring-gradient)" : "currentColor"}
          className={clsx(
            "transition-all duration-500",
            isUnread 
              ? "opacity-100" 
              : "text-zinc-250 dark:text-zinc-800 opacity-80"
          )}
          strokeDasharray={strokeDasharray}
          strokeLinecap={storiesCount > 1 ? "round" : "butt"}
        />
      </svg>

      {/* Avatar Image */}
      <div 
        className="rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
        style={{ 
          width: size - (strokeWidth * 2) - padding, 
          height: size - (strokeWidth * 2) - padding 
        }}
      >
        <img
          src={src || "/avatar.png"}
          className="w-full h-full object-cover"
          alt={userName}
        />
      </div>
    </div>
  );
}

export default StatusAvatar;
