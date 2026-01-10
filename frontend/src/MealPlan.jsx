import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from './api';
import './mealplan.css';

const MealPlan = () => {
  const { t } = useTranslation();
  const [plan, setPlan] = useState(null);
  const [meals, setMeals] = useState([]);
  const [logs, setLogs] = useState({});
  const [uploading, setUploading] = useState(false);
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
      // If no plan exists yet, backend returns 404; treat as empty state instead of erroring
      if (error.response?.status === 404) {
        setPlan(null);
        setMeals([]);
        return;
      }
      console.error('Error loading meal plan:', error);
    }
  };

  const loadFoodLogs = async () => {
    try {
      // Load logs for the entire week
      const selected = new Date(selectedDate);
      const selectedDayIndex = (selected.getDay() + 6) % 7; // 0=Lunes, 6=Domingo
      
      // Get all dates for the week
      const weekDates = days.map((_, index) => {
        const diff = index - selectedDayIndex;
        const date = new Date(selected);
        date.setDate(selected.getDate() + diff);
        return date.toISOString().split('T')[0];
      });

      // Fetch logs for all dates
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
          .catch(error => console.error('Error loading logs for', date, error))
      );

      await Promise.all(promises);
      setLogs(logsMap);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      await api.post('/meal-plan/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(t('mealPlanUploaded'));
      loadMealPlan();
    } catch (error) {
      alert(t('uploadError'));
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const toggleMealCompletion = async (mealType) => {
    const logKey = `${selectedDate}_${mealType}`;
    const currentLog = logs[logKey];
    const newCompleted = !currentLog?.completed;

    try {
      await api.post('/food-log', {
        date: selectedDate,
        meal_type: mealType,
        completed: newCompleted,
        notes: currentLog?.notes || ''
      });

      loadFoodLogs();
    } catch (error) {
      console.error('Error logging food:', error);
    }
  };

  const getMealForDayAndType = (day, type) => {
    const list = Array.isArray(meals) ? meals : [];
    return list.find(m => m.day_of_week === day && m.meal_type === type);
  };

  const isCompleted = (mealType) => {
    const logKey = `${selectedDate}_${mealType}`;
    return logs[logKey]?.completed || false;
  };

  const getDateForDay = (dayName) => {
    const dayIndex = days.indexOf(dayName);
    const selected = new Date(selectedDate);
    const selectedDayIndex = (selected.getDay() + 6) % 7; // 0=Lunes, 6=Domingo
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
    }
  };

  return (
    <div className="meal-plan-container">
      <div className="meal-plan-header">
        <h2>{t('mealPlan')}</h2>
        
        <div className="upload-section">
          <label htmlFor="pdf-upload" className="upload-button">
            {uploading ? t('uploading') : t('uploadPlan')}
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>

        <div className="date-selector">
          <label>{t('date')}:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {plan ? (
        <>
          <div className="plan-info">
            <p><strong>{t('planName')}:</strong> {plan.name}</p>
            <p><strong>{t('startDate')}:</strong> {plan.start_date}</p>
          </div>

          <div className="weekly-grid">
            {days.map(day => (
              <div key={day} className="day-column">
                <h3 className="day-header">{day}</h3>
                {mealTypes.map(type => {
                  const meal = getMealForDayAndType(day, type);
                  const completed = isCompletedForDay(day, type);
                  
                  return (
                    <div 
                      key={`${day}-${type}`} 
                      className={`meal-card ${completed ? 'completed' : ''}`}
                    >
                      <div className="meal-header">
                        <h4>{type}</h4>
                        <input
                          type="checkbox"
                          checked={completed}
                          onChange={() => toggleMealCompletionForDay(day, type)}
                          title={t('markAsCompleted')}
                        />
                      </div>
                      {meal ? (
                        <div 
                          className="meal-content"
                          onClick={() => setSelectedMeal(meal)}
                        >
                          <p className="meal-name">{meal.name}</p>
                          <button className="view-recipe">
                            {t('viewRecipe')}
                          </button>
                        </div>
                      ) : (
                        <p className="no-meal">{t('noMeal')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {plan.snacks && (
            <div className="snacks-section">
              <h3>{t('snacks')}</h3>
              <div className="snacks-content">
                <p className="snacks-text">
                  {plan.snacks
                    .replace(/ (🍌|🧊|🥭|🥥|🍿) ([A-Z1-9])/g, '\n$1 $2')
                    .replace(/ (🍉) (1 taza)/g, '\n$1 $2')
                    .replace(/ (🍍) (1 taza)/g, '\n$1 $2')
                    .replace(/ (🥒) (Pepinos)/g, '\n$1 $2')
                    .replace(/ (🥒 🍍 Jugo)/g, '\n$1')
                    .split('\n')
                    .map((line, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <br />}
                        {line}
                      </React.Fragment>
                    ))}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-plan">
          <p>{t('noPlanMessage')}</p>
        </div>
      )}

      {selectedMeal && (
        <div className="modal-overlay" onClick={() => setSelectedMeal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMeal(null)}>×</button>
            <h2>{selectedMeal.name}</h2>
            
            <div className="recipe-section">
              <h3>{t('ingredients')}</h3>
              <p className="recipe-text">{selectedMeal.ingredients}</p>
            </div>

            {selectedMeal.preparation && (
              <div className="recipe-section">
                <h3>{t('preparation')}</h3>
                <p className="recipe-text">{selectedMeal.preparation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlan;
