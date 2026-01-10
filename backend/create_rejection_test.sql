-- Crear un nuevo cambio de cita para probar rechazo
INSERT INTO appointment_changes (appointment_id, proposed_by, new_date, new_time, reason, status, created_at)
VALUES (3, 5, '2026-01-27', '11:00', 'Hay una junta ese día, ¿podríamos cambiar al 27 a las 11:00?', 'pending', datetime('now'));

-- Crear notificación para el paciente
INSERT INTO notifications (user_id, type, title, message, related_id, is_read, created_at)
VALUES (2, 'appointment_change', '📅 Cambio de Cita Propuesto', 'La Nutrióloga María ha propuesto un cambio para tu cita', 3, 0, datetime('now'));

SELECT 'Nuevo cambio de cita creado:';
SELECT id, appointment_id, new_date, new_time, reason, status FROM appointment_changes WHERE appointment_id = 3 AND status = 'pending';

SELECT '';
SELECT 'Cita actual (antes del cambio):';
SELECT id, appointment_date, appointment_time FROM appointments WHERE id = 3;
