// Immediately activate new SW versions without waiting for page reload
self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", function (event) {
  if (event.data) {
    let payload;
    try {
      payload = event.data.json();
    } catch (err) {
      // Fallback if data is not JSON (raw text)
      payload = {
        title: "New Notification",
        body: event.data.text(),
      };
    }

    try {
      const options = {
        body: payload.body,
        vibrate: [100, 50, 100],
        data: {
          url: payload.data?.url || "/chat",
          conversationId: payload.data?.conversationId
        }
      };

      if (payload.icon) {
        options.icon = payload.icon;
      }

      event.waitUntil(
        self.registration.showNotification(payload.title || "New Message", options)
      );
    } catch (err) {
      console.error("Error displaying push notification:", err);
    }
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/chat";
  const fullUrl = self.location.origin + targetUrl;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // 1. Find any already-open window on this origin
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            // Navigate the existing window to the conversation URL, then focus it
            client.navigate(fullUrl);
            return client.focus();
          }
        }

        // 2. No existing window — open a new one
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});
