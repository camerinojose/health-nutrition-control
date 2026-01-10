import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from './api';
import './progress.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Progress = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // 30, 90, 180, all
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
  }, [history, timeRange]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/history');
      // Sort by date ascending for proper chart display
      const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setHistory(sorted);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    if (timeRange === 'all') return history;
    
    const daysAgo = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    
    return history.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const calculateStats = () => {
    const filtered = getFilteredData();
    if (filtered.length === 0) {
      setStats({ totalEntries: 0, weightChange: 0, muscleChange: 0, fatChange: 0 });
      return;
    }

    const first = filtered[0];
    const last = filtered[filtered.length - 1];

    setStats({
      totalEntries: filtered.length,
      weightChange: (last.weight - first.weight).toFixed(2),
      muscleChange: (last.muscle_mass - first.muscle_mass).toFixed(2),
      fatChange: (last.body_fat - first.body_fat).toFixed(2)
    });
  };

  const prepareChartData = (field, label, color) => {
    const filtered = getFilteredData();
    
    return {
      labels: filtered.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: label,
          data: filtered.map(entry => entry[field]),
          borderColor: color,
          backgroundColor: `${color}20`,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  };

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  });

  if (loading) {
    return (
      <div className="progress-container">
        <h2>📊 {t('progress') || 'Progreso'}</h2>
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="progress-container">
        <h2>📊 {t('progress') || 'Progreso'}</h2>
        <div className="empty-state">
          <p>📈 Aún no hay datos de progreso</p>
          <p>Sube tu primer análisis OCR desde tu perfil para empezar a ver tu evolución.</p>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>📊 {t('progress') || 'Progreso'}</h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === '30' ? 'active' : ''}
            onClick={() => setTimeRange('30')}
          >
            30 días
          </button>
          <button 
            className={timeRange === '90' ? 'active' : ''}
            onClick={() => setTimeRange('90')}
          >
            3 meses
          </button>
          <button 
            className={timeRange === '180' ? 'active' : ''}
            onClick={() => setTimeRange('180')}
          >
            6 meses
          </button>
          <button 
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            Todo
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <span className="stat-label">Cambio de Peso</span>
            <span className={`stat-value ${parseFloat(stats.weightChange) < 0 ? 'positive' : 'negative'}`}>
              {stats.weightChange > 0 ? '+' : ''}{stats.weightChange} kg
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <span className="stat-label">Cambio de Músculo</span>
            <span className={`stat-value ${parseFloat(stats.muscleChange) > 0 ? 'positive' : 'negative'}`}>
              {stats.muscleChange > 0 ? '+' : ''}{stats.muscleChange} kg
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📉</div>
          <div className="stat-content">
            <span className="stat-label">Cambio de Grasa</span>
            <span className={`stat-value ${parseFloat(stats.fatChange) < 0 ? 'positive' : 'negative'}`}>
              {stats.fatChange > 0 ? '+' : ''}{stats.fatChange} kg
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-label">Registros</span>
            <span className="stat-value">{stats.totalEntries}</span>
          </div>
        </div>
      </div>

      {filteredData.length > 0 && (
        <>
          <div className="chart-container">
            <div className="chart-wrapper">
              <Line 
                data={prepareChartData('weight', 'Peso (kg)', '#9b59b6')} 
                options={chartOptions('Evolución del Peso')} 
              />
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-container half">
              <div className="chart-wrapper">
                <Line 
                  data={prepareChartData('muscle_mass', 'Masa Muscular (kg)', '#27ae60')} 
                  options={chartOptions('Masa Muscular')} 
                />
              </div>
            </div>
            
            <div className="chart-container half">
              <div className="chart-wrapper">
                <Line 
                  data={prepareChartData('body_fat', 'Grasa Corporal (kg)', '#e74c3c')} 
                  options={chartOptions('Grasa Corporal')} 
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="history-section">
        <h3>📝 Historial Completo</h3>
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Peso</th>
                <th>Grasa</th>
                <th>Músculo</th>
                <th>IMC</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredData].reverse().map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.date).toLocaleDateString('es-ES')}</td>
                  <td>{entry.weight.toFixed(2)} kg</td>
                  <td>{entry.body_fat.toFixed(2)} kg</td>
                  <td>{entry.muscle_mass.toFixed(2)} kg</td>
                  <td>{entry.bmi ? entry.bmi.toFixed(1) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Progress;
