-- Script para corregir problemas de migración PostgreSQL
-- Fecha: Abril 1, 2026

-- 1. Agregar columna nutritionist_id que falta en appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS nutritionist_id INTEGER REFERENCES users(id);

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist_id ON appointments(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_histories_user_id ON histories(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON health_profiles(user_id);

-- 3. Limpiar registros huérfanos (opcional - comentado por seguridad)
-- DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM users);
-- DELETE FROM appointments WHERE user_id NOT IN (SELECT id FROM users);
-- DELETE FROM messages WHERE sender_id NOT IN (SELECT id FROM users) OR recipient_id NOT IN (SELECT id FROM users);

-- 4. Actualizar valores NULL en campos que deberían tener defaults
UPDATE appointments SET status = 'scheduled' WHERE status = '' OR status IS NULL;
UPDATE appointments SET is_archived = FALSE WHERE is_archived IS NULL;
UPDATE appointments SET notes = '' WHERE notes IS NULL;

-- 5. Verificar integridad referencial
-- Esto mostrará registros problemáticos sin eliminarlos
SELECT 'appointments' as tabla, id, user_id 
FROM appointments 
WHERE user_id NOT IN (SELECT id FROM users)
UNION ALL
SELECT 'messages' as tabla, id, sender_id 
FROM messages 
WHERE sender_id NOT IN (SELECT id FROM users)
UNION ALL
SELECT 'notifications' as tabla, id, user_id 
FROM notifications 
WHERE user_id NOT IN (SELECT id FROM users);
