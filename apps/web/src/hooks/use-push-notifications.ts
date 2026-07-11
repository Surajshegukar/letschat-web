import { api } from "@/lib/axios";
import { useCallback } from "react";
import { urlBase64ToUint8Array } from "@/utils/push";

export function usePushNotifications() {
  const registerPush = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      console.warn("Web Push is not supported in this browser.");
      return;
    }

    try {
      // 1. Register service worker
      const registration = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      });

      // 2. Request permission
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        console.warn("Notification permission was not granted.");
        return;
      }

      // 3. Get existing subscription or create new subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) {
          console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined in environment variables.");
          return;
        }

        const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as BufferSource,
        });
      }

      // 4. Save to backend
      await api.post("/users/me/push-token", { subscription });
      console.log("Registered Push Subscription with backend successfully.");
    } catch (error) {
      console.error("Failed to register push notifications subscription:", error);
    }
  }, []);

  return { registerPush };
}
