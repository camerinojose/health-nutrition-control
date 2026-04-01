-- Script para importar datos a PostgreSQL
-- Fecha: Abril 1, 2026
-- Ejecutar después de crear las tablas y corregir la estructura

-- NOTA: Ajustar las rutas según tu sistema operativo
-- En Windows usar: 'C:/ruta/completa/archivo.csv'
-- En Linux/Mac usar: '/ruta/completa/archivo.csv'

-- 1. Importar usuarios (ya importado según PROJECT_STATUS)
-- COPY users(id, name, email, password, role) 
-- FROM 'C:/Users/camer/github/backend/users.csv' 
-- DELIMITER ',' CSV HEADER;

-- 2. Importar perfiles de salud (ya importado)
-- COPY health_profiles(id, user_id, age, sex, height, current_weight, goal_weight, waist_circumference, medical_conditions, medications, allergies, glucose_fasting, hba1c, cholesterol_total, cholesterol_ldl, cholesterol_hdl, triglycerides, activity_level, meal_schedule, sleep_hours, goals, updated_at)
-- FROM 'C:/Users/camer/github/backend/health_profiles.csv'
-- DELIMITER ',' CSV HEADER;

-- 3. Importar recetas (ya importado)
-- COPY recipes(id, name, category, prep_time, servings, calories, protein, carbs, fat, ingredients, instructions, image_url, created_at)
-- FROM 'C:/Users/camer/github/backend/recipes.csv'
-- DELIMITER ',' CSV HEADER;

-- 4. Importar disponibilidad nutrióloga (ya importado)
-- COPY nutritionist_availability(id, nutritionist_id, day_of_week, start_time, end_time, is_available)
-- FROM 'C:/Users/camer/github/backend/nutritionist_availability.csv'
-- DELIMITER ',' CSV HEADER;

-- 5. Importar mensajes eliminados (ya importado)
-- COPY deleted_messages(id, user_id, message_id, created_at)
-- FROM 'C:/Users/camer/github/backend/deleted_messages.csv'
-- DELIMITER ',' CSV HEADER;

-- 6. Importar citas (EJECUTAR DESPUÉS de agregar columna nutritionist_id)
\COPY appointments(id, user_id, title, description, appointment_date, appointment_time, status, notes, created_at, nutritionist_id, is_archived)
FROM 'C:/Users/camer/github/backend/appointments.csv'
DELIMITER ',' CSV HEADER NULL '';

-- 7. Importar food logs
\COPY food_logs(id, user_id, date, meal_type, completed, notes)
FROM 'C:/Users/camer/github/backend/food_logs.csv'
DELIMITER ',' CSV HEADER NULL '';

-- 8. Importar meal plans
\COPY meal_plans(id, user_id, name, start_date, created_at, snacks)
FROM 'C:/Users/camer/github/backend/meal_plans.csv'
DELIMITER ',' CSV HEADER NULL '';

-- 9. Importar plan meals
\COPY plan_meals(id, plan_id, day_of_week, meal_type, name, ingredients, preparation)
FROM 'C:/Users/camer/github/backend/plan_meals.csv'
DELIMITER ',' CSV HEADER NULL '';

-- 10. Importar mensajes
\COPY messages(id, sender_id, recipient_id, content, is_read, created_at)
FROM 'C:/Users/camer/github/backend/messages.csv'
DELIMITER ',' CSV HEADER NULL '';

-- 11. Importar notificaciones
\COPY notifications(id, user_id, type, title, message, related_id, is_read, created_at)
FROM 'C:/Users/camer/github/backend/notifications.csv'
DELIMITER ',' CSV HEADER NULL '';

-- 12. Importar historiales
\COPY histories(id, user_id, date, weight, fat_percentage, muscle_percentage)
FROM 'C:/Users/camer/github/backend/histories.csv'
DELIMITER ',' CSV HEADER NULL '';

-- 13. Importar user settings (si existe)
-- \COPY user_settings(id, user_id, meal_times, enable_reminders)
-- FROM 'C:/Users/camer/github/backend/user_settings.csv'
-- DELIMITER ',' CSV HEADER NULL '';

-- 14. Importar recomendaciones (si existe)
-- \COPY recommendations(id, patient_id, nutritionist_id, appointment_id, recommendation_text, diet_changes, exercise_plan, next_goals, created_at)
-- FROM 'C:/Users/camer/github/backend/recommendations.csv'
-- DELIMITER ',' CSV HEADER NULL '';

-- 15. Resetear secuencias para autoincrementos
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));
SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));
SELECT setval('meal_plans_id_seq', (SELECT MAX(id) FROM meal_plans));
SELECT setval('plan_meals_id_seq', (SELECT MAX(id) FROM plan_meals));
SELECT setval('food_logs_id_seq', (SELECT MAX(id) FROM food_logs));
SELECT setval('recipes_id_seq', (SELECT MAX(id) FROM recipes));
SELECT setval('health_profiles_id_seq', (SELECT MAX(id) FROM health_profiles));
SELECT setval('histories_id_seq', (SELECT MAX(id) FROM histories));
