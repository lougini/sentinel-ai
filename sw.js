
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);


// SENTINEL FIREBASE

firebase.initializeApp({
  apiKey: "AIzaSyAK-UHKbYrhiprRLQyV7sTMgDPUn6NfFC8",
  authDomain: "sentinel-61705.firebaseapp.com",
  projectId: "sentinel-61705",
  storageBucket: "sentinel-61705.firebasestorage.app",
  messagingSenderId: "398524596354",
  appId: "1:398524596354:web:04e6e4ec2d7b23c632749b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const title =
    payload.notification?.title || "SENTINEL";

  const options = {
    body:
      payload.notification?.body || "You have a new update.",
    icon: "./icon.svg",
    badge: "./icon.svg",
    data: {
      url: payload.data?.url || "./"
    }
  };

  self.registration.showNotification(title, options);
});


// NOTIFICATION CLICK

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "./",
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(windowClients => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});


// OFFLINE PWA CACHE

const CACHE_NAME = "sentinel-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(APP_FILES)
    )
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key.startsWith("sentinel-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          });
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);

        if (cached) return cached;

        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return new Response("Offline resource unavailable.", {
          status: 503
        });
      })
  );
});
