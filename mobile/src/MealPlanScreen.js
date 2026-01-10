import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from './api';

export default function MealPlanScreen({ onNavigate }) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState(null);
  const [meals, setMeals] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const mealTypes = ['Desayuno', 'Comida', 'Cena'];

  useEffect(() => {
    loadMealPlan();
    loadFoodLogs();
  }, [selectedDate]);

  const loadMealPlan = async () => {
    try {
      const response = await api.get('/meal-plan');
      setPlan(response.data?.plan ?? null);
      setMeals(Array.isArray(response.data?.meals) ? response.data.meals : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setPlan(null);
        setMeals([]);
        return;
      }
      console.error('Error loading meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFoodLogs = async () => {
    try {
      const selected = new Date(selectedDate);
      const selectedDayIndex = (selected.getDay() + 6) % 7;

      const weekDates = days.map((_, index) => {
        const diff = index - selectedDayIndex;
        const date = new Date(selected);
        date.setDate(selected.getDate() + diff);
        return date.toISOString().split('T')[0];
      });

      const logsMap = {};
      const promises = weekDates.map(date =>
        api.get(`/food-log?date=${date}`)
          .then(response => {
            if (Array.isArray(response.data)) {
              response.data.forEach(log => {
                logsMap[`${log.date}_${log.meal_type}`] = log;
              });
            }
          })
          .catch(error => console.error('Error loading logs:', error))
      );

      await Promise.all(promises);
      setLogs(logsMap);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const toggleMealCompletionForDay = async (day, mealType) => {
    const dateForDay = getDateForDay(day);
    const logKey = `${dateForDay}_${mealType}`;
    const currentLog = logs[logKey];
    const newCompleted = !currentLog?.completed;

    try {
      await api.post('/food-log', {
        date: dateForDay,
        meal_type: mealType,
        completed: newCompleted,
        notes: currentLog?.notes || ''
      });

      loadFoodLogs();
    } catch (error) {
      console.error('Error logging food:', error);
      Alert.alert('Error', 'No se pudo guardar el registro');
    }
  };

  const getMealForDayAndType = (day, type) => {
    const list = Array.isArray(meals) ? meals : [];
    return list.find(m => m.day_of_week === day && m.meal_type === type);
  };

  const getDateForDay = (dayName) => {
    const dayIndex = days.indexOf(dayName);
    const selected = new Date(selectedDate);
    const selectedDayIndex = (selected.getDay() + 6) % 7;
    const diff = dayIndex - selectedDayIndex;
    const targetDate = new Date(selected);
    targetDate.setDate(selected.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  };

  const isCompletedForDay = (day, mealType) => {
    const dateForDay = getDateForDay(day);
    const logKey = `${dateForDay}_${mealType}`;
    return logs[logKey]?.completed || false;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🍽️ Plan de Comidas</Text>
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
        <Text style={styles.title}>🍽️ Mi Plan</Text>
        <View style={{ width: 60 }} />
      </View>

      {plan ? (
        <ScrollView style={styles.content}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDate}>Desde: {plan.start_date}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.weeklyGrid}>
              {days.map(day => (
                <View key={day} style={styles.dayColumn}>
                  <Text style={styles.dayHeader}>{day}</Text>
                  {mealTypes.map(type => {
                    const meal = getMealForDayAndType(day, type);
                    const completed = isCompletedForDay(day, type);

                    return (
                      <View
                        key={`${day}-${type}`}
                        style={[styles.mealCard, completed && styles.mealCardCompleted]}
                      >
                        <View style={styles.mealCardHeader}>
                          <Text style={styles.mealType}>{type}</Text>
                          <TouchableOpacity
                            onPress={() => toggleMealCompletionForDay(day, type)}
                          >
                            <Text style={styles.checkbox}>
                              {completed ? '✓' : '○'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {meal ? (
                          <TouchableOpacity
                            style={styles.mealContent}
                            onPress={() => setSelectedMeal(meal)}
                          >
                            <Text style={styles.mealName}>{meal.name}</Text>
                            <Text style={styles.viewRecipeBtn}>Ver receta</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.noMeal}>-</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          {plan.snacks && (
            <View style={styles.snacksSection}>
              <Text style={styles.snacksTitle}>🍌 Snacks</Text>
              <Text style={styles.snacksText}>{plan.snacks}</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay plan de comidas</Text>
          <Text style={styles.emptySubtext}>Contacta a tu nutricionista</Text>
        </View>
      )}

      {selectedMeal && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedMeal(null)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedMeal(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedMeal.name}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🛒 Ingredientes</Text>
                <Text style={styles.recipeText}>{selectedMeal.ingredients}</Text>
              </View>

              {selectedMeal.preparation && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>👨‍🍳 Preparación</Text>
                  <Text style={styles.recipeText}>{selectedMeal.preparation}</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
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
  planInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planDate: {
    fontSize: 14,
    color: '#666',
  },
  weeklyGrid: {
    flexDirection: 'row',
  },
  dayColumn: {
    marginRight: 10,
    alignItems: 'center',
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    width: 70,
    textAlign: 'center',
  },
  mealCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    width: 70,
  },
  mealCardCompleted: {
    backgroundColor: '#e8f8f5',
    borderColor: '#27ae60',
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  checkbox: {
    fontSize: 16,
    color: '#27ae60',
  },
  mealContent: {
    alignItems: 'center',
  },
  mealName: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  viewRecipeBtn: {
    fontSize: 10,
    color: '#3498db',
    fontWeight: '600',
  },
  noMeal: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  snacksSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  snacksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  snacksText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeBtn: {
    fontSize: 28,
    color: '#999',
  },
  modalContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
