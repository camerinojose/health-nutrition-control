import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  SafeAreaView,
  Alert,
  FlatList
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from './api';

export default function AppointmentsScreen({ onNavigate }) {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [archivedAppointments, setArchivedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active | archived
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadAppointments();
  }, [selectedMonth]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      // Load active appointments
      const activeUrl = `/appointments?month=${selectedMonth}`;
      const activeResponse = await api.get(activeUrl);
      setAppointments(activeResponse.data || []);
      
      // Load archived appointments
      const archivedUrl = `/appointments?archived=true`;
      const archivedResponse = await api.get(archivedUrl);
      setArchivedAppointments(archivedResponse.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!form.title || !form.appointment_date) {
      Alert.alert('Error', 'Completa los campos requeridos');
      return;
    }

    try {
      await api.post('/appointments', form);
      loadAppointments();
      setShowModal(false);
      setForm({ title: '', description: '', appointment_date: '', appointment_time: '', notes: '' });
      Alert.alert('Éxito', 'Cita creada correctamente');
    } catch (error) {
      console.error('Error creating appointment:', error);
      Alert.alert('Error', 'No se pudo crear la cita');
    }
  };

  const handleDeleteAppointment = async (id) => {
    Alert.alert('Confirmar', '¿Archivar esta cita?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Archivar',
        onPress: async () => {
          try {
            await api.delete(`/appointments/${id}`);
            loadAppointments();
            Alert.alert('Éxito', 'Cita archivada');
          } catch (error) {
            Alert.alert('Error', 'No se pudo archivar la cita');
          }
        }
      }
    ]);
  };

  const handleRestoreAppointment = async (id) => {
    Alert.alert('Confirmar', '¿Restaurar esta cita?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Restaurar',
        onPress: async () => {
          try {
            await api.post(`/appointments/${id}/restore`);
            loadAppointments();
            Alert.alert('Éxito', 'Cita restaurada');
          } catch (error) {
            Alert.alert('Error', 'No se pudo restaurar la cita');
          }
        }
      }
    ]);
  };

  const renderAppointment = ({ item, onDelete }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.appointmentDate}>
        📅 {new Date(item.appointment_date).toLocaleDateString('es-ES')}
      </Text>
      {item.appointment_time && (
        <Text style={styles.appointmentTime}>🕐 {item.appointment_time}</Text>
      )}
      {item.description && (
        <Text style={styles.appointmentDesc}>{item.description}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📅 Citas</Text>
          <View style={{ width: 60 }} />
        </View>
        <ActivityIndicator size="large" color="#3498db" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📅 Mis Citas</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text style={styles.addBtn}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Activas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'archived' && styles.tabActive]}
          onPress={() => setActiveTab('archived')}
        >
          <Text style={[styles.tabText, activeTab === 'archived' && styles.tabTextActive]}>
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'active' ? appointments : archivedAppointments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => renderAppointment({ 
          item, 
          onDelete: activeTab === 'active' ? handleDeleteAppointment : handleRestoreAppointment 
        })}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? '📅 Sin citas programadas' : '📭 Sin citas archivadas'}
            </Text>
            {activeTab === 'active' && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowModal(true)}
              >
                <Text style={styles.addButtonText}>+ Agendar cita</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nueva Cita</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Consulta con nutricionista"
                value={form.title}
                onChangeText={text => setForm({ ...form, title: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={form.appointment_date}
                onChangeText={text => setForm({ ...form, appointment_date: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hora (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={form.appointment_time}
                onChangeText={text => setForm({ ...form, appointment_time: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notas sobre la cita..."
                value={form.description}
                onChangeText={text => setForm({ ...form, description: text })}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateAppointment}>
              <Text style={styles.submitBtnText}>Crear Cita</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    padding: 5,
  },
  backBtnText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    fontSize: 28,
    color: '#3498db',
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#3498db',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deleteBtn: {
    fontSize: 20,
    color: '#e74c3c',
  },
  appointmentDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  appointmentDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeBtn: {
    fontSize: 28,
    color: '#999',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
