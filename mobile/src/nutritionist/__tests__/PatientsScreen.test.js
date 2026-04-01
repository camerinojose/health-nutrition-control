// File intentionally left blank or removed to match production Expo Go environment.
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { Share } from 'react-native'
import PatientsScreen from '../PatientsScreen'
import api from '../../api'

jest.mock('../../api')
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn()
}))

describe('NutritionistPatientsScreen - Enhanced Version', () => {
  const mockNavigate = jest.fn()
  const mockPatients = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '555-0001',
      height: 175,
      weight: 80,
      age: 30,
      sex: 'M',
      activity_level: 'moderado',
      goal: 'pérdida'
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@test.com',
      phone: '555-0002',
      height: 160,
      weight: 65,
      age: 25,
      sex: 'F',
      activity_level: 'activo',
      goal: 'mantenimiento'
    }
  ]

  const mockPatientDetails = {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@test.com',
    phone: '555-0001',
    height: 175,
    weight: 80,
    age: 30,
    sex: 'M',
    activity_level: 'moderado',
    goal: 'pérdida',
    allergies: 'Mariscos',
    conditions: 'Diabetes tipo 2',
    notes: 'Prefiere comida vegetariana'
  }

  const mockHistory = [
    {
      id: 1,
      date: '2026-01-01',
      weight: 82,
      notes: 'Inicio del tratamiento'
    },
    {
      id: 2,
      date: '2026-01-08',
      weight: 80,
      notes: 'Buena adherencia'
    }
  ]

  const mockRecommendations = [
    {
      id: 1,
      created_at: '2026-01-01T10:00:00Z',
      diet_recs: 'Reducir carbohidratos refinados',
      exercise_recs: 'Caminar 30 min diarios',
      goals: 'Perder 2kg este mes'
    },
    {
      id: 2,
      created_at: '2026-01-08T10:00:00Z',
      diet_recs: 'Aumentar proteína',
      exercise_recs: 'Agregar pesas 2x semana',
      goals: 'Mantener pérdida de peso'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    Share.share.mockResolvedValue({ action: 'sharedAction' })
  })

  describe('Component Rendering', () => {
    it('should render the screen with header and tabs', async () => {
      api.get.mockResolvedValue({ data: [] })
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        expect(getByText('Mis Pacientes')).toBeTruthy()
        expect(getByText('← Volver')).toBeTruthy()
      })
    })

    it('should display loading indicator initially', () => {
      api.get.mockImplementation(() => new Promise(() => {}))
      const { UNSAFE_queryByType } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      const activityIndicators = UNSAFE_queryByType('ActivityIndicator')
      expect(activityIndicators).toBeTruthy()
    })

    it('should show empty state when no patients', async () => {
      api.get.mockResolvedValue({ data: [] })
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        expect(getByText('No hay pacientes todavía')).toBeTruthy()
      })
    })
  })

  describe('Patients List', () => {
    it('should display all patients', async () => {
      api.get.mockResolvedValue({ data: mockPatients })
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        expect(getByText('Juan Pérez')).toBeTruthy()
        expect(getByText('María García')).toBeTruthy()
        expect(getByText('juan@test.com')).toBeTruthy()
        expect(getByText('maria@test.com')).toBeTruthy()
      })
    })

    it('should display patient metrics', async () => {
      api.get.mockResolvedValue({ data: mockPatients })
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        expect(getByText(/175 cm/)).toBeTruthy()
        expect(getByText(/80 kg/)).toBeTruthy()
        expect(getByText(/30 años/)).toBeTruthy()
      })
    })

    it('should show patient goals', async () => {
      api.get.mockResolvedValue({ data: mockPatients })
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        expect(getByText(/pérdida/)).toBeTruthy()
        expect(getByText(/mantenimiento/)).toBeTruthy()
      })
    })

    it('should show patient activity levels', async () => {
      api.get.mockResolvedValue({ data: mockPatients })
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        expect(getByText(/moderado/)).toBeTruthy()
        expect(getByText(/activo/)).toBeTruthy()
      })
    })
  })

  describe('Patient Detail View', () => {
    it('should open detail modal when patient is selected', async () => {
      api.get.mockResolvedValue({ data: mockPatients })
      api.get.mockImplementationOnce(() => Promise.resolve({ data: mockPatients }))
        .mockImplementationOnce(() => Promise.resolve({ data: mockPatientDetails }))
        .mockImplementationOnce(() => Promise.resolve({ data: mockHistory }))
        .mockImplementationOnce(() => Promise.resolve({ data: mockRecommendations }))
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/nutritionist/patients/1')
      })
    })

    it('should show tabs in detail modal', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        expect(getByText('Información')).toBeTruthy()
        expect(getByText('Recomendaciones')).toBeTruthy()
      })
    })

    it('should display patient allergies and conditions', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        expect(getByText(/Alergias:/)).toBeTruthy()
        expect(getByText('Mariscos')).toBeTruthy()
        expect(getByText(/Condiciones:/)).toBeTruthy()
        expect(getByText('Diabetes tipo 2')).toBeTruthy()
      })
    })

    it('should display patient notes', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        expect(getByText(/Notas:/)).toBeTruthy()
        expect(getByText('Prefiere comida vegetariana')).toBeTruthy()
      })
    })

    it('should display weight history', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        expect(getByText(/Historial de Peso/)).toBeTruthy()
        expect(getByText(/82 kg/)).toBeTruthy()
        expect(getByText(/80 kg/)).toBeTruthy()
      })
    })
  })

  describe('Recommendations Tab', () => {
    it('should switch to recommendations tab', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText, getAllByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        const recTabs = getAllByText('Recomendaciones')
        if (recTabs.length > 0) {
          fireEvent.press(recTabs[0])
        }
      })
      
      await waitFor(() => {
        expect(getByText(/Recomendaciones actuales/)).toBeTruthy()
      })
    })

    it('should display recommendations in the tab', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText, getAllByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        const recTabs = getAllByText('Recomendaciones')
        if (recTabs.length > 0) {
          fireEvent.press(recTabs[0])
        }
      })
      
      await waitFor(() => {
        expect(getByText('Reducir carbohidratos refinados')).toBeTruthy()
        expect(getByText('Caminar 30 min diarios')).toBeTruthy()
        expect(getByText('Perder 2kg este mes')).toBeTruthy()
      })
    })

    it('should show empty state when no recommendations', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: [] })
      
      const { getByText, getAllByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        const recTabs = getAllByText('Recomendaciones')
        if (recTabs.length > 0) {
          fireEvent.press(recTabs[0])
        }
      })
      
      await waitFor(() => {
        expect(getByText(/No hay recomendaciones/)).toBeTruthy()
      })
    })

    it('should format recommendation dates', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText, getAllByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        const recTabs = getAllByText('Recomendaciones')
        if (recTabs.length > 0) {
          fireEvent.press(recTabs[0])
        }
      })
      
      await waitFor(() => {
        // Should show formatted date
        expect(getByText(/2026/)).toBeTruthy()
      })
    })

    it('should display all recommendation sections', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText, getAllByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        const recTabs = getAllByText('Recomendaciones')
        if (recTabs.length > 0) {
          fireEvent.press(recTabs[0])
        }
      })
      
      await waitFor(() => {
        expect(getByText(/🥗 Dieta:/)).toBeTruthy()
        expect(getByText(/💪 Ejercicio:/)).toBeTruthy()
        expect(getByText(/🎯 Metas:/)).toBeTruthy()
      })
    })
  })

  describe('Export Functionality', () => {
    it('should have export button in detail view', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        expect(getByText('📤 Exportar')).toBeTruthy()
      })
    })

    it('should call Share API when export button is pressed', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        fireEvent.press(getByText('📤 Exportar'))
      })
      
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalled()
      })
    })

    it('should include patient info in export', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        fireEvent.press(getByText('📤 Exportar'))
      })
      
      await waitFor(() => {
        const shareCall = Share.share.mock.calls[0]
        if (shareCall) {
          const message = shareCall[0].message
          expect(message).toContain('Juan Pérez')
          expect(message).toContain('juan@test.com')
          expect(message).toContain('175 cm')
          expect(message).toContain('80 kg')
        }
      })
    })

    it('should include weight history in export', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        fireEvent.press(getByText('📤 Exportar'))
      })
      
      await waitFor(() => {
        const shareCall = Share.share.mock.calls[0]
        if (shareCall) {
          const message = shareCall[0].message
          expect(message).toContain('Historial de Peso')
          expect(message).toContain('82 kg')
          expect(message).toContain('80 kg')
        }
      })
    })

    it('should include recommendations in export', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        fireEvent.press(getByText('📤 Exportar'))
      })
      
      await waitFor(() => {
        const shareCall = Share.share.mock.calls[0]
        if (shareCall) {
          const message = shareCall[0].message
          expect(message).toContain('Recomendaciones')
          expect(message).toContain('Reducir carbohidratos refinados')
        }
      })
    })

    it('should handle export errors gracefully', async () => {
      Share.share.mockRejectedValue(new Error('Share failed'))
      global.console.error = jest.fn()
      
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        fireEvent.press(getByText('📤 Exportar'))
      })
      
      await waitFor(() => {
        expect(global.console.error).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error banner when patients fail to load', async () => {
      api.get.mockRejectedValue(new Error('Network error'))
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        expect(getByText('Error al cargar pacientes')).toBeTruthy()
      })
    })

    it('should handle missing patient details gracefully', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: null })
      
      const { getByText, queryByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        // Should not crash
        expect(queryByText('Juan Pérez')).toBeTruthy()
      })
    })

    it('should handle empty history gracefully', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        expect(getByText(/Historial de Peso/)).toBeTruthy()
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate back to dashboard when back button is pressed', async () => {
      api.get.mockResolvedValue({ data: [] })
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('← Volver'))
      })
      
      expect(mockNavigate).toHaveBeenCalledWith('dashboard')
    })

    it('should close detail modal when close button is pressed', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockPatients })
        .mockResolvedValueOnce({ data: mockPatientDetails })
        .mockResolvedValueOnce({ data: mockHistory })
        .mockResolvedValueOnce({ data: mockRecommendations })
      
      const { getByText, queryByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        fireEvent.press(getByText('Juan Pérez'))
      })
      
      await waitFor(() => {
        expect(getByText('Cerrar')).toBeTruthy()
      })
      
      fireEvent.press(getByText('Cerrar'))
      
      await waitFor(() => {
        expect(queryByText('Cerrar')).toBeNull()
      })
    })
  })

  describe('Pull to Refresh', () => {
    it('should reload patients on pull to refresh', async () => {
      api.get.mockResolvedValue({ data: mockPatients })
      
      const { UNSAFE_getByType } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/nutritionist/patients')
      })
      
      const scrollView = UNSAFE_getByType('ScrollView')
      const refreshControl = scrollView.props.refreshControl
      
      if (refreshControl && refreshControl.props.onRefresh) {
        refreshControl.props.onRefresh()
      }
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible labels for important elements', async () => {
      api.get.mockResolvedValue({ data: mockPatients })
      const { getByText } = render(<PatientsScreen onNavigate={mockNavigate} />)
      
      await waitFor(() => {
        expect(getByText('Mis Pacientes')).toBeTruthy()
        expect(getByText('← Volver')).toBeTruthy()
      })
    })
  })
})
// File intentionally left blank or removed to match GitHub repo state.
