import React, { useEffect, useState } from 'react'
import { getAvailableSlots } from './api'
import api from './api'
import './bookings.css'

export default function BookAppointment({ onNavigate }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [form, setForm] = useState({
    title: 'Consulta con nutricionista',
    description: '',
    notes: ''
  })

  const loadSlots = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await getAvailableSlots(date)
      setSlots(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error('Error loading slots:', e)
      setError('No pudimos cargar horarios disponibles')
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBook = async () => {
    if (!selectedSlot) {
      setError('Selecciona un horario')
      return
    }
    setError('')
    setSuccess('')
    try {
      await api.post('/appointments', {
        title: form.title,
        description: form.description,
        notes: form.notes,
        appointment_date: date,
        appointment_time: selectedSlot
      })
      setSuccess('Cita creada correctamente')
      setTimeout(() => onNavigate ? onNavigate('appointments') : null, 600)
    } catch (e) {
      console.error('Error creating appointment:', e)
      setError('No se pudo crear la cita')
    }
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h2>🧑‍⚕️ Reservar Cita</h2>
        <button className="btn-back" onClick={() => onNavigate('appointments')}>← Volver</button>
      </div>

      <div className="booking-controls">
        <label>
          Fecha
          <input type="date" value={date} onChange={(e)=> setDate(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={loadSlots}>Ver horarios</button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="slot-section">
        {loading && <div className="loading">Cargando horarios...</div>}
        {!loading && slots.length === 0 && (
          <div className="empty">No hay horarios disponibles para esta fecha</div>
        )}
        {!loading && slots.length > 0 && (
          <div className="slot-grid">
            {slots.map((s, idx) => (
              <button
                key={idx}
                className={`slot ${selectedSlot === s ? 'selected' : ''}`}
                onClick={() => setSelectedSlot(s)}
                title={`Reservar ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="booking-form">
        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            value={form.title}
            onChange={(e)=> setForm({ ...form, title: e.target.value })}
            placeholder="Consulta con nutricionista"
          />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={form.description}
            onChange={(e)=> setForm({ ...form, description: e.target.value })}
            placeholder="Detalles de tu consulta..."
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Notas</label>
          <textarea
            value={form.notes}
            onChange={(e)=> setForm({ ...form, notes: e.target.value })}
            placeholder="Notas adicionales"
            rows={2}
          />
        </div>
      </div>

      <div className="booking-actions">
        <button className="btn-secondary" onClick={() => onNavigate('appointments')}>Cancelar</button>
        <button className="btn-primary" onClick={handleBook} disabled={!selectedSlot}>Reservar</button>
      </div>
    </div>
  )
}
