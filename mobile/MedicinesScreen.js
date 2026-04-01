import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getToken } from './src/auth';

const BACKEND_URL = 'https://health-nutrition-control.onrender.com';

export default function MedicinesScreen({ onBack }) {
  const [medicinas, setMedicinas] = useState([]);
  const [nuevaMedicina, setNuevaMedicina] = useState('');
  const [horaMedicina, setHoraMedicina] = useState('');

  const [loading, setLoading] = useState(false);
  const fetchMedicinas = () => {
    setLoading(true);
    getToken().then(token => {
      fetch(`${BACKEND_URL}/medicines`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          if (res.status === 401) {
            alert('Sesión expirada. Por favor inicia sesión de nuevo.');
            onBack && onBack();
            return [];
          }
          return res.json();
        })
        .then(data => setMedicinas(data))
        .catch(() => setMedicinas([]))
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
      fetch(`${BACKEND_URL}/medicines`, {
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
          setNuevaMedicina('');
          setHoraMedicina('');
          fetchMedicinas();
        })
        .catch(() => alert('Error al agregar medicina'))
        .finally(() => setLoading(false));
    });
  }

  function marcarTomada(idx) {
    const med = medicinas[idx];
    setLoading(true);
    getToken().then(token => {
      fetch(`${BACKEND_URL}/medicines/${med.id}`, {
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
          fetchMedicinas();
        })
        .catch(() => alert('Error al confirmar medicina'))
        .finally(() => setLoading(false));
    });
  }

  async function programarNotificacionesMedicinas() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const med of medicinas) {
      const [hora, minuto] = (med.time || '').split(':').map(Number);
      if (isNaN(hora) || isNaN(minuto)) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Recordatorio de medicina: ${med.name}`,
          body: '¿Ya tomaste tu medicina? Confirma en la app.',
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
    }
    alert('Notificaciones de medicinas programadas');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medicinas</Text>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Nombre" value={nuevaMedicina} onChangeText={setNuevaMedicina} />
        <TextInput style={styles.timeInput} placeholder="HH:MM" value={horaMedicina} onChangeText={setHoraMedicina} />
        <Button title="Agregar" onPress={agregarMedicina} />
      </View>
      {loading ? (
        <Text style={{textAlign:'center', margin:16}}>Cargando...</Text>
      ) : (
        <FlatList
          data={medicinas}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.medicineRow}>
              <Text style={{ flex: 1 }}>{item.name} ({item.time})</Text>
              <Button title={item.taken ? "Tomada" : "Confirmar"} onPress={() => marcarTomada(index)} disabled={item.taken} />
            </View>
          )}
        />
      )}
      <Button title="Programar notificaciones" onPress={programarNotificacionesMedicinas} />
      <Button title="Volver" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  inputRow: { flexDirection: 'row', marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginRight: 8 },
  timeInput: { width: 80, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8 },
  medicineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: '#f3f4f6', borderRadius: 8, padding: 8 },
});
