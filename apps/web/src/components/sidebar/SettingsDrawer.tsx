import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { AVATAR_PRESETS, SETTINGS_OPTIONS } from "@/data/settings-data";
import { SettingsRootView } from "./settings-views/SettingsRootView";
import { SettingsProfileView } from "./settings-views/SettingsProfileView";
import { SettingsAccountView } from "./settings-views/SettingsAccountView";
import { SettingsPrivacyView } from "./settings-views/SettingsPrivacyView";
import { SettingsChatsView } from "./settings-views/SettingsChatsView";
import { SettingsNotificationsView } from "./settings-views/SettingsNotificationsView";
import { useTheme } from "next-themes";

export function SettingsDrawer() {
  const {
    isProfileDrawerOpen,
    user,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    isEditingName,
    setIsEditingName,
    tempName,
    setTempName,
    isEditingAbout,
    setIsEditingAbout,
    tempAbout,
    setTempAbout,
    showAvatarChooser,
    setShowAvatarChooser,
    handleSaveName,
    handleSaveAbout,
    handleSelectAvatar,
    handleUploadCustomAvatar,
    handleBack,
    securityAlerts,
    setSecurityAlerts,
    twoStepEnabled,
    setTwoStepEnabled,
    handleDeleteAccount,
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
    soundEnabled,
    setSoundEnabled,
    groupSound,
    setGroupSound,
    showPreviews,
    setShowPreviews,
  } = useSettings();

  const { theme, setTheme } = useTheme();

  const filteredOptions = SETTINGS_OPTIONS.filter(
    (opt) =>
      opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isProfileDrawerOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween", duration: 0.25 }}
          className="absolute left-0 top-0 bottom-0 w-[430px] z-40 bg-[#FAFAFC] dark:bg-[#09090B] border-r border-zinc-200/80 dark:border-zinc-900 shadow-2xl flex flex-col overflow-hidden select-none"
        >
          {/* Header Panel */}
          <div className="h-20 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C]"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                {currentView === "settings" ? "Settings" : currentView}
              </h2>
            </div>
          </div>

          {/* Drawer Body switcher */}
          <div className="flex-1 overflow-y-auto">
            {currentView === "settings" && (
              <SettingsRootView
                user={user}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredOptions={filteredOptions}
                onSelectView={setCurrentView}
                avatarPresets={AVATAR_PRESETS}
              />
            )}

            {currentView === "profile" && (
              <SettingsProfileView
                user={user}
                avatarPresets={AVATAR_PRESETS}
                showAvatarChooser={showAvatarChooser}
                setShowAvatarChooser={setShowAvatarChooser}
                handleSelectAvatar={handleSelectAvatar}
                isEditingName={isEditingName}
                setIsEditingName={setIsEditingName}
                tempName={tempName}
                setTempName={setTempName}
                handleSaveName={handleSaveName}
                isEditingAbout={isEditingAbout}
                setIsEditingAbout={setIsEditingAbout}
                tempAbout={tempAbout}
                setTempAbout={setTempAbout}
                handleSaveAbout={handleSaveAbout}
                handleUploadCustomAvatar={handleUploadCustomAvatar}
              />
            )}

            {currentView === "account" && (
              <SettingsAccountView
                securityAlerts={securityAlerts}
                setSecurityAlerts={setSecurityAlerts}
                twoStepEnabled={twoStepEnabled}
                setTwoStepEnabled={setTwoStepEnabled}
                handleDeleteAccount={handleDeleteAccount}
              />
            )}

            {currentView === "privacy" && (
              <SettingsPrivacyView
                lastSeen={lastSeen}
                setLastSeen={setLastSeen}
                profilePhotoPriv={profilePhotoPriv}
                setProfilePhotoPriv={setProfilePhotoPriv}
                aboutPriv={aboutPriv}
                setAboutPriv={setAboutPriv}
                readReceipts={readReceipts}
                setReadReceipts={setReadReceipts}
                disappearingTimer={disappearingTimer}
                setDisappearingTimer={setDisappearingTimer}
              />
            )}

            {currentView === "chats" && (
              <SettingsChatsView
                theme={theme || "system"}
                setTheme={setTheme}
              />
            )}

            {currentView === "notifications" && (
              <SettingsNotificationsView
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                groupSound={groupSound}
                setGroupSound={setGroupSound}
                showPreviews={showPreviews}
                setShowPreviews={setShowPreviews}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SettingsDrawer;
