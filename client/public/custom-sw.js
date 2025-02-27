self.addEventListener('push', event => {
    const data = event.data.json()
    //console.log('New notification', data)
    const options = {
        body: data.body,
    }
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    var notification = event.notification;
    var data = notification.data || {};
    var action = event.action;


    if (action === 'close') {
        notification.close();
    }
    else {
        console.debug('Notification actioned');
        //Opens the message page
        clients.openWindow('/messages');
        notification.close();
    }

});

self.addEventListener('notificationclose', function (e) {
    var notification = e.notification;
    var data = notification.data || {};
});
