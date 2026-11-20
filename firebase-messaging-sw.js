
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

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
  const notificationTitle =
    payload.notification?.title || "SENTINEL";

  const notificationOptions = {
    body: payload.notification?.body || "You have a new update.",
    icon: "icon.svg",
    badge: "icon.svg",
    data: {
      url: payload.data?.url || "./"
    }
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "./",
    self.location.origin
  ).href;

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});
