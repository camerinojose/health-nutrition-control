import React, { useState } from 'react';
import api from './api';
import './auth.css';


export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/reset-password', { email, newPassword });
      setSuccess(true);
      setTimeout(() => {
        onBack(email); // Pass email back to login
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>Contraseña actualizada</h2>
          <p>Puedes iniciar sesión con tu nueva contraseña.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Restablecer Contraseña</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Procesando...' : 'Restablecer Contraseña'}
          </button>
        </form>
        <button className="link-button" onClick={onBack} style={{marginTop: 16}}>Volver al inicio de sesión</button>
      </div>
    </div>
  );
}
