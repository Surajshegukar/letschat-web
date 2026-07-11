import React, { useState, useEffect } from "react";
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

const getInitials = (name?: string): string => {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
};

const getAvatarGradient = (name?: string): string => {
  const colors = [
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-indigo-500",
    "from-blue-400 to-indigo-600",
    "from-rose-400 to-orange-500",
    "from-amber-400 to-orange-500",
  ];
  const charCodeSum = name ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  return colors[charCodeSum % colors.length] || "from-emerald-400 to-teal-500";
};

export function StatusAvatar({
  src,
  storiesCount,
  unreadCount,
  size = 52,
  userName = "User",
  className,
}: StatusAvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = getInitials(userName) || "?";
  const gradient = getAvatarGradient(userName);

  // If there are no stories, render a standard avatar with no ring
  if (storiesCount === 0) {
    return (
      <div 
        className={clsx("relative flex items-center justify-center flex-shrink-0 select-none", className)}
        style={{ width: size, height: size }}
      >
        {src && !hasError ? (
          <img
            src={src}
            className="rounded-full object-cover w-full h-full border border-zinc-200 dark:border-zinc-800"
            alt={userName}
            onError={() => setHasError(true)}
          />
        ) : (
          <div
            className={clsx(
              "rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white uppercase w-full h-full border border-zinc-200 dark:border-zinc-800",
              gradient
            )}
            style={{ fontSize: size * 0.38 }}
          >
            {initials}
          </div>
        )}
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

  const innerSize = size - (strokeWidth * 2) - padding;

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
          width: innerSize, 
          height: innerSize 
        }}
      >
        {src && !hasError ? (
          <img
            src={src}
            className="w-full h-full object-cover"
            alt={userName}
            onError={() => setHasError(true)}
          />
        ) : (
          <div
            className={clsx(
              "w-full h-full flex items-center justify-center font-bold text-white uppercase bg-gradient-to-br",
              gradient
            )}
            style={{ fontSize: innerSize * 0.38 }}
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusAvatar;
