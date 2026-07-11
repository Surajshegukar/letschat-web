/**
 * Converts a base64 string to a Uint8Array.
 * Typically used for converting public VAPID keys for Web Push registration.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Triggers a browser/service-worker notification in the foreground.
 * Attempts to use the active service worker, falling back to the standard Notification API.
 */
export function showForegroundNotification(senderName: string, body: string, conversationId: string) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const title = `${senderName} — Let's Chat`;
  const options: NotificationOptions = {
    body,
    icon: "/favicon.ico",
    tag: conversationId,
    data: { url: `/chat?conv=${conversationId}` },
  };

  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          if (reg.active) {
            reg.showNotification(title, options).catch(() => {
              new Notification(title, { body: options.body, icon: options.icon });
            });
          } else {
            new Notification(title, { body: options.body, icon: options.icon });
          }
        })
        .catch(() => {
          new Notification(title, { body: options.body, icon: options.icon });
        });
    } else {
      new Notification(title, { body: options.body, icon: options.icon });
    }
  } catch (err) {
    console.warn("Failed to display foreground notification:", err);
  }
}

