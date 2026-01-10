import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';

export default function SupportScreen({ onNavigate }) {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: '¿Cómo subo mi plan de alimentación?',
      answer: 'Ve a "Mi Dieta" y haz click en "Subir Plan". Puedes cargar un archivo PDF con tu plan semanal.'
    },
    {
      question: '¿Cómo marco una comida como completada?',
      answer: 'En la página de inicio verás tus comidas del día con círculos. Haz click en el círculo para marcar como completada.'
    },
    {
      question: '¿Cómo registro mi peso y medidas?',
      answer: 'Ve a tu perfil y busca "Subir Análisis OCR" para cargar una foto o ingresar los datos manualmente.'
    },
    {
      question: '¿Puedo ver mi historial de peso?',
      answer: 'Sí, en la sección "Progreso" (📊) puedes ver tu evolución de peso y composición corporal.'
    },
    {
      question: '¿Cómo agendo una cita?',
      answer: 'Ve a "Citas" (📅) y usa el botón + para crear una nueva cita con la fecha y hora.'
    }
  ];

  const handleContactSubmit = () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    Alert.alert('Enviado', 'Tu mensaje ha sido enviado. Te responderemos pronto.');
    setContactForm({ subject: '', message: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>❓ Soporte</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Preguntas Frecuentes</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.faqItem, openFaq === index && styles.faqItemOpen]}
              onPress={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Text style={styles.faqIcon}>{openFaq === index ? '−' : '+'}</Text>
              </View>
              {openFaq === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contacto</Text>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📧</Text>
            <View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>soporte@bienestar.com</Text>
            </View>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📱</Text>
            <View>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>+52 123 456 7890</Text>
            </View>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>⏰</Text>
            <View>
              <Text style={styles.contactLabel}>Horario</Text>
              <Text style={styles.contactValue}>Lun - Vie: 9:00 - 18:00</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✉️ Enviar Mensaje</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Asunto</Text>
            <TextInput
              style={styles.input}
              placeholder="¿En qué podemos ayudarte?"
              value={contactForm.subject}
              onChangeText={text => setContactForm({ ...contactForm, subject: text })}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mensaje</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe tu problema o pregunta..."
              value={contactForm.message}
              onChangeText={text => setContactForm({ ...contactForm, message: text })}
              multiline
              numberOfLines={5}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleContactSubmit}>
            <Text style={styles.submitBtnText}>Enviar Mensaje</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    padding: 5,
  },
  backBtnText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  faqItemOpen: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  faqIcon: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
