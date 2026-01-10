import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from './api';

export default function ProgressScreen({ onNavigate }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntries: 0,
    weightChange: 0,
    muscleChange: 0,
    fatChange: 0
  });

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [history]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/history');
      const historyData = Array.isArray(res.data) ? res.data : [];
      const sorted = historyData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setHistory(sorted);
    } catch (err) {
      if (err.response?.status === 404) {
        setHistory([]);
        console.warn('loadHistory: no history yet (404)');
      } else {
        console.error('Error loading history:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (history.length === 0) {
      setStats({ totalEntries: 0, weightChange: 0, muscleChange: 0, fatChange: 0 });
      return;
    }

    const first = history[0];
    const last = history[history.length - 1];

    setStats({
      totalEntries: history.length,
      weightChange: (last.weight - first.weight).toFixed(2),
      muscleChange: (last.muscle_mass - first.muscle_mass).toFixed(2),
      fatChange: (last.body_fat - first.body_fat).toFixed(2)
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📊 Progreso</Text>
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
        <Text style={styles.title}>📊 Mi Progreso</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📈 Sin registros de progreso</Text>
            <Text style={styles.emptySubtext}>Comienza a registrar tus medidas en tu perfil</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Registros</Text>
                <Text style={styles.statValue}>{stats.totalEntries}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Peso</Text>
                <Text style={[styles.statValue, stats.weightChange < 0 && styles.positive]}>
                  {stats.weightChange < 0 ? '-' : '+'}{Math.abs(stats.weightChange)} kg
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Grasa Corporal</Text>
                <Text style={[styles.statValue, stats.fatChange < 0 && styles.positive]}>
                  {stats.fatChange < 0 ? '-' : '+'}{Math.abs(stats.fatChange)}%
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Masa Muscular</Text>
                <Text style={[styles.statValue, stats.muscleChange > 0 && styles.positive]}>
                  {stats.muscleChange > 0 ? '+' : ''}{stats.muscleChange} kg
                </Text>
              </View>
            </View>

            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>📋 Historial</Text>
              {history.slice().reverse().map((entry, idx) => (
                <View key={idx} style={styles.historyCard}>
                  <View style={styles.historyDate}>
                    <Text style={styles.dateText}>{new Date(entry.date).toLocaleDateString('es-ES')}</Text>
                  </View>
                  <View style={styles.historyData}>
                    <View style={styles.dataItem}>
                      <Text style={styles.dataLabel}>Peso</Text>
                      <Text style={styles.dataValue}>{entry.weight} kg</Text>
                    </View>
                    <View style={styles.dataItem}>
                      <Text style={styles.dataLabel}>Grasa</Text>
                      <Text style={styles.dataValue}>{entry.body_fat}%</Text>
                    </View>
                    <View style={styles.dataItem}>
                      <Text style={styles.dataLabel}>Músculo</Text>
                      <Text style={styles.dataValue}>{entry.muscle_mass} kg</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  content: {
    padding: 15,
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
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  positive: {
    color: '#27ae60',
  },
  historySection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDate: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498db',
  },
  historyData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    marginLeft: 10,
  },
  dataItem: {
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
});
