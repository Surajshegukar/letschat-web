import React from "react";
import { Camera, Edit2, Check, X } from "lucide-react";
import { Avatar } from "../../ui";

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
  handleUploadCustomAvatar: (file: File) => void;
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
  handleUploadCustomAvatar,
}: SettingsProfileViewProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Avatar Card */}
      <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm relative">
        <div className="relative h-[130px] w-[130px] group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md">
          <Avatar
            src={user?.avatarUrl}
            name={user?.displayName || user?.username}
            size="xxl"
            className="w-full h-full object-cover"
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
          <div className="mt-4 p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-2.5 shadow-inner">
            <div className="flex gap-2.5">
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
            <div className="flex justify-center border-t border-zinc-200 dark:border-zinc-800 pt-2">
              <label className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-emerald-650 dark:text-[#19E68C] hover:underline flex items-center gap-1.5 py-1">
                <Camera className="h-3.5 w-3.5" />
                Upload Custom Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadCustomAvatar(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Your Name Editor */}
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3.5 text-left">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-emerald-650 dark:text-[#19E68C] uppercase tracking-wide">
            Your Name
          </label>
          <span className="bg-emerald-500/10 text-emerald-650 dark:text-[#19E68C] px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider">
            Functional
          </span>
        </div>

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
                  setTempName(user?.displayName || user?.username || "");
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
              {user?.displayName || user?.username}
            </p>
            <button
              onClick={() => {
                setTempName(user?.displayName || user?.username || "");
                setIsEditingName(true);
              }}
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

      {/* Username (Read-Only) */}
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-2 text-left">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-emerald-655 dark:text-[#19E68C] uppercase tracking-wide">
            Username
          </label>
          <span className="bg-emerald-500/10 text-emerald-650 dark:text-[#19E68C] px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider">
            Functional
          </span>
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
          @{user?.username}
        </p>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal font-semibold">
          Your username is autogenerated and unique. It cannot be changed.
        </p>
      </div>

      {/* About Status Editor */}
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3 text-left">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-emerald-650 dark:text-[#19E68C] uppercase tracking-wide">
            About
          </label>
          <span className="bg-emerald-500/10 text-emerald-650 dark:text-[#19E68C] px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider">
            Functional
          </span>
        </div>

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
