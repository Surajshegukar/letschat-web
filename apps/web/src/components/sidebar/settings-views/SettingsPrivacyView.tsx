import React from "react";
import { Eye, EyeOff, UserCheck } from "lucide-react";

interface SettingsPrivacyViewProps {
  lastSeen: string;
  setLastSeen: (val: string) => void;
  profilePhotoPriv: string;
  setProfilePhotoPriv: (val: string) => void;
  aboutPriv: string;
  setAboutPriv: (val: string) => void;
  readReceipts: boolean;
  setReadReceipts: (val: boolean) => void;
  disappearingTimer: string;
  setDisappearingTimer: (val: string) => void;
}

export function SettingsPrivacyView({
  lastSeen,
  setLastSeen,
  profilePhotoPriv,
  setProfilePhotoPriv,
  aboutPriv,
  setAboutPriv,
  readReceipts,
  setReadReceipts,
  disappearingTimer,
  setDisappearingTimer,
}: SettingsPrivacyViewProps) {
  return (
    <div className="p-4 space-y-4 text-left">
      {/* 1. Visibility selectors */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-4">
        <h4 className="text-xs font-extrabold text-emerald-655 dark:text-[#19E68C] uppercase tracking-wide">
          Who Can See My Details
        </h4>

        {/* Last Seen */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-855 dark:text-zinc-355">
              Last Seen & Online
            </span>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-450 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider">
              Local Only
            </span>
          </div>
          <select
            value={lastSeen}
            onChange={(e) => setLastSeen(e.target.value)}
            className="w-full bg-[#F0F2F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#19E68C]"
          >
            <option>Everyone</option>
            <option>My Contacts</option>
            <option>Nobody</option>
          </select>
        </div>

        {/* Profile photo */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-855 dark:text-zinc-355">
              Profile Photo Visibility
            </span>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-455 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider">
              Local Only
            </span>
          </div>
          <select
            value={profilePhotoPriv}
            onChange={(e) => setProfilePhotoPriv(e.target.value)}
            className="w-full bg-[#F0F2F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#19E68C]"
          >
            <option>Everyone</option>
            <option>My Contacts</option>
            <option>Nobody</option>
          </select>
        </div>

        {/* About Bio visibility */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-855 dark:text-zinc-355">
              About Status Visibility
            </span>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-455 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider">
              Local Only
            </span>
          </div>
          <select
            value={aboutPriv}
            onChange={(e) => setAboutPriv(e.target.value)}
            className="w-full bg-[#F0F2F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#19E68C]"
          >
            <option>Everyone</option>
            <option>My Contacts</option>
            <option>Nobody</option>
          </select>
        </div>
      </div>

      {/* 2. Read Receipts checkbox */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
            <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
              Read Receipts
            </span>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-455 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ml-2">
              Local Only
            </span>
          </div>
          <input
            type="checkbox"
            checked={readReceipts}
            onChange={(e) => setReadReceipts(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-zinc-350 dark:border-zinc-800 text-emerald-500 focus:ring-[#19E68C] transition"
          />
        </div>
        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-relaxed font-semibold">
          If disabled, you will not send or receive read check indicators. Read receipt checkmarks are always enabled in community group conversations.
        </p>
      </div>

      {/* 3. Disappearing messages */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EyeOff className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
            <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
              Disappearing Timer
            </span>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-455 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ml-2">
              Local Only
            </span>
          </div>
          <select
            value={disappearingTimer}
            onChange={(e) => setDisappearingTimer(e.target.value)}
            className="bg-[#F0F2F5] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200"
          >
            <option>Off</option>
            <option>24 Hours</option>
            <option>7 Days</option>
            <option>90 Days</option>
          </select>
        </div>
        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-relaxed font-semibold">
          Set up new chat rooms to automatically wipe messages after the configured time threshold.
        </p>
      </div>

      {/* 4. Blocked contacts counts */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-855 dark:text-zinc-200">
                Blocked Contacts
              </p>
              <span className="bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
            <p className="text-[9px] text-zinc-455 dark:text-zinc-500 font-semibold mt-0.5">
              Manage blocklist registry.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full text-zinc-500 dark:text-zinc-350">
          0 contacts
        </span>
      </div>
    </div>
  );
}

export default SettingsPrivacyView;
