import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './support.css';

const Support = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: '¿Cómo subo mi plan de alimentación?',
      answer: 'Ve a "Mi Dieta" en el menú lateral y haz click en "Subir Plan". Puedes cargar un archivo PDF con tu plan semanal y el sistema lo procesará automáticamente.'
    },
    {
      question: '¿Cómo activo las notificaciones?',
      answer: 'Ve a Configuración (⚙️) en el menú, haz click en "Activar Notificaciones" y acepta los permisos del navegador. Luego configura tus horarios de comida.'
    },
    {
      question: '¿Cómo marco una comida como completada?',
      answer: 'En la página de inicio verás tus comidas del día con círculos a la izquierda. Haz click en el círculo para marcar como completada. También puedes hacerlo desde "Mi Dieta".'
    },
    {
      question: '¿Cómo registro mi peso y medidas?',
      answer: 'En tu perfil, en la sección "Subir Análisis OCR", puedes cargar una foto de tu análisis de composición corporal, o ingresar los datos manualmente.'
    },
    {
      question: '¿Puedo ver mi historial de peso?',
      answer: 'Sí, en la sección "Progreso" (📊) puedes ver gráficas de tu evolución de peso, grasa corporal y masa muscular.'
    },
    {
      question: '¿Cómo agendo una cita?',
      answer: 'Ve a "Citas" (📅) en el menú, haz click en cualquier día del calendario y completa el formulario con los detalles de tu cita.'
    },
    {
      question: '¿Puedo cambiar el idioma?',
      answer: 'Sí, en la parte superior derecha encontrarás los botones ES/EN para cambiar entre Español e Inglés.'
    },
    {
      question: '¿Los datos se guardan automáticamente?',
      answer: 'Sí, todos los datos se guardan automáticamente en el servidor cuando realizas cambios (comidas completadas, citas, medidas, etc.).'
    },
    {
      question: '¿Qué navegadores son compatibles?',
      answer: 'La aplicación funciona en Chrome, Firefox, Safari y Edge (versiones recientes). Para notificaciones push se requiere un navegador moderno.'
    },
    {
      question: '¿Puedo usar la app en móvil?',
      answer: 'Sí, la aplicación es completamente responsive y funciona en cualquier dispositivo móvil a través del navegador.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // En una implementación real, esto enviaría el mensaje al backend
    alert('Mensaje enviado. Te responderemos pronto a tu email registrado.');
    setContactForm({ subject: '', message: '' });
  };

  return (
    <div className="support-container">
      <h2>❓ {t('support') || 'Soporte'}</h2>

      <div className="support-section">
        <h3>📚 Preguntas Frecuentes</h3>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
              <div className="faq-question" onClick={() => toggleFaq(index)}>
                <span>{faq.question}</span>
                <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
              </div>
              {openFaq === index && (
                <div className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="support-section">
        <h3>📞 Contacto</h3>
        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <div>
              <strong>Email</strong>
              <p>soporte@bienestar.com</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📱</span>
            <div>
              <strong>WhatsApp</strong>
              <p>+52 123 456 7890</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">⏰</span>
            <div>
              <strong>Horario</strong>
              <p>Lun - Vie: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="support-section">
        <h3>✉️ Enviar Mensaje</h3>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div className="form-group">
            <label>Asunto</label>
            <input
              type="text"
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              placeholder="¿En qué podemos ayudarte?"
              required
            />
          </div>
          <div className="form-group">
            <label>Mensaje</label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              placeholder="Describe tu problema o pregunta..."
              rows="6"
              required
            />
          </div>
          <button type="submit" className="btn-submit">Enviar Mensaje</button>
        </form>
      </div>

      <div className="support-section quick-links">
        <h3>🔗 Enlaces Rápidos</h3>
        <div className="links-grid">
          <a href="#" className="link-card">
            <span className="link-icon">📖</span>
            <span>Guía de Inicio</span>
          </a>
          <a href="#" className="link-card">
            <span className="link-icon">🎥</span>
            <span>Video Tutoriales</span>
          </a>
          <a href="#" className="link-card">
            <span className="link-icon">🔒</span>
            <span>Privacidad</span>
          </a>
          <a href="#" className="link-card">
            <span className="link-icon">📋</span>
            <span>Términos de Uso</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Support;
