import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from './api'
import './admin.css'

export default function AdminPanel({ token }) {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userHistory, setUserHistory] = useState([])
  const [view, setView] = useState('users') // users | analytics | export
  const [roleModal, setRoleModal] = useState(null) // {userId, currentRole}

  useEffect(() => {
    fetchUsers()
  }, [token])

  async function fetchUsers() {
    try {
      setLoading(true)
      const res = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || t('failedToLoadUsers'))
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserHistory(userId) {
    try {
      const res = await api.get(`/admin/users/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUserHistory(res.data || [])
      setSelectedUser(userId)
    } catch (err) {
      console.error('Error fetching history:', err)
    }
  }

  async function exportUsers() {
    try {
      const res = await api.get('/admin/export', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Create CSV
      const csv = convertToCSV(res.data)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bienestarapp_export.csv'
      a.click()
    } catch (err) {
      setError(t('failedToExportData'))
    }
  }

  async function updateUserRole(userId, newRole) {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRoleModal(null)
      fetchUsers() // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || t('failedToUpdateRole'))
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm(t('deleteConfirm'))) {
      return
    }
    try {
      await api.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchUsers() // Refresh list
      setSelectedUser(null)
    } catch (err) {
      setError(err.response?.data?.error || t('failedToDeleteUser'))
    }
  }

  function convertToCSV(data) {
    if (!data || data.length === 0) return ''
    
    const keys = Object.keys(data[0])
    const header = keys.join(',')
    const rows = data.map(obj => 
      keys.map(key => {
        const val = obj[key]
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      }).join(',')
    )
    
    return [header, ...rows].join('\n')
  }

  if (loading) return <div className="admin-panel">{t('loading')}</div>
  if (error) return <div className="admin-panel"><p className="error">{error}</p></div>

  return (
    <div className="admin-panel">
      <h2>{t('adminDashboard')}</h2>
      
      <div className="admin-tabs">
        <button 
          className={view === 'users' ? 'active' : ''} 
          onClick={() => setView('users')}
        >
          {t('users')}
        </button>
        <button 
          className={view === 'analytics' ? 'active' : ''} 
          onClick={() => setView('analytics')}
        >
          {t('analytics')}
        </button>
        <button 
          className={view === 'export' ? 'active' : ''} 
          onClick={() => setView('export')}
        >
          {t('export')}
        </button>
      </div>

      {view === 'users' && (
        <div className="admin-section">
          <h3>{t('users')} ({users.length})</h3>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('name')}</th>
                  <th>{t('email')}</th>
                  <th>{t('role')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                      <button 
                        className="role-change-btn"
                        onClick={() => setRoleModal({userId: user.id, currentRole: user.role})}
                      >
                        {t('change')}
                      </button>
                    </td>
                    <td>
                      <button 
                        className="action-btn"
                        onClick={() => fetchUserHistory(user.id)}
                      >
                        {t('view')}
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => deleteUser(user.id)}
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <div className="user-detail">
              <h4>{t('historyForUser')} {selectedUser}</h4>
              {userHistory.length === 0 ? (
                <p>{t('noHistoryRecords')}</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>{t('date')}</th>
                      <th>{t('weight')} (kg)</th>
                      <th>{t('fat_percentage')}</th>
                      <th>{t('muscle_percentage')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userHistory.map(entry => (
                      <tr key={entry.id}>
                        <td>{entry.date}</td>
                        <td>{entry.weight}</td>
                        <td>{entry.fat_percentage}</td>
                        <td>{entry.muscle_percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'analytics' && (
        <div className="admin-section">
          <h3>{t('analytics')}</h3>
          <div className="analytics-grid">
            <div className="stat-card">
              <h4>{t('totalUsers')}</h4>
              <p className="stat-value">{users.length}</p>
            </div>
            <div className="stat-card">
              <h4>{t('admins')}</h4>
              <p className="stat-value">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <div className="stat-card">
              <h4>{t('regularUsers')}</h4>
              <p className="stat-value">{users.filter(u => u.role === 'user').length}</p>
            </div>
          </div>
        </div>
      )}

      {view === 'export' && (
        <div className="admin-section">
          <h3>{t('exportData')}</h3>
          <p>{t('exportDataDescription')}</p>
          <button className="export-btn" onClick={exportUsers}>
            {t('downloadCSVExport')}
          </button>
        </div>
      )}

      {roleModal && (
        <div className="modal-overlay" onClick={() => setRoleModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('changeUserRole')}</h3>
            <p>{t('userId')}: {roleModal.userId}</p>
            <p>{t('currentRole')}: <strong>{roleModal.currentRole}</strong></p>
            <div className="modal-actions">
              <button 
                className="modal-btn admin-role-btn"
                onClick={() => updateUserRole(roleModal.userId, 'admin')}
              >
                {t('makeAdmin')}
              </button>
              <button 
                className="modal-btn user-role-btn"
                onClick={() => updateUserRole(roleModal.userId, 'user')}
              >
                {t('makeUser')}
              </button>
              <button 
                className="modal-btn cancel-btn"
                onClick={() => setRoleModal(null)}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
