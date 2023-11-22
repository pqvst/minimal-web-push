
window.addEventListener('load', () => {
  initServiceWorker();
  updatePrompt();
});

//------------------------------------------------------------------------
// Notification Prompt
//------------------------------------------------------------------------

function updatePrompt() {
  if ('Notification' in window) {
    if (Notification.permission == 'granted' || Notification.permission == 'denied') {
      promptLink.style.display = 'none';
    } else {
      promptLink.style.display = 'block';
    }
  }
}

function onPromptClick() {
  if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      updatePrompt();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        init();
      } else if (permission === 'denied') {
        console.warn('Notification permission denied.');
      }
    });
  }
}

//------------------------------------------------------------------------
// Init Service Worker
//------------------------------------------------------------------------

const vapidPublicKey = VAPID_PUBLIC_KEY;

async function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    const swRegistration = await navigator.serviceWorker.register('sw.js');
    const subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
      console.log('User is already subscribed:', subscription);
      sendSubscriptionToServer(subscription);
    } else {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });
      console.log('User subscribed:', subscription);
      sendSubscriptionToServer(subscription);
    }
  } else {
    console.warn('Service worker is not supported');
  }
}

function sendSubscriptionToServer(subscription) {
  fetch('/subscribe', {
    method: 'post',
    body: JSON.stringify(subscription),
    headers: { 'content-type': 'application/json' }
  });
}
