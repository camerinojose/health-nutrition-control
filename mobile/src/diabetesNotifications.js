import * as Notifications from 'expo-notifications';

/**
 * Notificaciones especializadas para manejo de diabetes
 * Incluye recordatorios de comidas, medicinas pre/post comida, y medición de glucosa
 */

/**
 * Programa recordatorios de comidas diarias
 * @param {Object} mealTimes - { breakfast: "08:00", lunch: "14:00", dinner: "20:00" }
 */
export async function scheduleMealReminders(mealTimes) {
  const meals = [
    { key: 'breakfast', name: 'Desayuno', emoji: '🥞', time: mealTimes.breakfast || '08:00' },
    { key: 'lunch', name: 'Comida', emoji: '🍲', time: mealTimes.lunch || '14:00' },
    { key: 'dinner', name: 'Cena', emoji: '🍽️', time: mealTimes.dinner || '20:00' }
  ];

  for (const meal of meals) {
    const [hour, minute] = meal.time.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) continue;

    // Recordatorio de comida
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${meal.emoji} Hora de ${meal.name.toLowerCase()}`,
        body: 'No olvides revisar tu medicina antes de comer',
        sound: true,
        priority: 'high',
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    console.log(`✅ Recordatorio de ${meal.name} programado para ${meal.time}`);
  }
}

/**
 * Programa recordatorios para medir glucosa después de comidas
 * @param {Object} mealTimes - { breakfast: "08:00", lunch: "14:00", dinner: "20:00" }
 * @param {number} hoursAfter - Horas después de comer para medir (default: 2)
 */
export async function scheduleGlucoseReminders(mealTimes, hoursAfter = 2) {
  const meals = [
    { name: 'desayuno', time: mealTimes.breakfast || '08:00' },
    { name: 'comida', time: mealTimes.lunch || '14:00' },
    { name: 'cena', time: mealTimes.dinner || '20:00' }
  ];

  for (const meal of meals) {
    const [hour, minute] = meal.time.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) continue;

    // Calcular hora para medir glucosa (2 horas después)
    let glucoseHour = hour + hoursAfter;
    let glucoseMinute = minute;

    // Ajustar si pasa de 24 horas
    if (glucoseHour >= 24) glucoseHour -= 24;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🩸 Mide tu glucosa',
        body: `Han pasado ${hoursAfter} horas desde ${meal.name}. Registra tu nivel de glucosa.`,
        sound: true,
        priority: 'high',
      },
      trigger: {
        hour: glucoseHour,
        minute: glucoseMinute,
        repeats: true,
      },
    });

    console.log(`✅ Recordatorio de glucosa programado ${hoursAfter}h después de ${meal.name}`);
  }
}

/**
 * Programa recordatorios de medicina ANTES de comidas
 * Útil para insulina rápida o medicinas que se toman antes de comer
 * @param {Object} mealTimes - { breakfast: "08:00", lunch: "14:00", dinner: "20:00" }
 * @param {string} medicineName - Nombre de la medicina (ej: "Insulina rápida")
 * @param {number} minutesBefore - Minutos antes de comer (default: 15)
 */
export async function scheduleMedicineBeforeMeals(mealTimes, medicineName, minutesBefore = 15) {
  const meals = [
    { name: 'Desayuno', time: mealTimes.breakfast || '08:00' },
    { name: 'Comida', time: mealTimes.lunch || '14:00' },
    { name: 'Cena', time: mealTimes.dinner || '20:00' }
  ];

  for (const meal of meals) {
    const [hour, minute] = meal.time.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) continue;

    // Calcular minutos antes
    let remHour = hour;
    let remMinute = minute - minutesBefore;

    // Ajustar si los minutos son negativos
    if (remMinute < 0) {
      remHour -= 1;
      remMinute += 60;
    }
    if (remHour < 0) remHour += 24;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 ${medicineName}`,
        body: `Toma tu medicina ${minutesBefore} minutos antes de ${meal.name.toLowerCase()}`,
        sound: true,
        priority: 'high',
      },
      trigger: {
        hour: remHour,
        minute: remMinute,
        repeats: true,
      },
    });

    console.log(`✅ Recordatorio de ${medicineName} antes de ${meal.name}`);
  }
}

/**
 * Programa recordatorios de actividad física después de comidas
 * @param {Object} mealTimes - { breakfast: "08:00", lunch: "14:00", dinner: "20:00" }
 * @param {number} minutesAfter - Minutos después de comer (default: 30)
 */
export async function scheduleActivityReminders(mealTimes, minutesAfter = 30) {
  const meals = [
    { name: 'desayuno', time: mealTimes.breakfast || '08:00' },
    { name: 'comida', time: mealTimes.lunch || '14:00' },
    { name: 'cena', time: mealTimes.dinner || '20:00' }
  ];

  for (const meal of meals) {
    const [hour, minute] = meal.time.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) continue;

    let actHour = hour;
    let actMinute = minute + minutesAfter;

    // Ajustar si los minutos pasan de 60
    if (actMinute >= 60) {
      actHour += Math.floor(actMinute / 60);
      actMinute = actMinute % 60;
    }
    if (actHour >= 24) actHour -= 24;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚶 Hora de caminar',
        body: 'Camina 10-15 minutos para ayudar a controlar tu glucosa',
        sound: true,
        priority: 'default',
      },
      trigger: {
        hour: actHour,
        minute: actMinute,
        repeats: true,
      },
    });

    console.log(`✅ Recordatorio de actividad ${minutesAfter}min después de ${meal.name}`);
  }
}

/**
 * Configura todas las notificaciones para diabetes en un solo paso
 * @param {Object} config - Configuración completa
 * @param {Object} config.mealTimes - { breakfast, lunch, dinner }
 * @param {string} config.preMealMedicine - Medicina antes de comer (opcional)
 * @param {boolean} config.enableGlucoseReminders - Activar recordatorios de glucosa
 * @param {boolean} config.enableActivityReminders - Activar recordatorios de actividad
 */
export async function setupDiabetesNotifications(config) {
  try {
    const {
      mealTimes = { breakfast: '08:00', lunch: '14:00', dinner: '20:00' },
      preMealMedicine = null,
      enableGlucoseReminders = true,
      enableActivityReminders = true,
    } = config;

    console.log('🩺 Configurando notificaciones para diabetes...');

    // Cancelar notificaciones anteriores
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🧹 Notificaciones anteriores canceladas');

    // Programar recordatorios de comidas
    await scheduleMealReminders(mealTimes);

    // Programar medicina antes de comidas si se especificó
    if (preMealMedicine) {
      await scheduleMedicineBeforeMeals(mealTimes, preMealMedicine, 15);
    }

    // Programar recordatorios de glucosa
    if (enableGlucoseReminders) {
      await scheduleGlucoseReminders(mealTimes, 2);
    }

    // Programar recordatorios de actividad
    if (enableActivityReminders) {
      await scheduleActivityReminders(mealTimes, 30);
    }

    console.log('✅ Todas las notificaciones de diabetes configuradas');
    return true;
  } catch (error) {
    console.error('❌ Error configurando notificaciones de diabetes:', error);
    return false;
  }
}

/**
 * Obtiene horarios de comidas guardados del usuario
 * Busca en configuración o usa valores por defecto
 */
export async function getMealTimesFromSettings() {
  // TODO: Implementar lectura desde backend o AsyncStorage
  // Por ahora retorna valores por defecto
  return {
    breakfast: '08:00',
    lunch: '14:00',
    dinner: '20:00'
  };
}

/**
 * Muestra notificación de prueba inmediata
 */
export async function sendTestDiabetesNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🩺 Notificación de prueba',
      body: 'Sistema de notificaciones para diabetes funcionando correctamente',
      sound: true,
    },
    trigger: null, // Enviar inmediatamente
  });
}
