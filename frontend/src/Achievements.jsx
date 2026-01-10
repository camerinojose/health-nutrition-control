import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from './api';
import './achievements.css';

const Achievements = () => {
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
    {
      id: 'first_meal',
      title: 'Primera Comida',
      description: 'Completa tu primera comida',
      icon: '🎯',
      requirement: 1,
      field: 'totalMeals',
      color: '#3498db'
    },
    {
      id: 'meal_warrior',
      title: 'Guerrero de la Dieta',
      description: 'Completa 50 comidas',
      icon: '🔥',
      requirement: 50,
      field: 'totalMeals',
      color: '#e74c3c'
    },
    {
      id: 'meal_master',
      title: 'Maestro de la Alimentación',
      description: 'Completa 100 comidas',
      icon: '👑',
      requirement: 100,
      field: 'totalMeals',
      color: '#f39c12'
    },
    {
      id: 'streak_starter',
      title: 'Racha Iniciada',
      description: 'Mantén una racha de 3 días',
      icon: '⚡',
      requirement: 3,
      field: 'longestStreak',
      color: '#9b59b6'
    },
    {
      id: 'streak_champion',
      title: 'Campeón de Rachas',
      description: 'Mantén una racha de 7 días',
      icon: '🌟',
      requirement: 7,
      field: 'longestStreak',
      color: '#16a085'
    },
    {
      id: 'streak_legend',
      title: 'Leyenda Imparable',
      description: 'Mantén una racha de 30 días',
      icon: '💎',
      requirement: 30,
      field: 'longestStreak',
      color: '#2ecc71'
    },
    {
      id: 'weight_tracker',
      title: 'Primer Registro',
      description: 'Registra tu primer peso',
      icon: '⚖️',
      requirement: 1,
      field: 'totalEntries',
      color: '#34495e'
    },
    {
      id: 'weight_warrior',
      title: 'Pierde 5kg',
      description: 'Pierde 5 kilogramos',
      icon: '💪',
      requirement: 5,
      field: 'weightLost',
      color: '#27ae60'
    },
    {
      id: 'weight_champion',
      title: 'Pierde 10kg',
      description: 'Pierde 10 kilogramos',
      icon: '🏆',
      requirement: 10,
      field: 'weightLost',
      color: '#f1c40f'
    },
    {
      id: 'appointment_keeper',
      title: 'Puntual',
      description: 'Completa 5 citas',
      icon: '📅',
      requirement: 5,
      field: 'appointmentsCompleted',
      color: '#e67e22'
    },
    {
      id: 'dedication',
      title: 'Dedicación Total',
      description: 'Registra datos durante 10 semanas',
      icon: '🎖️',
      requirement: 10,
      field: 'totalEntries',
      color: '#c0392b'
    },
    {
      id: 'health_hero',
      title: 'Héroe de la Salud',
      description: 'Desbloquea todos los logros',
      icon: '🦸',
      requirement: 11,
      field: 'unlockedCount',
      color: '#8e44ad'
    }
  ];

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    calculateUnlockedBadges();
  }, [stats]);

  const loadStats = async () => {
    try {
      // Load food logs for meal count and streaks
      const foodLogsRes = await api.get('/food-log');
      const foodLogs = foodLogsRes.data;

      // Calculate total meals
      const totalMeals = foodLogs.length;

      // Calculate streaks
      const streaks = calculateStreaks(foodLogs);

      // Load history for weight tracking
      const historyRes = await api.get('/history');
      const history = historyRes.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const weightLost = history.length >= 2 
        ? Math.max(0, history[0].weight - history[history.length - 1].weight)
        : 0;

      // Load appointments
      const appointmentsRes = await api.get('/appointments');
      const appointments = appointmentsRes.data;
      const appointmentsCompleted = appointments.filter(a => a.status === 'completed').length;

      setStats({
        totalMeals,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        weightLost: weightLost,
        totalEntries: history.length,
        appointmentsCompleted
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreaks = (logs) => {
    if (logs.length === 0) return { current: 0, longest: 0 };

    // Group logs by date
    const dateMap = {};
    logs.forEach(log => {
      const date = log.date.split('T')[0];
      dateMap[date] = true;
    });

    const dates = Object.keys(dateMap).sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (from today backwards)
    const today = new Date().toISOString().split('T')[0];
    if (dateMap[today]) {
      currentStreak = 1;
      let checkDate = new Date(today);
      
      for (let i = 1; i < dates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (dateMap[checkDateStr]) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { current: currentStreak, longest: longestStreak };
  };

  const calculateUnlockedBadges = () => {
    const unlocked = badges.filter(badge => {
      if (badge.field === 'unlockedCount') {
        return false; // Calculate this separately
      }
      return stats[badge.field] >= badge.requirement;
    });

    // Check if all other badges are unlocked
    if (unlocked.length >= badges.length - 1) {
      const heroBadge = badges.find(b => b.id === 'health_hero');
      if (heroBadge && !unlocked.find(b => b.id === 'health_hero')) {
        unlocked.push(heroBadge);
      }
    }

    setUnlockedBadges(unlocked);
  };

  const getBadgeProgress = (badge) => {
    if (badge.field === 'unlockedCount') {
      return (unlockedBadges.length / (badges.length - 1)) * 100;
    }
    const progress = (stats[badge.field] / badge.requirement) * 100;
    return Math.min(progress, 100);
  };

  const isBadgeUnlocked = (badge) => {
    return unlockedBadges.some(b => b.id === badge.id);
  };

  if (loading) {
    return (
      <div className="achievements-container">
        <h2>🏆 {t('achievements') || 'Logros'}</h2>
        <p>Cargando logros...</p>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      <h2>🏆 {t('achievements') || 'Logros'}</h2>

      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-icon">🎯</div>
          <div className="summary-content">
            <span className="summary-value">{stats.totalMeals}</span>
            <span className="summary-label">Comidas Completadas</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">⚡</div>
          <div className="summary-content">
            <span className="summary-value">{stats.currentStreak}</span>
            <span className="summary-label">Racha Actual (días)</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">🌟</div>
          <div className="summary-content">
            <span className="summary-value">{stats.longestStreak}</span>
            <span className="summary-label">Racha Más Larga</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">💪</div>
          <div className="summary-content">
            <span className="summary-value">{stats.weightLost.toFixed(1)} kg</span>
            <span className="summary-label">Peso Perdido</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">🏅</div>
          <div className="summary-content">
            <span className="summary-value">{unlockedBadges.length}/{badges.length}</span>
            <span className="summary-label">Logros Desbloqueados</span>
          </div>
        </div>
      </div>

      <div className="badges-grid">
        {badges.map(badge => {
          const unlocked = isBadgeUnlocked(badge);
          const progress = getBadgeProgress(badge);
          
          return (
            <div 
              key={badge.id} 
              className={`badge-card ${unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="badge-icon" style={{ backgroundColor: unlocked ? badge.color : '#bdc3c7' }}>
                {badge.icon}
              </div>
              <div className="badge-content">
                <h3 className="badge-title">{badge.title}</h3>
                <p className="badge-description">{badge.description}</p>
                {!unlocked && (
                  <div className="badge-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: badge.color
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {badge.field === 'unlockedCount' 
                        ? `${unlockedBadges.length}/${badges.length - 1}`
                        : `${stats[badge.field]}/${badge.requirement}`
                      }
                    </span>
                  </div>
                )}
                {unlocked && (
                  <div className="badge-unlocked">
                    ✓ Desbloqueado
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
