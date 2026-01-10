-- Crear un nuevo cambio de cita para probar
INSERT INTO appointment_changes (appointment_id, proposed_by, new_date, new_time, reason, status, created_at)
VALUES (2, 5, '2026-01-25', '10:30', 'Tengo otra cita a esa hora, ¿te parece mejor el día 25 a las 10:30?', 'pending', datetime('now'));

-- Crear notificación para el paciente
INSERT INTO notifications (user_id, type, title, message, related_id, is_read, created_at)
VALUES (2, 'appointment_change', '📅 Cambio de Cita Propuesto', 'La Nutrióloga María ha propuesto un cambio para tu cita', 2, 0, datetime('now'));

SELECT 'Cambio de cita creado:';
SELECT * FROM appointment_changes WHERE appointment_id = 2;

SELECT 'Notificación creada:';
SELECT id, user_id, type, title, is_read FROM notifications WHERE user_id = 2 ORDER BY created_at DESC LIMIT 1;
