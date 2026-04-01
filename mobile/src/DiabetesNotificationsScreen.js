import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Switch, ScrollView, Alert } from 'react-native';
import { setupDiabetesNotifications, sendTestDiabetesNotification } from './diabetesNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Pantalla para configurar notificaciones específicas para diabetes
 * Permite configurar horarios de comidas, recordatorios de glucosa y actividad
 */
export default function DiabetesNotificationsScreen({ onBack }) {
  // Horarios de comidas
  const [breakfastTime, setBreakfastTime] = useState('08:00');
  const [lunchTime, setLunchTime] = useState('14:00');
  const [dinnerTime, setDinnerTime] = useState('20:00');

  // Medicina antes de comidas
  const [preMealMedicine, setPreMealMedicine] = useState('');

  // Switches para activar/desactivar recordatorios
  const [glucoseReminders, setGlucoseReminders] = useState(true);
  const [activityReminders, setActivityReminders] = useState(true);

  const [loading, setLoading] = useState(false);

  // Cargar configuración guardada
  useEffect(() => {
    loadSavedConfig();
  }, []);

  async function loadSavedConfig() {
    try {
      const config = await AsyncStorage.getItem('diabetesNotificationConfig');
      if (config) {
        const parsed = JSON.parse(config);
        setBreakfastTime(parsed.mealTimes?.breakfast || '08:00');
        setLunchTime(parsed.mealTimes?.lunch || '14:00');
        setDinnerTime(parsed.mealTimes?.dinner || '20:00');
        setPreMealMedicine(parsed.preMealMedicine || '');
        setGlucoseReminders(parsed.enableGlucoseReminders !== false);
        setActivityReminders(parsed.enableActivityReminders !== false);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  }

  async function saveAndSetupNotifications() {
    // Validar formato de horas
    if (!isValidTime(breakfastTime) || !isValidTime(lunchTime) || !isValidTime(dinnerTime)) {
      Alert.alert('Error', 'Por favor ingresa horas válidas en formato HH:MM (ejemplo: 08:00)');
      return;
    }

    setLoading(true);

    const config = {
      mealTimes: {
        breakfast: breakfastTime,
        lunch: lunchTime,
        dinner: dinnerTime,
      },
      preMealMedicine: preMealMedicine || null,
      enableGlucoseReminders: glucoseReminders,
      enableActivityReminders: activityReminders,
    };

    try {
      // Guardar configuración
      await AsyncStorage.setItem('diabetesNotificationConfig', JSON.stringify(config));

      // Configurar notificaciones
      const success = await setupDiabetesNotifications(config);

      if (success) {
        Alert.alert(
          '✅ Notificaciones configuradas',
          'Recibirás recordatorios de:\n' +
          `• Comidas (${breakfastTime}, ${lunchTime}, ${dinnerTime})\n` +
          (preMealMedicine ? `• ${preMealMedicine} antes de comidas\n` : '') +
          (glucoseReminders ? '• Medición de glucosa (2h después de comidas)\n' : '') +
          (activityReminders ? '• Actividad física (30min después de comidas)' : '')
        );
      } else {
        Alert.alert('Error', 'Hubo un problema al configurar las notificaciones');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setLoading(false);
    }
  }

  function isValidTime(time) {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  }

  async function testNotification() {
    await sendTestDiabetesNotification();
    Alert.alert('✓ Notificación enviada', 'Si viste la notificación, todo está funcionando correctamente');
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🩺 Configuración para Diabetes</Text>
      <Text style={styles.subtitle}>Programa tus recordatorios diarios</Text>

      {/* Horarios de comidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍽️ Horarios de comidas</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🥞 Desayuno:</Text>
          <TextInput
            style={styles.timeInput}
            value={breakfastTime}
            onChangeText={setBreakfastTime}
            placeholder="08:00"
            maxLength={5}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🍲 Comida:</Text>
          <TextInput
            style={styles.timeInput}
            value={lunchTime}
            onChangeText={setLunchTime}
            placeholder="14:00"
            maxLength={5}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🍽️ Cena:</Text>
          <TextInput
            style={styles.timeInput}
            value={dinnerTime}
            onChangeText={setDinnerTime}
            placeholder="20:00"
            maxLength={5}
          />
        </View>
      </View>

      {/* Medicina antes de comidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💊 Medicina pre-comida (opcional)</Text>
        <Text style={styles.helper}>
          Si tomas insulina rápida o alguna medicina antes de comer, escribe el nombre aquí.
          Se te recordará 15 minutos antes de cada comida.
        </Text>
        <TextInput
          style={styles.input}
          value={preMealMedicine}
          onChangeText={setPreMealMedicine}
          placeholder="Ejemplo: Insulina rápida"
        />
      </View>

      {/* Recordatorios adicionales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Recordatorios adicionales</Text>

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>🩸 Medición de glucosa</Text>
            <Text style={styles.switchHelper}>
              2 horas después de cada comida
            </Text>
          </View>
          <Switch
            value={glucoseReminders}
            onValueChange={setGlucoseReminders}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>🚶 Actividad física</Text>
            <Text style={styles.switchHelper}>
              30 minutos después de cada comida
            </Text>
          </View>
          <Switch
            value={activityReminders}
            onValueChange={setActivityReminders}
          />
        </View>
      </View>

      {/* Botones */}
      <View style={styles.buttonGroup}>
        <Button
          title={loading ? "Guardando..." : "💾 Guardar y activar notificaciones"}
          onPress={saveAndSetupNotifications}
          disabled={loading}
        />
      </View>

      <View style={styles.buttonGroup}>
        <Button
          title="🧪 Probar notificación"
          onPress={testNotification}
          color="#6c757d"
        />
      </View>

      <View style={styles.buttonGroup}>
        <Button title="← Volver" onPress={onBack} color="#28a745" />
      </View>

      {/* Info adicional */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Importante:</Text>
        <Text style={styles.infoText}>
          • Las notificaciones se repiten todos los días{'\n'}
          • Puedes modificar los horarios cuando quieras{'\n'}
          • Las medicinas específicas se configuran en "Perfil de Salud → Medicinas"{'\n'}
          • Asegúrate de tener permisos de notificaciones activados
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    width: 120,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helper: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchHelper: {
    fontSize: 13,
    color: '#666',
  },
  buttonGroup: {
    marginBottom: 12,
  },
  infoBox: {
    marginTop: 24,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
