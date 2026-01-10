import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from './api';

export default function NutritionistSelectionScreen({ onNavigate, onAssigned }) {
  const { t } = useTranslation();
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadNutritionists();
  }, []);

  const loadNutritionists = async () => {
    try {
      const res = await api.get('/nutritionists');
      const data = Array.isArray(res.data) ? res.data : [];
      setNutritionists(data);
    } catch (err) {
      console.error('Error loading nutritionists:', err);
      Alert.alert('Error', 'No pudimos cargar la lista de nutriólogos');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedId) {
      Alert.alert('Selecciona un nutriólogo', 'Debes elegir un nutriólogo');
      return;
    }

    setAssigning(true);
    try {
      const res = await api.post('/assign-nutritionist', { nutritionist_id: selectedId });
      console.log('[NutritionistSelection] Assign response:', res.data);
      Alert.alert('¡Éxito!', 'Nutriólogo asignado correctamente');
      
      // Refresh profile to get the new nutritionist data
      if (onAssigned) {
        await onAssigned();
      }
      
      // Small delay to ensure profile is updated before navigating
      setTimeout(() => {
        onNavigate('dashboard');
      }, 500);
    } catch (err) {
      console.error('Error assigning nutritionist:', err);
      Alert.alert('Error', 'No pudimos asignar el nutriólogo');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👨‍⚕️ Elige tu Nutriólogo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Selecciona un nutriólogo para que te acompañe en tu viaje de bienestar
        </Text>

        {nutritionists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay nutriólogos disponibles</Text>
          </View>
        ) : (
          <FlatList
            data={nutritionists}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.nutritionistCard,
                  selectedId === item.id && styles.nutritionistCardSelected,
                ]}
                onPress={() => setSelectedId(item.id)}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.nutritionistName}>{item.name}</Text>
                  <Text style={styles.nutritionistEmail}>{item.email}</Text>
                </View>
                {selectedId === item.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity
          style={[styles.assignButton, assigning && styles.assignButtonDisabled]}
          onPress={handleAssign}
          disabled={assigning || !selectedId}
        >
          <Text style={styles.assignButtonText}>
            {assigning ? 'Asignando...' : 'Asignar Nutriólogo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={() => onNavigate('dashboard')}>
          <Text style={styles.skipButtonText}>Saltar por ahora</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  nutritionistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  nutritionistCardSelected: {
    borderColor: '#3498db',
    backgroundColor: '#e8f4fd',
  },
  cardContent: {
    flex: 1,
  },
  nutritionistName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  nutritionistEmail: {
    fontSize: 13,
    color: '#475569',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  assignButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  assignButtonDisabled: {
    backgroundColor: '#ccc',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  skipButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
});
