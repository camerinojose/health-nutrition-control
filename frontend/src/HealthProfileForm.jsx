import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from './api';
import './healthProfile.css';

function HealthProfileForm({ onClose, onSave }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [profile, setProfile] = useState({
    age: '',
    sex: '',
    height: '',
    current_weight: '',
    goal_weight: '',
    waist_circumference: '',
    medical_conditions: '',
    medications: '',
    allergies: '',
    glucose_fasting: '',
    hba1c: '',
    cholesterol_total: '',
    cholesterol_ldl: '',
    cholesterol_hdl: '',
    triglycerides: '',
    activity_level: '',
    meal_schedule: '',
    sleep_hours: '',
    goals: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/health-profile');
      if (res.data && res.data.id) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    // Validaciones
    const newErrors = {};
    if (!profile.age || isNaN(profile.age) || profile.age < 1 || profile.age > 120) newErrors.age = 'Edad inválida';
    if (!profile.sex) newErrors.sex = 'Campo requerido';
    if (!profile.height || isNaN(profile.height) || profile.height < 50 || profile.height > 300) newErrors.height = 'Altura inválida';
    if (!profile.current_weight || isNaN(profile.current_weight) || profile.current_weight < 20 || profile.current_weight > 400) newErrors.current_weight = 'Peso inválido';
    if (profile.goal_weight && (isNaN(profile.goal_weight) || profile.goal_weight < 20 || profile.goal_weight > 400)) newErrors.goal_weight = 'Peso objetivo inválido';
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setLoading(false);
      setError('Por favor corrige los campos marcados.');
      return;
    }

    try {
      const isUpdate = profile.id;
      const cleanedProfile = {
        ...profile,
        age: profile.age ? parseInt(profile.age) : 0,
        height: profile.height ? parseFloat(profile.height) : 0,
        current_weight: profile.current_weight ? parseFloat(profile.current_weight) : 0,
        goal_weight: profile.goal_weight ? parseFloat(profile.goal_weight) : 0,
        waist_circumference: profile.waist_circumference ? parseFloat(profile.waist_circumference) : 0,
        glucose_fasting: profile.glucose_fasting ? parseFloat(profile.glucose_fasting) : 0,
        hba1c: profile.hba1c ? parseFloat(profile.hba1c) : 0,
        cholesterol_total: profile.cholesterol_total ? parseFloat(profile.cholesterol_total) : 0,
        cholesterol_ldl: profile.cholesterol_ldl ? parseFloat(profile.cholesterol_ldl) : 0,
        cholesterol_hdl: profile.cholesterol_hdl ? parseFloat(profile.cholesterol_hdl) : 0,
        triglycerides: profile.triglycerides ? parseFloat(profile.triglycerides) : 0,
        sleep_hours: profile.sleep_hours ? parseFloat(profile.sleep_hours) : 0,
      };

      let res;
      if (isUpdate) {
        res = await api.put('/health-profile', cleanedProfile);
      } else {
        res = await api.post('/health-profile', cleanedProfile);
      }

      if (onSave) onSave();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-profile-modal">
      <div className="health-profile-content">
        <div className="modal-header">
          <h2>{t('healthProfile')}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="health-profile-form">
          {error && <div className="error-message">{error}</div>}

          {/* Disclaimer */}
          <div className="disclaimer">
            <p><strong>⚠️ {t('disclaimer')}</strong></p>
            <p>{t('disclaimerText')}</p>
          </div>

          {/* Datos Básicos */}
          <section className="form-section">
            <h3>{t('basicData')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="age-input">{t('age')} *</label>
                <input id="age-input" type="number" name="age" value={profile.age} onChange={handleChange} required className={fieldErrors.age ? 'input-error' : ''} />
                {fieldErrors.age && <span className="error-text">{fieldErrors.age}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="sex-input">{t('sex')} *</label>
                <select id="sex-input" name="sex" value={profile.sex} onChange={handleChange} required className={fieldErrors.sex ? 'input-error' : ''}>
                  <option value="">{t('select')}</option>
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                </select>
                {fieldErrors.sex && <span className="error-text">{fieldErrors.sex}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="height-input">{t('height')} (cm) *</label>
                <input id="height-input" type="number" step="0.1" name="height" value={profile.height} onChange={handleChange} required className={fieldErrors.height ? 'input-error' : ''} />
                {fieldErrors.height && <span className="error-text">{fieldErrors.height}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="current-weight-input">{t('currentWeight')} (kg) *</label>
                <input id="current-weight-input" type="number" step="0.1" name="current_weight" value={profile.current_weight} onChange={handleChange} required className={fieldErrors.current_weight ? 'input-error' : ''} />
                {fieldErrors.current_weight && <span className="error-text">{fieldErrors.current_weight}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="goal-weight-input">{t('goalWeight')} (kg)</label>
                <input id="goal-weight-input" type="number" step="0.1" name="goal_weight" value={profile.goal_weight} onChange={handleChange} className={fieldErrors.goal_weight ? 'input-error' : ''} />
                {fieldErrors.goal_weight && <span className="error-text">{fieldErrors.goal_weight}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="waist-circumference-input">{t('waistCircumference')} (cm)</label>
                <input id="waist-circumference-input" type="number" step="0.1" name="waist_circumference" value={profile.waist_circumference} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Historial Médico */}
          <section className="form-section">
            <h3>{t('medicalHistory')}</h3>
            <div className="form-group">
              <label>{t('medicalConditions')}</label>
              <textarea 
                name="medical_conditions" 
                value={profile.medical_conditions} 
                onChange={handleChange}
                placeholder={t('medicalConditionsPlaceholder')}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>{t('medications')}</label>
              <textarea 
                name="medications" 
                value={profile.medications} 
                onChange={handleChange}
                placeholder={t('medicationsPlaceholder')}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>{t('allergies')}</label>
              <textarea 
                name="allergies" 
                value={profile.allergies} 
                onChange={handleChange}
                placeholder={t('allergiesPlaceholder')}
                rows="2"
              />
            </div>
          </section>

          {/* Datos de Laboratorio */}
          <section className="form-section">
            <h3>{t('labData')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>{t('glucoseFasting')} (mg/dL)</label>
                <input type="number" step="0.1" name="glucose_fasting" value={profile.glucose_fasting} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>{t('hba1c')} (%)</label>
                <input type="number" step="0.1" name="hba1c" value={profile.hba1c} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>{t('cholesterolTotal')} (mg/dL)</label>
                <input type="number" step="0.1" name="cholesterol_total" value={profile.cholesterol_total} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>{t('cholesterolLDL')} (mg/dL)</label>
                <input type="number" step="0.1" name="cholesterol_ldl" value={profile.cholesterol_ldl} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>{t('cholesterolHDL')} (mg/dL)</label>
                <input type="number" step="0.1" name="cholesterol_hdl" value={profile.cholesterol_hdl} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>{t('triglycerides')} (mg/dL)</label>
                <input type="number" step="0.1" name="triglycerides" value={profile.triglycerides} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Estilo de Vida */}
          <section className="form-section">
            <h3>{t('lifestyle')}</h3>
            <div className="form-group">
              <label>{t('activityLevel')}</label>
              <select name="activity_level" value={profile.activity_level} onChange={handleChange}>
                <option value="">{t('select')}</option>
                <option value="sedentary">{t('sedentary')}</option>
                <option value="light">{t('lightActivity')}</option>
                <option value="moderate">{t('moderateActivity')}</option>
                <option value="active">{t('active')}</option>
                <option value="very_active">{t('veryActive')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('mealSchedule')}</label>
              <textarea 
                name="meal_schedule" 
                value={profile.meal_schedule} 
                onChange={handleChange}
                placeholder={t('mealSchedulePlaceholder')}
                rows="2"
              />
            </div>
            <div className="form-group">
              <label>{t('sleepHours')}</label>
              <input type="number" step="0.5" name="sleep_hours" value={profile.sleep_hours} onChange={handleChange} />
            </div>
          </section>

          {/* Objetivos */}
          <section className="form-section">
            <h3>{t('healthGoals')}</h3>
            <div className="form-group">
              <label>{t('goals')}</label>
              <textarea 
                name="goals" 
                value={profile.goals} 
                onChange={handleChange}
                placeholder={t('goalsPlaceholder')}
                rows="3"
              />
            </div>
          </section>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? t('saving') : t('saveProfile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HealthProfileForm;
