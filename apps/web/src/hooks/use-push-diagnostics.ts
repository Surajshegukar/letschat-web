import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { ServiceWorkerStatus } from "@/types/push";

export function usePushDiagnostics(isOpen: boolean) {
  const { registerPush } = usePushNotifications();

  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>("checking");
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const checkPushStatus = useCallback(async () => {
    if (typeof window === "undefined") return;

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    if ("serviceWorker" in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        const activeReg = regs.find((r) => r.scope === window.location.origin + "/");
        if (activeReg) {
          setSwStatus(activeReg.active ? "active" : "waiting");
          const sub = await activeReg.pushManager.getSubscription();
          setHasSubscription(!!sub);
        } else {
          setSwStatus("none");
          setHasSubscription(false);
        }
      } catch (err) {
        setSwStatus("error");
      }
    } else {
      setSwStatus("unsupported");
    }
  }, []);

  // Poll status when open
  useEffect(() => {
    checkPushStatus();
    if (isOpen) {
      const id = setInterval(checkPushStatus, 3000);
      return () => clearInterval(id);
    }
  }, [isOpen, checkPushStatus]);

  const handleReinstall = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;
    setIsRefreshing(true);
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.unregister();
      }
      toast.success("Existing service worker unregistered.");

      await registerPush();
      await checkPushStatus();
      toast.success("Service worker reinstalled successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Reinstall failed: ${msg}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [registerPush, checkPushStatus]);

  const triggerLocalTest = useCallback(async () => {
    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(`[PushTest] ${msg}`);
      logs.push(msg);
    };

    log(`Browser: ${navigator.userAgent.split(" ").slice(-2).join(" ")}`);
    log(`Notification API: ${"Notification" in window ? "supported" : "NOT supported"}`);
    log(`Permission: ${Notification.permission}`);
    log(`SW API: ${"serviceWorker" in navigator ? "supported" : "NOT supported"}`);
    log(`SW Controller: ${navigator.serviceWorker?.controller ? "active" : "none (page not yet controlled)"}`);

    if (typeof window === "undefined" || !("Notification" in window)) {
      log("❌ Notifications API not available.");
      setDebugLog(logs);
      toast.error("Notifications are not supported in this browser.");
      return;
    }

    if (Notification.permission !== "granted") {
      log(`❌ Permission is '${Notification.permission}', not 'granted'.`);
      setDebugLog(logs);
      toast.error("Notification permission not granted!");
      return;
    }

    try {
      // 1. Standard main-thread notification
      log("→ Calling new Notification()...");
      const n = new Notification("Let's Chat — Standard", {
        body: "Standard main-thread notification (no SW)",
      });
      log(`✅ new Notification() created.`);
      n.onerror = (e) => log(`❌ Notification.onerror: ${JSON.stringify(e)}`);
      n.onshow = () => log("✅ Notification shown on screen!");
      n.onclose = () => log("ℹ️ Notification closed.");
      toast.success("Standard test notification sent!");

      // 2. Service Worker notification
      if ("serviceWorker" in navigator) {
        log("→ Waiting for SW ready...");
        const reg = await navigator.serviceWorker.ready;
        log(`✅ SW ready. scope=${reg.scope} active=${!!reg.active}`);

        if (reg.active) {
          log(`→ Calling reg.showNotification()...`);
          await reg.showNotification("Let's Chat — Service Worker", {
            body: "Notification dispatched via service worker.",
          });
          log("✅ reg.showNotification() resolved without error.");
          toast.success("Service Worker test notification sent!");
        } else {
          log("⚠️ SW not yet active — using standard Notification instead.");
          log("ℹ️ Click 'Reinstall SW' to force SW activation, then test again.");
          toast.info("SW not yet active. Used standard notification. Try 'Reinstall SW'.");
        }
      } else {
        log("⚠️ serviceWorker not in navigator — skipping SW notification.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      log(`❌ Error: ${msg}`);
      toast.error(`Test trigger failed: ${msg}`);
    }

    setDebugLog(logs);
  }, []);

  const clearDebugLog = useCallback(() => {
    setDebugLog([]);
  }, []);

  return {
    permission,
    swStatus,
    hasSubscription,
    isRefreshing,
    debugLog,
    handleReinstall,
    triggerLocalTest,
    clearDebugLog,
  };
}
