// Sri Ramu Digital Service Worker for Web Push & Offline Support
const CACHE_NAME = 'sri-ramu-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push Event: Triggered when Web Push arrives from Backend VAPID
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Sri Ramu Digital', body: event.data.text() };
    }
  }

  const title = data.title || 'Sri Ramu Digital — Print Update';
  const options = {
    body: data.body || 'You have a new update regarding your printing order.',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      { action: 'open_url', title: 'View Details' },
      { action: 'dismiss', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
