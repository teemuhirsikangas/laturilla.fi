const requestNotificationPermission = async () => {

  if ('Notification' in window) {
      const permission = await window.Notification.requestPermission();
      // value of permission can be 'granted', 'default', 'denied'
      // granted: user has accepted the request
      // default: user has dismissed the notification permission popup by clicking on x
      // denied: user has denied the request.
      if (permission !== "granted") {
        return false;
      } else {
        // Push granted
        return true;
      }
    } 
    //safari does not support Notifications
    return false;
  };

function isSupportWebPushNotifications() {
  if ('Notification' in window) {
    return true;
  }
  return false;
}

function isNotificationsGranted () {
    if ('Notification' in window) {
      if (Notification.permission !== "granted") {
          return false;
        } else {
          return true;
        }
      }
      //safari does not support notifications
      return false;
}

  //Get the subscription object from browser
  const getRegistrationsFromBrowser = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
  
        // Handle such cases by checking the result of serviceWorkerRegistration.pushManager.getSubscription() periodically (e.g. on page load) 
        // and synchronizing it with the server. You may also wish to re-subscribe automatically if you no longer have a subscription
        // and Notification.permission == 'granted'.
        const sub = await reg.pushManager.getSubscription();
          
        if (sub === null) {
            // Update UI to ask user to register for Push
            return null;
        } else {
            // We have a subscription, update the database
           
            const userAgent = window.navigator.userAgent;
            const platform = window.navigator.platform;

            const subsData = {
                subscription: sub,
                platform,
                userAgent
              };
    
             return subsData;
         }
  
        } catch(err) {
        console.log('Service Worker registration failed: ', err);
      }
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  const vapidKeys = {
    publicKey: process.env.REACT_APP_PUBLIC_VAPID_KEY
  };

  const convertedVapidKey = urlBase64ToUint8Array(vapidKeys.publicKey);

  const subscribeUser = async () => {

    if ('serviceWorker' in navigator) {
        try {
        const reg = await navigator.serviceWorker.ready;
        //code will wait for here until user gives access from requestNotificationPermission
        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });
          
        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;

        const subsData = {
            subscription,
            platform,
            userAgent
        };

         return subsData;
  
        } catch(e) {
          if ('Notification' in window) {
            if (Notification.permission === 'denied') {
              console.warn('Permission for notifications was "denied", cannot subscribe');
            } else {
              console.error('Unable to subscribe to push', e);
            }
          }
          return null;
        }
    }
};

export {
    requestNotificationPermission,
    isNotificationsGranted,
    getRegistrationsFromBrowser,
    subscribeUser,
    isSupportWebPushNotifications
};