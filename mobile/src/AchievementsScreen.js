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

export default function AchievementsScreen({ onNavigate }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalMeals: 0,
    currentStreak: 0,
    longestStreak: 0,
    weightLost: 0,
    totalEntries: 0,
    appointmentsCompleted: 0
  });
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const badges = [
    { id: 'first_meal', title: 'Primera Comida', icon: '🎯', requirement: 1, field: 'totalMeals' },
    { id: 'meal_warrior', title: 'Guerrero de la Dieta', icon: '🔥', requirement: 50, field: 'totalMeals' },
    { id: 'meal_master', title: 'Maestro de la Alimentación', icon: '👑', requirement: 100, field: 'totalMeals' },
    { id: 'streak_starter', title: 'Racha Iniciada', icon: '⚡', requirement: 3, field: 'longestStreak' },
    { id: 'streak_champion', title: 'Campeón de Rachas', icon: '🌟', requirement: 7, field: 'longestStreak' },
    { id: 'weight_warrior', title: 'Pierde 5kg', icon: '💪', requirement: 5, field: 'weightLost' },
    { id: 'weight_champion', title: 'Pierde 10kg', icon: '🏆', requirement: 10, field: 'weightLost' },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    calculateUnlockedBadges();
  }, [stats]);

  const loadStats = async () => {
    try {
      const [foodLogsRes, historyRes] = await Promise.all([
        api.get('/food-log'),
        api.get('/history')
      ]);

      const foodLogs = foodLogsRes.data || [];
      const history = Array.isArray(historyRes.data) ? historyRes.data : [];

      const totalMeals = foodLogs.filter(log => log.completed).length;
      const totalEntries = history.length;

      let weightLost = 0;
      if (history.length > 0) {
        const first = history[0];
        const last = history[history.length - 1];
        weightLost = Math.max(0, first.weight - last.weight);
      }

      setStats({
        totalMeals,
        currentStreak: 0,
        longestStreak: 7, // Placeholder
        weightLost: Math.round(weightLost * 10) / 10,
        totalEntries,
        appointmentsCompleted: 0
      });
    } catch (err) {
      if (err.response?.status === 404) {
        console.warn('loadStats: no history yet (404)');
        setStats({
          totalMeals: 0,
          currentStreak: 0,
          longestStreak: 0,
          weightLost: 0,
          totalEntries: 0,
          appointmentsCompleted: 0
        });
        setUnlockedBadges([]);
      } else {
        console.error('Error loading stats:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateUnlockedBadges = () => {
    const unlocked = badges.filter(badge => {
      const value = stats[badge.field] || 0;
      return value >= badge.requirement;
    });
    setUnlockedBadges(unlocked);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏆 Logros</Text>
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
        <Text style={styles.title}>🏆 Mis Logros</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalMeals}</Text>
            <Text style={styles.statName}>Comidas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.longestStreak}</Text>
            <Text style={styles.statName}>Racha</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.weightLost}kg</Text>
            <Text style={styles.statName}>Perdidos</Text>
          </View>
        </View>

        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>🎖️ Tus Logros ({unlockedBadges.length}/{badges.length})</Text>

          <View style={styles.badgesGrid}>
            {badges.map(badge => {
              const isUnlocked = unlockedBadges.some(b => b.id === badge.id);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, !isUnlocked && styles.badgeCardLocked]}
                >
                  <Text style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLocked]}>
                    {isUnlocked ? badge.icon : '🔒'}
                  </Text>
                  <Text style={[styles.badgeTitle, !isUnlocked && styles.badgeTitleLocked]}>
                    {badge.title}
                  </Text>
                  <Text style={[styles.badgeRequirement, !isUnlocked && styles.badgeRequirementLocked]}>
                    {badge.requirement}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
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
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statName: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  badgesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f1c40f',
  },
  badgeCardLocked: {
    borderColor: '#ddd',
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  badgeIconLocked: {
    fontSize: 28,
    opacity: 0.3,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  badgeTitleLocked: {
    color: '#999',
  },
  badgeRequirement: {
    fontSize: 10,
    color: '#666',
    marginTop: 3,
  },
  badgeRequirementLocked: {
    color: '#bbb',
  },
});
