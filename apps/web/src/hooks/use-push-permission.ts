import { useState, useEffect, useCallback } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { api } from "@/lib/axios";
import { toast } from "sonner";

export function usePushPermission() {
  const { registerPush } = usePushNotifications();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const checkPermission = useCallback(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    checkPermission();
    // Re-check periodically in case user updates permission in site settings
    const id = setInterval(checkPermission, 3000);
    return () => clearInterval(id);
  }, [checkPermission]);

  const turnOn = useCallback(async () => {
    await registerPush();
    checkPermission();
    const currentPermission = typeof window !== "undefined" && "Notification" in window 
      ? Notification.permission 
      : "default";

    if (currentPermission === "granted") {
      toast.success("Notifications enabled successfully!");
      return true;
    } else {
      toast.error("Notification permission was not granted.");
      return false;
    }
  }, [registerPush, checkPermission]);

  const turnOff = useCallback(async () => {
    try {
      await api.post("/users/me/push-token", { subscription: null });
      setPermission("default");
      toast.success("Notifications turned off.");
      return true;
    } catch (err) {
      toast.error("Failed to turn off notifications.");
      return false;
    }
  }, []);

  return {
    permission,
    turnOn,
    turnOff,
    checkPermission,
  };
}

export default usePushPermission;
