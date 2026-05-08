import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import HealthProfileForm from './HealthProfileForm';

const HEALTH_PROFILE_STORAGE_KEY = 'bienestar_health_profile_v1';

export default function ProfileScreen({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/health-profile');

      // Backend can return either { profile: null } or a profile object
      if (res?.data && typeof res.data === 'object' && Object.prototype.hasOwnProperty.call(res.data, 'profile')) {
        setProfile(res.data.profile);
      } else {
        setProfile(res.data);
      }

      try {
        if (res?.data) {
          await AsyncStorage.setItem(HEALTH_PROFILE_STORAGE_KEY, JSON.stringify(res.data));
        }
      } catch (_) {
        // ignore
      }
    } catch (e) {
      try {
        const raw = await AsyncStorage.getItem(HEALTH_PROFILE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && Object.prototype.hasOwnProperty.call(parsed, 'profile')) {
            setProfile(parsed.profile);
          } else {
            setProfile(parsed);
          }
        } else {
          setProfile(null);
        }
      } catch (_) {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    setLoading(true);
    try {
      // Create vs update
      if (profile) {
        try {
          await api.put('/health-profile', data);
        } catch (err) {
          // If backend returns 404 because profile doesn't exist yet, fallback to create
          if (err?.response?.status === 404) {
            await api.post('/health-profile', data);
          } else {
            throw err;
          }
        }
      } else {
        try {
          await api.post('/health-profile', data);
        } catch (err) {
          // If it already exists, fallback to update
          if (err?.response?.status === 409) {
            await api.put('/health-profile', data);
          } else {
            throw err;
          }
        }
      }

      const refreshed = await api.get('/health-profile');
      const newProfile = refreshed?.data && typeof refreshed.data === 'object' && Object.prototype.hasOwnProperty.call(refreshed.data, 'profile')
        ? refreshed.data.profile
        : refreshed.data;

      setProfile(newProfile);

      try {
        await AsyncStorage.setItem(HEALTH_PROFILE_STORAGE_KEY, JSON.stringify(refreshed.data));
      } catch (_) {
        // ignore
      }

      setEditing(false);
      Alert.alert('Éxito', 'Perfil guardado correctamente');
    } catch (e) {
      // Offline/local fallback
      setProfile(data);
      try {
        await AsyncStorage.setItem(HEALTH_PROFILE_STORAGE_KEY, JSON.stringify(data));
      } catch (_) {
        // ignore
      }
      setEditing(false);
      Alert.alert('Aviso', 'No se pudo guardar en el servidor. Se guardó localmente en este dispositivo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{marginTop: 40}} />;

  if (editing || !profile) {
    return <HealthProfileForm initialData={profile} onSubmit={handleSave} />;
  }

  return (
    <ScrollView style={{flex: 1}}>
      <View style={styles.container}>
        <Text style={styles.title}>👤 Perfil de Salud</Text>
        
        {/* Herramientas para Diabetes */}
        <View style={styles.diabetesSection}>
          <Text style={styles.sectionTitle}>🩺 Herramientas para Diabetes</Text>
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => onNavigate && onNavigate('medicinas')}
          >
            <Text style={styles.toolIcon}>💊</Text>
            <View style={styles.toolInfo}>
              <Text style={styles.toolTitle}>Medicinas</Text>
              <Text style={styles.toolDescription}>Administra tus medicamentos y programa recordatorios</Text>
            </View>
            <Text style={styles.toolArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => onNavigate && onNavigate('diabetesNotifications')}
          >
            <Text style={styles.toolIcon}>🔔</Text>
            <View style={styles.toolInfo}>
              <Text style={styles.toolTitle}>Notificaciones de Diabetes</Text>
              <Text style={styles.toolDescription}>Configura recordatorios de comidas, glucosa y actividad</Text>
            </View>
            <Text style={styles.toolArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>Información del perfil</Text>
      <Text>Edad: {profile.age}</Text>
      <Text>Sexo: {profile.sex}</Text>
      <Text>Altura: {profile.height} cm</Text>
      <Text>Peso actual: {profile.current_weight} kg</Text>
      <Text>Peso objetivo: {profile.goal_weight} kg</Text>
      <Text>Enfermedades: {profile.medical_conditions}</Text>
      <Text>Medicamentos: {profile.medications}</Text>
      <Text>Alergias: {profile.allergies}</Text>
      <Text>Glucosa en ayunas: {profile.glucose_fasting}</Text>
      <Text>HbA1c: {profile.hba1c}</Text>
      <Text>Colesterol total: {profile.cholesterol_total}</Text>
      <Text>Colesterol LDL: {profile.cholesterol_ldl}</Text>
      <Text>Colesterol HDL: {profile.cholesterol_hdl}</Text>
      <Text>Triglicéridos: {profile.triglycerides}</Text>
      <Text>Nivel de actividad: {profile.activity_level}</Text>
      <Text>Horario de comidas: {profile.meal_schedule}</Text>
      <Text>Horas de sueño: {profile.sleep_hours}</Text>
      <Text>Metas y preferencias: {profile.goals}</Text>
      <Button title="Editar" onPress={() => setEditing(true)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  diabetesSection: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toolIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 13,
    color: '#666',
  },
  toolArrow: {
    fontSize: 24,
    color: '#999',
  },
});
