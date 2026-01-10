import React, { useEffect, useState } from 'react'
import { listNutritionists, assignNutritionist } from './api'
import './nutritionist.css'

export default function ChooseNutritionist({ onNavigate, onAssigned }) {
  const [nutritionists, setNutritionists] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const list = await listNutritionists()
        setNutritionists(list)
      } catch (err) {
        setError('No pudimos cargar la lista de nutriólogos')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleAssign = async () => {
    if (!selectedId) {
      setError('Debes elegir un nutriólogo')
      return
    }
    setError('')
    setAssigning(true)
    try {
      await assignNutritionist(selectedId)
      setSuccess('Nutriólogo asignado correctamente')
      if (onAssigned) await onAssigned()
      setTimeout(() => onNavigate ? onNavigate('home') : null, 500)
    } catch (err) {
      setError('No pudimos asignar el nutriólogo')
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <div className="nutritionist-container">
        <div className="center-content">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="nutritionist-container">
      <div className="nutritionist-header">
        <h2>👨‍⚕️ Elige tu Nutriólogo</h2>
      </div>

      <p className="nutritionist-subtitle">
        Selecciona un nutriólogo para que te acompañe en tu viaje de bienestar
      </p>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {nutritionists.length === 0 ? (
        <div className="empty-state">No hay nutriólogos disponibles</div>
      ) : (
        <div className="nutritionist-list">
          {nutritionists.map(n => (
            <button
              key={n.id}
              className={`nutritionist-card ${selectedId === n.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(n.id)}
            >
              <div className="card-content">
                <div className="nutritionist-name">{n.name}</div>
                <div className="nutritionist-email">{n.email}</div>
              </div>
              {selectedId === n.id && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}

      <div className="actions-row">
        <button
          className={`assign-btn ${assigning || !selectedId ? 'disabled' : ''}`}
          onClick={handleAssign}
          disabled={assigning || !selectedId}
        >
          {assigning ? 'Asignando...' : 'Asignar Nutriólogo'}
        </button>
        <button className="skip-btn" onClick={() => onNavigate('home')}>Saltar por ahora</button>
      </div>
    </div>
  )
}
