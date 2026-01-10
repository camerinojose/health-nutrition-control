import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { requestNotificationPermission, getNotificationStatus, showNotification } from './notifications';
import api from './api';
import './settings.css';

const Settings = ({ profile, onUpdate }) => {
  const { t } = useTranslation();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [mealTimes, setMealTimes] = useState({
    breakfast: '08:00',
    lunch: '14:00',
    dinner: '20:00',
    snack: '16:00'
  });
  const [enableReminders, setEnableReminders] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotificationPermission(getNotificationStatus());
    if (profile?.meal_times) {
      setMealTimes(profile.meal_times);
    }
    if (profile?.enable_reminders) {
      setEnableReminders(profile.enable_reminders);
    }
  }, [profile]);

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      showNotification('✅ Notificaciones Activadas', {
        body: 'Recibirás recordatorios de tus comidas'
      });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        meal_times: mealTimes,
        enable_reminders: enableReminders
      });
      
      if (onUpdate) {
        onUpdate({ ...profile, meal_times: mealTimes, enable_reminders: enableReminders });
      }
      
      alert('Configuración guardada');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = () => {
    showNotification('🔔 Notificación de Prueba', {
      body: 'Las notificaciones están funcionando correctamente'
    });
  };

  return (
    <div className="settings-container">
      <h2>⚙️ {t('settings') || 'Configuración'}</h2>

      <div className="settings-section">
        <h3>🔔 Notificaciones Push</h3>
        
        <div className="permission-status">
          <p><strong>Estado:</strong> {
            notificationPermission === 'granted' ? '✅ Activadas' :
            notificationPermission === 'denied' ? '❌ Bloqueadas' :
            notificationPermission === 'unsupported' ? '⚠️ No soportadas' :
            '⏸️ Sin configurar'
          }</p>
        </div>

        {notificationPermission === 'default' && (
          <button className="btn-primary" onClick={handleRequestPermission}>
            Activar Notificaciones
          </button>
        )}

        {notificationPermission === 'denied' && (
          <p className="warning-text">
            ⚠️ Las notificaciones están bloqueadas. Ve a la configuración de tu navegador para habilitarlas.
          </p>
        )}

        {notificationPermission === 'granted' && (
          <>
            <button className="btn-secondary" onClick={handleTestNotification}>
              Probar Notificación
            </button>

            <div className="setting-item">
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={enableReminders}
                  onChange={(e) => setEnableReminders(e.target.checked)}
                />
                <span>Habilitar recordatorios de comidas</span>
              </label>
            </div>
          </>
        )}
      </div>

      {enableReminders && notificationPermission === 'granted' && (
        <div className="settings-section">
          <h3>⏰ Horarios de Comida</h3>
          <p className="section-description">
            Configura los horarios para recibir recordatorios
          </p>

          <div className="time-inputs">
            <div className="time-input-group">
              <label>🌅 Desayuno</label>
              <input
                type="time"
                value={mealTimes.breakfast}
                onChange={(e) => setMealTimes({ ...mealTimes, breakfast: e.target.value })}
              />
            </div>

            <div className="time-input-group">
              <label>☀️ Comida</label>
              <input
                type="time"
                value={mealTimes.lunch}
                onChange={(e) => setMealTimes({ ...mealTimes, lunch: e.target.value })}
              />
            </div>

            <div className="time-input-group">
              <label>🍎 Snack</label>
              <input
                type="time"
                value={mealTimes.snack}
                onChange={(e) => setMealTimes({ ...mealTimes, snack: e.target.value })}
              />
            </div>

            <div className="time-input-group">
              <label>🌙 Cena</label>
              <input
                type="time"
                value={mealTimes.dinner}
                onChange={(e) => setMealTimes({ ...mealTimes, dinner: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <div className="settings-actions">
        <button 
          className="btn-save" 
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Guardando...' : '💾 Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
