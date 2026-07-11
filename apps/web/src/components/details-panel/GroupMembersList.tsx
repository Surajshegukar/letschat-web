import React from "react";
import { Crown, UserMinus } from "lucide-react";

interface Participant {
  userId?: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    isOnline?: boolean;
  } | string;
  role?: string;
}

interface GroupMembersListProps {
  participants: Participant[];
  currentUserId?: string;
  onlineUsers: Set<string>;
  isConnected: boolean;
  isAdmin?: boolean;
  onPromote?: (userId: string) => void;
  onRemove?: (userId: string) => void;
}

export function GroupMembersList({
  participants,
  currentUserId,
  onlineUsers,
  isConnected,
  isAdmin = false,
  onPromote,
  onRemove,
}: GroupMembersListProps) {
  return (
    <div className="space-y-3 pt-2">
      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider block">
        Group Members ({participants.filter(p => p.userId && typeof p.userId !== "string" && !(p as any).isDeleted).length})
      </span>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
        {participants.map((p) => {
          if ((p as any).isDeleted) return null;
          const u = p.userId;
          if (!u || typeof u === "string") return null;
          const isMemberOnline = isConnected ? onlineUsers.has(u._id) : !!u.isOnline;
          const initials = (u.displayName || u.username || "")
            .split(" ")
            .slice(0, 2)
            .map((w) => w.charAt(0).toUpperCase())
            .join("");

          return (
            <div key={u._id} className="flex items-center justify-between py-1 group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  {u.avatar ? (
                    <img src={u.avatar} className="h-8 w-8 rounded-full object-cover shadow-sm" alt={u.username} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-xs text-white">
                      {initials}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white dark:border-zinc-950 ${
                      isMemberOnline ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                    {u.displayName || u.username} {u._id === currentUserId && "(You)"}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-550 capitalize leading-none mt-0.5 flex items-center gap-1 font-semibold">
                    {p.role === "admin" && <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />}
                    {p.role || "member"}
                  </p>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && u._id !== currentUserId && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.role !== "admin" && onPromote && (
                    <button
                      onClick={() => onPromote(u._id)}
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-400 hover:text-amber-500 transition"
                      title="Promote to admin"
                    >
                      <Crown className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(u._id)}
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-400 hover:text-red-500 transition"
                      title="Remove participant"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
