import React, { useState } from 'react';
import { View, Text, Switch, Button, StyleSheet, Alert } from 'react-native';
import api from './api';

export default function ActivateNotificationsScreen({ onNavigate, onRefreshProfile, profile }) {
  const [enabled, setEnabled] = useState(profile?.enable_reminders || false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (value) => {
    setEnabled(value);
    setLoading(true);
    try {
      await api.put('/settings', { enable_reminders: value });
      Alert.alert('Éxito', value ? 'Notificaciones activadas' : 'Notificaciones desactivadas');
      if (onRefreshProfile) await onRefreshProfile();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activar Notificaciones</Text>
      <Text style={styles.desc}>Recibe recordatorios para tus comidas y citas importantes.</Text>
      <View style={styles.switchRow}>
        <Text style={styles.label}>Recordatorios</Text>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          disabled={loading}
          trackColor={{ false: '#ccc', true: '#81c784' }}
          thumbColor="#3498db"
        />
      </View>
      <Button title="Volver" onPress={() => onNavigate('dashboard')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  desc: { fontSize: 16, color: '#555', marginBottom: 24, textAlign: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  label: { fontSize: 18, marginRight: 12 },
});
