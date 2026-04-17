import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getToken } from './src/auth';

const BACKEND_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://bienestarapp-backend.onrender.com').replace(/\/api$/, '');
const API_BASE = `${BACKEND_URL}/api`;

export default function MedicinesScreen({ onBack }) {
  const [medicinas, setMedicinas] = useState([]);
  const [nuevaMedicina, setNuevaMedicina] = useState('');
  const [horaMedicina, setHoraMedicina] = useState('');

  const [loading, setLoading] = useState(false);
  const fetchMedicinas = () => {
    setLoading(true);
    getToken().then(token => {
      if (!token) {
        Alert.alert('Sesión', 'No se encontró sesión activa. Vuelve a iniciar sesión.');
        onBack && onBack();
        setLoading(false);
        return;
      }

      fetch(`${API_BASE}/medicines`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          if (res.status === 401) {
            alert('Sesión expirada. Por favor inicia sesión de nuevo.');
            onBack && onBack();
            return [];
          }
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Error ${res.status} al consultar medicinas`);
          }
          return res.json();
        })
        .then(data => setMedicinas(Array.isArray(data) ? data : []))
        .catch((err) => {
          setMedicinas([]);
          Alert.alert('Error', err?.message || 'No se pudieron cargar las medicinas');
        })
        .finally(() => setLoading(false));
    });
  };
  useEffect(fetchMedicinas, []);

  function isValidTime(str) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(str);
  }
  function agregarMedicina() {
    if (!nuevaMedicina || !horaMedicina) return alert('Completa nombre y hora');
    if (!isValidTime(horaMedicina)) return alert('Hora inválida. Usa formato HH:MM');
    setLoading(true);
    getToken().then(token => {
      if (!token) {
        Alert.alert('Sesión', 'No se encontró sesión activa. Vuelve a iniciar sesión.');
        onBack && onBack();
        setLoading(false);
        return;
      }

      fetch(`${API_BASE}/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: nuevaMedicina, time: horaMedicina })
      })
        .then(async res => {
          if (res.status === 401) {
            alert('Sesión expirada. Por favor inicia sesión de nuevo.');
            onBack && onBack();
            return;
          }
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Error ${res.status} al agregar medicina`);
          }
          setNuevaMedicina('');
          setHoraMedicina('');
          Alert.alert('✅ Éxito', 'Medicina agregada correctamente.');
          fetchMedicinas();
        })
        .catch((err) => Alert.alert('Error', err?.message || 'Error al agregar medicina'))
        .finally(() => setLoading(false));
    });
  }

  function marcarTomada(idx) {
    const med = medicinas[idx];
    setLoading(true);
    getToken().then(token => {
      if (!token) {
        Alert.alert('Sesión', 'No se encontró sesión activa. Vuelve a iniciar sesión.');
        onBack && onBack();
        setLoading(false);
        return;
      }

      fetch(`${API_BASE}/medicines/${med.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...med, taken: true })
      })
        .then(async res => {
          if (res.status === 401) {
            alert('Sesión expirada. Por favor inicia sesión de nuevo.');
            onBack && onBack();
            return;
          }
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Error ${res.status} al confirmar medicina`);
          }
          fetchMedicinas();
        })
        .catch((err) => Alert.alert('Error', err?.message || 'Error al confirmar medicina'))
        .finally(() => setLoading(false));
    });
  }

  async function programarNotificacionesMedicinas() {
    if (medicinas.length === 0) {
      Alert.alert('Sin medicinas', 'Agrega al menos una medicina antes de programar notificaciones.');
      return;
    }
    setLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Activa las notificaciones en Ajustes para usar este recordatorio.');
        return;
      }
      await Notifications.cancelAllScheduledNotificationsAsync();
      let programadas = 0;
      for (const med of medicinas) {
        const [hora, minuto] = (med.time || '').split(':').map(Number);
        if (isNaN(hora) || isNaN(minuto)) continue;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `💊 Recordatorio: ${med.name}`,
            body: '¿Ya tomaste tu medicina? Confirma en la app.',
          },
          trigger: {
            hour: hora,
            minute: minuto,
            repeats: true,
          },
        });
        programadas++;
      }
      Alert.alert('✅ Listo', `${programadas} notificacion${programadas !== 1 ? 'es' : ''} de medicina programada${programadas !== 1 ? 's' : ''} diariamente.`);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron programar las notificaciones: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Medicinas</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de medicina"
          value={nuevaMedicina}
          onChangeText={setNuevaMedicina}
        />
        <TextInput
          style={styles.timeInput}
          placeholder="HH:MM"
          value={horaMedicina}
          onChangeText={setHoraMedicina}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
        />
        <TouchableOpacity style={styles.addBtn} onPress={agregarMedicina} disabled={loading}>
          <Text style={styles.addBtnText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={medicinas}
          keyExtractor={(_, i) => i.toString()}
          style={{ flex: 1 }}
          ListEmptyComponent={<Text style={styles.empty}>No hay medicinas registradas</Text>}
          renderItem={({ item, index }) => (
            <View style={styles.medicineRow}>
              <Text style={{ flex: 1, fontSize: 15 }}>💊 {item.name}</Text>
              <Text style={styles.timeLabel}>{item.time}</Text>
              <TouchableOpacity
                style={[styles.confirmBtn, item.taken && styles.confirmBtnDone]}
                onPress={() => !item.taken && marcarTomada(index)}
                disabled={item.taken}
              >
                <Text style={styles.confirmBtnText}>{item.taken ? '✓ Tomada' : 'Confirmar'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.notifBtn} onPress={programarNotificacionesMedicinas} disabled={loading}>
          <Text style={styles.notifBtnText}>🔔 Programar notificación diaria</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', margin: 16, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8, fontSize: 15 },
  timeInput: { width: 70, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8, textAlign: 'center' },
  addBtn: { backgroundColor: '#3b82f6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
  medicineRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: '#f3f4f6', borderRadius: 10, padding: 12 },
  timeLabel: { color: '#6b7280', marginRight: 12, fontSize: 14 },
  confirmBtn: { backgroundColor: '#3b82f6', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  confirmBtnDone: { backgroundColor: '#d1fae5' },
  confirmBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  bottomBar: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, gap: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  notifBtn: { backgroundColor: '#7c3aed', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  notifBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  backBtn: { backgroundColor: '#e5e7eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  backBtnText: { color: '#374151', fontWeight: '600', fontSize: 15 },
});
