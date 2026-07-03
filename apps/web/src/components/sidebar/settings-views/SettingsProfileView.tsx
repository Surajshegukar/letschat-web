import React from "react";
import { Camera, Edit2, Check, X } from "lucide-react";

interface SettingsProfileViewProps {
  user: any;
  avatarPresets: string[];
  showAvatarChooser: boolean;
  setShowAvatarChooser: (show: boolean) => void;
  handleSelectAvatar: (url: string) => void;
  isEditingName: boolean;
  setIsEditingName: (editing: boolean) => void;
  tempName: string;
  setTempName: (name: string) => void;
  handleSaveName: () => void;
  isEditingAbout: boolean;
  setIsEditingAbout: (editing: boolean) => void;
  tempAbout: string;
  setTempAbout: (about: string) => void;
  handleSaveAbout: () => void;
}

export function SettingsProfileView({
  user,
  avatarPresets,
  showAvatarChooser,
  setShowAvatarChooser,
  handleSelectAvatar,
  isEditingName,
  setIsEditingName,
  tempName,
  setTempName,
  handleSaveName,
  isEditingAbout,
  setIsEditingAbout,
  tempAbout,
  setTempAbout,
  handleSaveAbout,
}: SettingsProfileViewProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Avatar Card */}
      <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm relative">
        <div className="relative h-[130px] w-[130px] group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md">
          <img
            src={user?.avatarUrl || avatarPresets[0]}
            className="h-full w-full object-cover"
            alt="Profile"
          />
          <button
            onClick={() => setShowAvatarChooser(!showAvatarChooser)}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white"
          >
            <Camera className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              Change Avatar
            </span>
          </button>
        </div>

        {showAvatarChooser && (
          <div className="mt-4 p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex gap-2.5 shadow-inner">
            {avatarPresets.map((url) => (
              <button
                key={url}
                onClick={() => handleSelectAvatar(url)}
                className="h-9 w-9 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 hover:scale-105 active:scale-95 transition"
              >
                <img src={url} alt="Preset Option" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Your Name Editor */}
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3.5 text-left">
        <label className="text-xs font-bold text-emerald-650 dark:text-[#19E68C] uppercase tracking-wide">
          Your Name
        </label>

        {isEditingName ? (
          <div className="flex items-center gap-3 border-b border-emerald-500 pb-1">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm font-semibold text-slate-855 dark:text-zinc-200"
              maxLength={25}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveName}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-emerald-655 dark:text-[#19E68C] transition"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setTempName(user?.username || "");
                  setIsEditingName(false);
                }}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-rose-500 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {user?.username}
            </p>
            <button
              onClick={() => setIsEditingName(true)}
              className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-400 dark:text-zinc-505 hover:text-slate-850 transition"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal font-semibold">
          This is not your username or pin. This name will be visible to your Let's Chat contacts.
        </p>
      </div>

      {/* About Status Editor */}
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3 text-left">
        <label className="text-xs font-bold text-emerald-650 dark:text-[#19E68C] uppercase tracking-wide">
          About
        </label>

        {isEditingAbout ? (
          <div className="flex items-center gap-3 border-b border-emerald-500 pb-1">
            <input
              type="text"
              value={tempAbout}
              onChange={(e) => setTempAbout(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm font-semibold text-slate-855 dark:text-zinc-200"
              maxLength={50}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAbout}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-emerald-655 dark:text-[#19E68C] transition"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setTempAbout(user?.about || "");
                  setIsEditingAbout(false);
                }}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-rose-500 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {user?.about}
            </p>
            <button
              onClick={() => setIsEditingAbout(true)}
              className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-400 dark:text-zinc-505 hover:text-slate-850 transition"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsProfileView;
