// Notification utilities
let registration = null;

export const initNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.log('Notificaciones no soportadas en este navegador');
    return false;
  }

  try {
    // Register service worker
    registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[Notifications] Service Worker registrado');
    return true;
  } catch (error) {
    console.error('[Notifications] Error registrando SW:', error);
    return false;
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const showNotification = async (title, options = {}) => {
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.log('[Notifications] Permisos denegados');
    return false;
  }

  if (!registration) {
    await initNotifications();
  }

  const defaultOptions = {
    body: options.body || '',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    vibrate: [200, 100, 200],
    tag: options.tag || 'bienestar-notification',
    requireInteraction: false
  };

  try {
    if (registration) {
      await registration.showNotification(title, { ...defaultOptions, ...options });
    } else {
      new Notification(title, { ...defaultOptions, ...options });
    }
    return true;
  } catch (error) {
    console.error('[Notifications] Error mostrando notificación:', error);
    return false;
  }
};

export const scheduleMealReminders = (mealTimes) => {
  if (!mealTimes) return;

  const checkAndNotify = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (mealTimes.breakfast === currentTime) {
      showNotification('🌅 Hora del Desayuno', {
        body: 'Es momento de tu desayuno saludable',
        tag: 'meal-breakfast'
      });
    }

    if (mealTimes.lunch === currentTime) {
      showNotification('☀️ Hora de la Comida', {
        body: 'Es momento de tu comida del día',
        tag: 'meal-lunch'
      });
    }

    if (mealTimes.dinner === currentTime) {
      showNotification('🌙 Hora de la Cena', {
        body: 'Es momento de tu cena',
        tag: 'meal-dinner'
      });
    }

    if (mealTimes.snack === currentTime) {
      showNotification('🍎 Hora del Snack', {
        body: 'Es momento de tu snack',
        tag: 'meal-snack'
      });
    }
  };

  // Check every minute
  const interval = setInterval(checkAndNotify, 60000);
  
  // Check immediately
  checkAndNotify();

  return () => clearInterval(interval);
};

export const getNotificationStatus = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};
