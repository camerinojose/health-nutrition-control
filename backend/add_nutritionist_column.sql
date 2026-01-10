-- Agregar columna nutritionist_id a appointments
ALTER TABLE appointments ADD COLUMN nutritionist_id INTEGER;

-- Asignar todas las citas existentes a la nutrióloga María (id=5)
UPDATE appointments SET nutritionist_id = 5 WHERE id IN (2, 3);

-- Verificar
SELECT 'Citas actualizadas:';
SELECT id, user_id, nutritionist_id, appointment_date, appointment_time, status FROM appointments;
