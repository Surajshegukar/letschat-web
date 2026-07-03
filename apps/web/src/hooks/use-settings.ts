import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { SettingsView } from "@/types/settings";

export function useSettings() {
  const { isProfileDrawerOpen, closeProfileDrawer } = useUIStore();
  const { user, updateUser } = useAuthStore();

  const [currentView, setCurrentView] = useState<SettingsView>("settings");
  const [searchQuery, setSearchQuery] = useState("");

  // Profile Editor States
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.username || "");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempAbout, setTempAbout] = useState(user?.about || "");
  const [showAvatarChooser, setShowAvatarChooser] = useState(false);

  // Account Settings states
  const [securityAlerts, setSecurityAlerts] = useState(false);
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);

  // Privacy Settings states
  const [lastSeen, setLastSeen] = useState("My Contacts");
  const [profilePhotoPriv, setProfilePhotoPriv] = useState("Everyone");
  const [aboutPriv, setAboutPriv] = useState("Everyone");
  const [readReceipts, setReadReceipts] = useState(true);
  const [disappearingTimer, setDisappearingTimer] = useState("Off");

  // Notifications states
  const [soundEnabled, setSoundEnabled] = useState(user?.soundEnabled ?? true);
  const [groupSound, setGroupSound] = useState(true);
  const [showPreviews, setShowPreviews] = useState(true);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUser({ username: tempName });
    }
    setIsEditingName(false);
  };

  const handleSaveAbout = () => {
    updateUser({ about: tempAbout });
    setIsEditingAbout(false);
  };

  const handleSelectAvatar = (url: string) => {
    updateUser({ avatarUrl: url });
    setShowAvatarChooser(false);
  };

  const handleBack = () => {
    if (currentView === "settings") {
      closeProfileDrawer();
    } else {
      setCurrentView("settings");
    }
  };

  return {
    isProfileDrawerOpen,
    closeProfileDrawer,
    user,
    updateUser,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    
    // Profile Edit
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
    handleBack,

    // Account
    securityAlerts,
    setSecurityAlerts,
    twoStepEnabled,
    setTwoStepEnabled,

    // Privacy
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

    // Notifications & Sounds
    soundEnabled,
    setSoundEnabled,
    groupSound,
    setGroupSound,
    showPreviews,
    setShowPreviews,
  };
}

export default useSettings;
