import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './gemini.css';

const GeminiChat = ({ onNavigate, profile }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente de nutrición basado en IA. Puedo ayudarte con:\n\n• Consejos nutricionales\n• Recomendaciones de recetas\n• Información sobre alimentos\n• Planes de alimentación\n• Preguntas sobre salud\n\n¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = useRef(new GoogleGenerativeAI(apiKey)).current;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const systemPrompt = `Eres un asistente de nutrición amigable y experto. Ayudas a los usuarios con:
- Consejos de nutrición y alimentación saludable
- Información sobre alimentos y sus beneficios
- Recomendaciones de recetas saludables
- Planes de comidas personalizadas
- Información sobre calorías, proteínas, vitaminas y minerales
- Motivación para alcanzar objetivos de salud

Responde siempre en español, de manera amigable y clara. Sé conciso pero informativo.
Si el usuario es de ${profile?.name || 'un usuario'}, personaliza tus respuestas cuando sea apropiado.`;

      const prompt = `${systemPrompt}\n\nUsuario: ${inputText}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: text,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      scrollToBottom();
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: '❌ Error al conectar con Gemini. Por favor, intenta de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: '¡Hola! Soy tu asistente de nutrición basado en IA. ¿En qué puedo ayudarte hoy?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="gemini-container">
      <div className="gemini-header">
        <button className="gemini-back-btn" onClick={() => onNavigate('home')}>
          ← Atrás
        </button>
        <h1 className="gemini-title">Gemini AI</h1>
        <button className="gemini-clear-btn" onClick={clearChat}>
          🗑️
        </button>
      </div>

      <div className="gemini-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`gemini-message ${msg.sender === 'user' ? 'user' : 'bot'}`}
          >
            <div className="gemini-bubble">
              <p className="gemini-text">{msg.text}</p>
              <span className="gemini-timestamp">
                {msg.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="gemini-message bot">
            <div className="gemini-bubble">
              <div className="gemini-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="gemini-loading-text">Gemini está escribiendo...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="gemini-input-container">
        <textarea
          className="gemini-input"
          placeholder="Pregunta a Gemini..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          rows="3"
          maxLength="500"
        />
        <button
          className="gemini-send-btn"
          onClick={sendMessage}
          disabled={loading || !inputText.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default GeminiChat;
