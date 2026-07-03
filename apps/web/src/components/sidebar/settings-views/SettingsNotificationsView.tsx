import React from "react";
import { Volume2, AlertTriangle } from "lucide-react";

interface SettingsNotificationsViewProps {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  groupSound: boolean;
  setGroupSound: (val: boolean) => void;
  showPreviews: boolean;
  setShowPreviews: (val: boolean) => void;
}

export function SettingsNotificationsView({
  soundEnabled,
  setSoundEnabled,
  groupSound,
  setGroupSound,
  showPreviews,
  setShowPreviews,
}: SettingsNotificationsViewProps) {
  return (
    <div className="p-4 space-y-4 text-left">
      {/* Alert sounds */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
            <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
              Notification Tone
            </span>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-zinc-350 dark:border-zinc-800 text-emerald-500 focus:ring-[#19E68C] transition"
          />
        </div>
        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-relaxed font-semibold">
          Play audio warning chimes on incoming direct text messages.
        </p>
      </div>

      {/* Group sound */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
            <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
              Group Tone Warning
            </span>
          </div>
          <input
            type="checkbox"
            checked={groupSound}
            onChange={(e) => setGroupSound(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-zinc-350 dark:border-zinc-800 text-emerald-500 focus:ring-[#19E68C] transition"
          />
        </div>
        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-relaxed font-semibold">
          Play audio warnings for messages received in community channels or group discussions.
        </p>
      </div>

      {/* Preview flags */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
            <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
              Show Previews
            </span>
          </div>
          <input
            type="checkbox"
            checked={showPreviews}
            onChange={(e) => setShowPreviews(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-zinc-350 dark:border-zinc-800 text-emerald-500 focus:ring-[#19E68C] transition"
          />
        </div>
        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-relaxed font-semibold">
          Display preview text snippet inside desktop alert push banners.
        </p>
      </div>
    </div>
  );
}

export default SettingsNotificationsView;
