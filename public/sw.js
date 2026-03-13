// Off-Market Push Notification Service Worker

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    var payload = event.data.json();

    var options = {
      body: payload.body || "",
      icon: "/logo.png",
      badge: "/logo.png",
      tag: payload.tag || "off-market",
      data: {
        url: payload.url || "/",
      },
      actions: payload.actions || [],
      vibrate: [200, 100, 200],
      requireInteraction: payload.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(
        payload.title || "Off Market",
        options,
      ),
    );
  } catch (e) {
    var text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Off Market", {
        body: text,
        icon: "/logo.png",
      }),
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  var url =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (
            client.url.indexOf(self.location.origin) !== -1 &&
            "focus" in client
          ) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
