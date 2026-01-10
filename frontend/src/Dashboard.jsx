import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from './api';
import './dashboard.css';

export default function Dashboard({ profile }) {
  const { t } = useTranslation();
  const [mealPlan, setMealPlan] = useState(null);
  const [foodLog, setFoodLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Tomar agua (8 vasos)', completed: false },
    { id: 2, text: 'Ejercicio 30 minutos', completed: false },
    { id: 3, text: 'Registrar comidas', completed: false },
  ]);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [mealRes, foodRes] = await Promise.all([
        api.get('/meal-plan'),
        api.get(`/food-log?date=${today}`)
      ]);
      setMealPlan(mealRes.data);
      setFoodLog(foodRes.data || []);
    } catch (err) {
      console.error('Error loading today data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleMealCompletion = async (mealType) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentLog = foodLog.find(log => log.meal_type === mealType && log.date === today);
      const newCompleted = !currentLog?.completed;

      await api.post('/food-log', {
        date: today,
        meal_type: mealType,
        completed: newCompleted,
        notes: currentLog?.notes || ''
      });

      // Reload food log to update UI
      const foodRes = await api.get(`/food-log?date=${today}`);
      setFoodLog(foodRes.data || []);
    } catch (error) {
      console.error('Error toggling meal:', error);
    }
  };

  const isMealCompleted = (mealType) => {
    const today = new Date().toISOString().split('T')[0];
    return foodLog.some(log => log.meal_type === mealType && log.completed && log.date === today);
  };

  const getTodayMeals = () => {
    if (!mealPlan || !mealPlan.meals) {
      return null;
    }
    
    const today = new Date().getDay(); // 0 = Sunday
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const todayName = daysOfWeek[today];
    
    // Filter meals for today
    const todayMealsList = mealPlan.meals.filter(meal => meal.day_of_week === todayName);
    
    if (todayMealsList.length === 0) return null;
    
    // Group meals by type with full meal objects
    const grouped = {
      breakfast: todayMealsList.filter(m => m.meal_type === 'Desayuno'),
      lunch: todayMealsList.filter(m => m.meal_type === 'Comida'),
      dinner: todayMealsList.filter(m => m.meal_type === 'Cena'),
      snacks: todayMealsList.filter(m => m.meal_type === 'Snack' || m.meal_type === 'Colación')
    };
    
    return grouped;
  };

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
  };

  const closeMealDetail = () => {
    setSelectedMeal(null);
  };

  const todayMeals = getTodayMeals();
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskProgress = (completedTasks / tasks.length) * 100;

  if (loading) {
    return <div className="dashboard-loading">{t('loading')}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>👋 {t('welcome')}, {profile.name}!</h2>
        <p className="dashboard-date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="dashboard-grid">
        {/* Tasks Section */}
        <div className="dashboard-card tasks-card">
          <div className="card-header">
            <h3>✅ {t('todayTasks')}</h3>
            <span className="progress-badge">{completedTasks}/{tasks.length}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${taskProgress}%` }}></div>
          </div>
          <ul className="tasks-list">
            {tasks.map(task => (
              <li key={task.id} className={task.completed ? 'completed' : ''}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span>{task.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Today's Meals Section */}
        <div className="dashboard-card meals-card">
          <div className="card-header">
            <h3>🍽️ {t('todayMeals')}</h3>
          </div>
          {todayMeals ? (
            <div className="meals-list">
              {todayMeals.breakfast && todayMeals.breakfast.length > 0 && (
                <div className="meal-item-wrapper">
                  <div 
                    className={`meal-check-circle ${isMealCompleted('Desayuno') ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleMealCompletion('Desayuno'); }}
                  >
                    <span className="check-icon">✓</span>
                  </div>
                  <div className="meal-item" onClick={() => handleMealClick(todayMeals.breakfast[0])} style={{cursor: 'pointer', flex: 1}}>
                    <span className="meal-icon">🌅</span>
                    <div>
                      <strong>{t('breakfast') || 'Desayuno'}</strong>
                      <p>{todayMeals.breakfast.map(m => m.name).join(', ')}</p>
                    </div>
                    <span className="view-arrow">→</span>
                  </div>
                </div>
              )}
              {todayMeals.lunch && todayMeals.lunch.length > 0 && (
                <div className="meal-item-wrapper">
                  <div 
                    className={`meal-check-circle ${isMealCompleted('Comida') ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleMealCompletion('Comida'); }}
                  >
                    <span className="check-icon">✓</span>
                  </div>
                  <div className="meal-item" onClick={() => handleMealClick(todayMeals.lunch[0])} style={{cursor: 'pointer', flex: 1}}>
                    <span className="meal-icon">☀️</span>
                    <div>
                      <strong>{t('lunch') || 'Comida'}</strong>
                      <p>{todayMeals.lunch.map(m => m.name).join(', ')}</p>
                    </div>
                    <span className="view-arrow">→</span>
                  </div>
                </div>
              )}
              {todayMeals.dinner && todayMeals.dinner.length > 0 && (
                <div className="meal-item-wrapper">
                  <div 
                    className={`meal-check-circle ${isMealCompleted('Cena') ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleMealCompletion('Cena'); }}
                  >
                    <span className="check-icon">✓</span>
                  </div>
                  <div className="meal-item" onClick={() => handleMealClick(todayMeals.dinner[0])} style={{cursor: 'pointer', flex: 1}}>
                    <span className="meal-icon">🌙</span>
                    <div>
                      <strong>{t('dinner') || 'Cena'}</strong>
                      <p>{todayMeals.dinner.map(m => m.name).join(', ')}</p>
                    </div>
                    <span className="view-arrow">→</span>
                  </div>
                </div>
              )}
              {todayMeals.snacks && todayMeals.snacks.length > 0 && (
                <div className="meal-item-wrapper">
                  <div 
                    className={`meal-check-circle ${isMealCompleted('Snack') ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleMealCompletion('Snack'); }}
                  >
                    <span className="check-icon">✓</span>
                  </div>
                  <div className="meal-item" onClick={() => handleMealClick(todayMeals.snacks[0])} style={{cursor: 'pointer', flex: 1}}>
                    <span className="meal-icon">🍎</span>
                    <div>
                      <strong>{t('snacks')}</strong>
                      <ul className="snacks-list">
                        {todayMeals.snacks.map((snack, i) => (
                          <li key={i}>{snack.name}</li>
                        ))}
                      </ul>
                    </div>
                    <span className="view-arrow">→</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">{t('noPlanMessage')}</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="dashboard-card stats-card">
          <div className="card-header">
            <h3>📊 {t('quickStats')}</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <div>
                <p className="stat-label">{t('streak')}</p>
                <p className="stat-value">7 {t('days')}</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📝</span>
              <div>
                <p className="stat-label">{t('mealsLogged')}</p>
                <p className="stat-value">{foodLog.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <div className="meal-modal-overlay" onClick={closeMealDetail}>
          <div className="meal-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMealDetail}>✕</button>
            <h2>🍽️ {selectedMeal.name}</h2>
            
            {selectedMeal.description && (
              <div className="meal-section">
                <h3>📝 Descripción</h3>
                <p>{selectedMeal.description}</p>
              </div>
            )}
            
            {selectedMeal.ingredients && (
              <div className="meal-section">
                <h3>🥗 Ingredientes</h3>
                <p style={{whiteSpace: 'pre-line'}}>{selectedMeal.ingredients}</p>
              </div>
            )}
            
            {selectedMeal.preparation && (
              <div className="meal-section">
                <h3>👨‍🍳 Preparación</h3>
                <p style={{whiteSpace: 'pre-line'}}>{selectedMeal.preparation}</p>
              </div>
            )}
            
            {selectedMeal.calories && (
              <div className="meal-section">
                <h3>📊 Información Nutricional</h3>
                <div className="nutrition-info">
                  <span>🔥 Calorías: {selectedMeal.calories}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
