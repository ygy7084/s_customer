self.addEventListener('push', function(event) {
  var payload = event.data ? event.data.text() : 'no payload';
  event.waitUntil(
    self.registration.showNotification('Mamre', {
      body: payload,
      icon: 'MamreIcon.PNG',
      vibrate: [500, 100, 500],
    }));
});
