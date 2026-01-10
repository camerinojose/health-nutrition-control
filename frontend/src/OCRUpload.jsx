import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from './api'

export default function OCRUpload({ token, onDataExtracted }) {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editableData, setEditableData] = useState({
    weight: '',
    fat_percentage: '',
    muscle_percentage: ''
  })

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) {
      setError(t('selectImage') || 'Please select an image')
      return
    }

    setLoading(true)
    setError(null)
    setSaved(false)
    
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await api.post('/ocr', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setResult(res.data)
      setEditableData({
        weight: res.data.weight || '',
        fat_percentage: res.data.fat_percentage || '',
        muscle_percentage: res.data.muscle_percentage || ''
      })
      if (onDataExtracted) {
        onDataExtracted(res.data)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || t('ocrFailed') || 'OCR extraction failed')
    } finally {
      setLoading(false)
    }
  }

  async function saveToHistory() {
    if (!result) return

    // Validar que haya al menos peso
    const weight = parseFloat(editableData.weight)
    if (!weight || weight === 0) {
      setError(t('noValidDataToSave') || 'No hay datos válidos para guardar. Se requiere el peso.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await api.post('/history', {
        date: new Date().toISOString().split('T')[0],
        weight: weight,
        fat_percentage: parseFloat(editableData.fat_percentage) || 0,
        muscle_percentage: parseFloat(editableData.muscle_percentage) || 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSaved(true)
      alert(t('dataSavedSuccessfully') || 'Datos guardados exitosamente')
    } catch (err) {
      console.error('Error saving to history:', err)
      setError(err.response?.data?.error || t('failedToSaveData') || 'Error al guardar datos')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ocr-upload">
      <h3>{t('upload_report')}</h3>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !file}>
          {loading ? t('processing') : t('extract_data')}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="ocr-result">
          <h4>{t('extracted_data')}</h4>
          {result.name && <p><strong>{t('name')}:</strong> {result.name}</p>}
          {result.height > 0 && <p><strong>{t('height') || 'Altura'}:</strong> {result.height} cm</p>}
          {result.age > 0 && <p><strong>{t('age') || 'Edad'}:</strong> {result.age} {t('years') || 'años'}</p>}
          {result.sex && <p><strong>{t('sex') || 'Sexo'}:</strong> {result.sex}</p>}
          
          <div className="editable-fields">
            <h4>{t('reviewAndEdit') || 'Revisar y Editar Datos'}</h4>
            <div className="field-group">
              <label>{t('weight')} (kg):</label>
              <input
                type="number"
                step="0.1"
                value={editableData.weight}
                onChange={(e) => setEditableData({...editableData, weight: e.target.value})}
                placeholder="0.0"
              />
            </div>
            <div className="field-group">
              <label>{t('fat_percentage')} (%):</label>
              <input
                type="number"
                step="0.1"
                value={editableData.fat_percentage}
                onChange={(e) => setEditableData({...editableData, fat_percentage: e.target.value})}
                placeholder="0.0"
              />
            </div>
            <div className="field-group">
              <label>{t('muscle_percentage')} (%):</label>
              <input
                type="number"
                step="0.1"
                value={editableData.muscle_percentage}
                onChange={(e) => setEditableData({...editableData, muscle_percentage: e.target.value})}
                placeholder="0.0"
              />
            </div>
          </div>

          <p className="confidence-info"><strong>{t('confidence')}:</strong> {result.confidence}</p>
          
          {!saved && (
            <button 
              className="save-history-btn"
              onClick={saveToHistory}
              disabled={saving}
            >
              {saving ? t('saving') || 'Guardando...' : t('saveToHistory') || 'Guardar en Historial'}
            </button>
          )}
          {saved && <p className="success-message">{t('dataSaved') || 'Datos guardados ✓'}</p>}
        </div>
      )}
    </div>
  )
}
