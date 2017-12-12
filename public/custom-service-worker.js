/* eslint-disable */
self.addEventListener('push', function(event) {
  const payload = event.data ? JSON.parse(event.data.text()) : 'no payload';
  let messageStatus = false;
  event.waitUntil(
    self.registration.showNotification('Mamre', {
      body: payload.message,
      icon: 'mamrePushIcon.png',
      badge: 'badge.png',
      vibrate: [500, 500, 500, 500, 500],
    })
      .then(() => {
        messageStatus = true;
        return fetch('/api/order/confirmdelivered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: { _id: payload._id },
          }),
        })
      })
      .catch((e) => {
        if (!messageStatus) {
          return fetch('/api/order/confirmdelivered', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: { error: true },
            }),
          })
        }
        console.error(e);
      })
  );
});
self.addEventListener('notificationclick', function(event) {
  event.waitUntil(
    self.clients.matchAll().then(function(clientList) {
      event.notification.close();
      if (clientList.length) {
        return clientList[0].focus();
      }
      return self.clients.openWindow('/order');
    })
  )
});
