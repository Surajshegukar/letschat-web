import React, { useState } from "react";
import { BellOff, Bell, X } from "lucide-react";

import { usePushPermission } from "@/hooks/use-push-permission";

export function NotificationBanner() {
  const { permission, turnOn, turnOff } = usePushPermission();
  const [showBanner, setShowBanner] = useState<boolean>(true);

  const handleTurnOn = async () => {
    await turnOn();
  };

  const handleTurnOff = async () => {
    await turnOff();
  };

  if (!showBanner) return null;

  return (
    <div className="px-3 py-1.5 flex flex-col gap-2">
      {/* 1. Notifications are OFF (permission is default or denied) */}
      {permission !== "granted" ? (
        <div className="flex items-center justify-between bg-[#0d261e] border border-[#133a2e] rounded-2xl px-4 py-3.5 text-[#e4f6ef] transition-all select-none">
          <div className="flex items-center gap-3">
            <BellOff className="h-5 w-5 text-[#19E68C] flex-shrink-0" />
            <span className="text-xs font-semibold">
              Message notifications are off.{" "}
              <button
                onClick={handleTurnOn}
                className="text-[#19E68C] hover:underline font-bold"
              >
                Turn on
              </button>
            </span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* 2. Notifications are ON (permission is granted) */
        <div className="flex items-center justify-between bg-[#0d261e]/40 border border-[#133a2e]/30 rounded-2xl px-4 py-3.5 text-[#e4f6ef]/90 transition-all select-none">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-[#19E68C] flex-shrink-0" />
            <span className="text-xs font-semibold">
              Message notifications are on.{" "}
              <button
                onClick={handleTurnOff}
                className="text-[#19E68C] hover:underline font-bold"
              >
                Turn off
              </button>
            </span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationBanner;
