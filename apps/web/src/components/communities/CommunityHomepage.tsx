import React from "react";
import { Megaphone, MessageSquare, UserPlus, X } from "lucide-react";
import { Community } from "@/types/communities";

interface CommunityHomepageProps {
  activeCommunity: Community;
  onClearSelection: () => void;
  onSelectGroup: (communityId: string, groupId: string | null) => void;
}

export function CommunityHomepage({
  activeCommunity,
  onClearSelection,
  onSelectGroup,
}: CommunityHomepageProps) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center select-none">
      {/* Banner cover */}
      <div className="w-full h-48 bg-zinc-350 dark:bg-zinc-900 relative flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200"
          alt="Community Banner"
          className="w-full h-full object-cover opacity-85 dark:opacity-75"
        />
        {/* Close button overlay */}
        <button
          onClick={onClearSelection}
          className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Profile Header Overlapping Banner */}
      <div className="w-full max-w-2xl px-6 relative -mt-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200/60 dark:border-zinc-900/60">
        <div className="flex items-end gap-4 flex-wrap md:flex-nowrap">
          <img
            src={activeCommunity.avatar}
            className="h-20 w-20 rounded-2xl object-cover border-4 border-white dark:border-[#0c0c0e] shadow-lg bg-zinc-200 dark:bg-zinc-800 flex-shrink-0"
            alt={activeCommunity.name}
          />
          <div className="min-w-0 pb-1">
            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-none">
              {activeCommunity.name}
            </h2>
            <p className="text-xs text-zinc-450 mt-2 font-medium">
              Workspace Umbrella • {activeCommunity.memberCount} active members
            </p>
          </div>
        </div>

        <button
          onClick={() => alert("Invite link copied to clipboard!")}
          className="h-9 px-4 rounded-xl text-xs font-bold border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-slate-655 dark:text-zinc-400 flex items-center gap-1.5 self-start md:self-end flex-shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite</span>
        </button>
      </div>

      {/* Organization Directory */}
      <div className="w-full max-w-2xl px-6 py-6 space-y-6 flex-1">
        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            About Community
          </h4>
          <p className="text-sm text-slate-700 dark:text-zinc-350 leading-relaxed">
            {activeCommunity.description}
          </p>
        </div>

        {/* Subgroups directory grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Available Sub-groups ({activeCommunity.groups.length})
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-3.5">
            {activeCommunity.groups.map((group) => {
              const GroupIcon = group.type === "announcement" ? Megaphone : MessageSquare;
              return (
                <div
                  key={group.id}
                  className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-850 bg-white dark:bg-zinc-900/50 hover:shadow-md transition duration-300 flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="flex gap-2.5">
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 h-9 w-9 flex items-center justify-center flex-shrink-0">
                      <GroupIcon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-800 dark:text-zinc-250 truncate">
                        {group.name}
                      </p>
                      <p className="text-[10px] text-zinc-450 mt-1 uppercase font-semibold">
                        {group.type} channel
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectGroup(activeCommunity.id, group.id)}
                    className="w-full py-2 rounded-xl text-[11px] font-bold bg-zinc-50 hover:bg-[#19E68C]/15 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-slate-655 dark:text-zinc-400 dark:hover:text-[#19E68C] hover:text-emerald-700 transition"
                  >
                    Enter Discussion
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityHomepage;
