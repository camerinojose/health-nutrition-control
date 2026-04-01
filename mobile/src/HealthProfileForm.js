import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';

const initialState = {
  age: '',
  sex: '',
  height: '',
  current_weight: '',
  goal_weight: '',
  waist_circumference: '',
  medical_conditions: '',
  medications: '',
  allergies: '',
  glucose_fasting: '',
  hba1c: '',
  cholesterol_total: '',
  cholesterol_ldl: '',
  cholesterol_hdl: '',
  triglycerides: '',
  activity_level: '',
  meal_schedule: '',
  sleep_hours: '',
  goals: '',
};

export default function HealthProfileForm({ onSubmit, initialData }) {
  const [form, setForm] = useState(initialData || initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validaciones
    const newErrors = {};
    if (!form.age || isNaN(form.age) || form.age < 1 || form.age > 120) newErrors.age = 'Edad inválida';
    if (!form.sex) newErrors.sex = 'Campo requerido';
    if (!form.height || isNaN(form.height) || form.height < 50 || form.height > 300) newErrors.height = 'Altura inválida';
    if (!form.current_weight || isNaN(form.current_weight) || form.current_weight < 20 || form.current_weight > 400) newErrors.current_weight = 'Peso inválido';
    if (form.goal_weight && (isNaN(form.goal_weight) || form.goal_weight < 20 || form.goal_weight > 400)) newErrors.goal_weight = 'Peso objetivo inválido';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitting(true);
    onSubmit && onSubmit(form);
    setSubmitting(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro de Salud del Paciente</Text>
      <TextInput style={[styles.input, errors.age && styles.inputError]} placeholder="Edad" keyboardType="numeric" value={form.age} onChangeText={v => handleChange('age', v)} />
      {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
      <TextInput style={[styles.input, errors.sex && styles.inputError]} placeholder="Sexo (M/F/Otro)" value={form.sex} onChangeText={v => handleChange('sex', v)} />
      {errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}
      <TextInput style={[styles.input, errors.height && styles.inputError]} placeholder="Altura (cm)" keyboardType="numeric" value={form.height} onChangeText={v => handleChange('height', v)} />
      {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
      <TextInput style={[styles.input, errors.current_weight && styles.inputError]} placeholder="Peso actual (kg)" keyboardType="numeric" value={form.current_weight} onChangeText={v => handleChange('current_weight', v)} />
      {errors.current_weight && <Text style={styles.errorText}>{errors.current_weight}</Text>}
      <TextInput style={[styles.input, errors.goal_weight && styles.inputError]} placeholder="Peso objetivo (kg)" keyboardType="numeric" value={form.goal_weight} onChangeText={v => handleChange('goal_weight', v)} />
      {errors.goal_weight && <Text style={styles.errorText}>{errors.goal_weight}</Text>}
      <TextInput style={styles.input} placeholder="Circunferencia de cintura (cm)" keyboardType="numeric" value={form.waist_circumference} onChangeText={v => handleChange('waist_circumference', v)} />
      <TextInput style={styles.input} placeholder="Enfermedades" value={form.medical_conditions} onChangeText={v => handleChange('medical_conditions', v)} />
      <TextInput style={styles.input} placeholder="Medicamentos" value={form.medications} onChangeText={v => handleChange('medications', v)} />
      <TextInput style={styles.input} placeholder="Alergias" value={form.allergies} onChangeText={v => handleChange('allergies', v)} />
      <TextInput style={styles.input} placeholder="Glucosa en ayunas" keyboardType="numeric" value={form.glucose_fasting} onChangeText={v => handleChange('glucose_fasting', v)} />
      <TextInput style={styles.input} placeholder="HbA1c" keyboardType="numeric" value={form.hba1c} onChangeText={v => handleChange('hba1c', v)} />
      <TextInput style={styles.input} placeholder="Colesterol total" keyboardType="numeric" value={form.cholesterol_total} onChangeText={v => handleChange('cholesterol_total', v)} />
      <TextInput style={styles.input} placeholder="Colesterol LDL" keyboardType="numeric" value={form.cholesterol_ldl} onChangeText={v => handleChange('cholesterol_ldl', v)} />
      <TextInput style={styles.input} placeholder="Colesterol HDL" keyboardType="numeric" value={form.cholesterol_hdl} onChangeText={v => handleChange('cholesterol_hdl', v)} />
      <TextInput style={styles.input} placeholder="Triglicéridos" keyboardType="numeric" value={form.triglycerides} onChangeText={v => handleChange('triglycerides', v)} />
      <TextInput style={styles.input} placeholder="Nivel de actividad" value={form.activity_level} onChangeText={v => handleChange('activity_level', v)} />
      <TextInput style={styles.input} placeholder="Horario de comidas" value={form.meal_schedule} onChangeText={v => handleChange('meal_schedule', v)} />
      <TextInput style={styles.input} placeholder="Horas de sueño" keyboardType="numeric" value={form.sleep_hours} onChangeText={v => handleChange('sleep_hours', v)} />
      <TextInput style={styles.textarea} placeholder="Metas, gustos, restricciones..." multiline value={form.goals} onChangeText={v => handleChange('goals', v)} />
      <Button title={submitting ? 'Guardando...' : 'Guardar'} onPress={handleSubmit} disabled={submitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    inputError: { borderColor: 'red' },
    errorText: { color: 'red', marginBottom: 8 },
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  textarea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, minHeight: 60, marginBottom: 10 },
});
