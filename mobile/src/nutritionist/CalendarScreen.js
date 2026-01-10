import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import api from '../api'

export default function CalendarScreen({ onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState('')

  const loadAppointments = async () => {
    setError('')
    try {
      setLoading(true)
      const res = await api.get('/nutritionist/appointments')
      const data = Array.isArray(res.data) ? res.data : []
      setAppointments(data)
    } catch (e) {
      setError('No se pudieron cargar las citas')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadAppointments()
    setRefreshing(false)
  }

  const stats = useMemo(() => {
    const base = { total: 0, scheduled: 0, completed: 0, cancelled: 0 }
    return appointments.reduce((acc, a) => {
      acc.total += 1
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    }, base)
  }, [appointments])

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('dashboard')} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Citas</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
        }
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Programadas</Text>
            <Text style={styles.statValue}>{stats.scheduled}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completadas</Text>
            <Text style={styles.statValue}>{stats.completed}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Canceladas</Text>
            <Text style={styles.statValue}>{stats.cancelled}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : appointments.length === 0 ? (
          <Text style={styles.emptyText}>Sin citas</Text>
        ) : (
          appointments
            .slice()
            .sort((a, b) => (a.appointment_date || '').localeCompare(b.appointment_date || ''))
            .map((appt) => (
              <View key={appt.id} style={styles.card}>
                <Text style={styles.cardTitle}>{appt.title || 'Cita'}</Text>
                <Text style={styles.cardMeta}>
                  {appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString('es-ES') : 'Fecha'}
                  {appt.appointment_time ? ` · ${appt.appointment_time}` : ''}
                </Text>
                {appt.patient_name && <Text style={styles.cardMeta}>Paciente: {appt.patient_name}</Text>}
                {appt.status && <Text style={styles.status}>{appt.status}</Text>}
                {appt.description && <Text style={styles.cardMeta}>{appt.description}</Text>}
              </View>
            ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e5e7eb'
  },
  backText: {
    fontSize: 18,
    color: '#0f172a'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827'
  },
  cardMeta: {
    color: '#4b5563',
    marginTop: 4,
    fontSize: 13
  },
  status: {
    marginTop: 6,
    color: '#2563eb',
    fontWeight: '700'
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 8
  },
  emptyText: {
    color: '#6b7280'
  }
})
