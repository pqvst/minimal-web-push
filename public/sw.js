
//------------------------------------------------------------------------
// Notification Callback
//------------------------------------------------------------------------

self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/apple-touch-icon.png',
    badge: '/badge.png',
  };
  event.waitUntil(self.registration.showNotification('My App', options));
});

//------------------------------------------------------------------------
// Clickable Notifications
//------------------------------------------------------------------------

const targetUrl = 'http://localhost:3000';

self.addEventListener('notificationclick', (event) => {
  self.console.log('notificationclick');
  event.notification.close(); // Android needs explicit close.
  event.waitUntil(
    clients.matchAll({type: 'window'}).then( windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // If so, just focus it.
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
