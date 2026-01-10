-- Seed availability for nutritionist (user_id 8)
-- Monday through Friday, 9 AM to 5 PM with 1-hour slots

-- Monday (day_of_week = 1)
INSERT INTO nutritionist_availability (nutritionist_id, day_of_week, start_time, end_time, is_available)
VALUES 
(8, 1, '09:00', '10:00', 1),
(8, 1, '10:00', '11:00', 1),
(8, 1, '11:00', '12:00', 1),
(8, 1, '14:00', '15:00', 1),
(8, 1, '15:00', '16:00', 1),
(8, 1, '16:00', '17:00', 1);

-- Tuesday (day_of_week = 2)
INSERT INTO nutritionist_availability (nutritionist_id, day_of_week, start_time, end_time, is_available)
VALUES 
(8, 2, '09:00', '10:00', 1),
(8, 2, '10:00', '11:00', 1),
(8, 2, '11:00', '12:00', 1),
(8, 2, '14:00', '15:00', 1),
(8, 2, '15:00', '16:00', 1),
(8, 2, '16:00', '17:00', 1);

-- Wednesday (day_of_week = 3)
INSERT INTO nutritionist_availability (nutritionist_id, day_of_week, start_time, end_time, is_available)
VALUES 
(8, 3, '09:00', '10:00', 1),
(8, 3, '10:00', '11:00', 1),
(8, 3, '11:00', '12:00', 1),
(8, 3, '14:00', '15:00', 1),
(8, 3, '15:00', '16:00', 1),
(8, 3, '16:00', '17:00', 1);

-- Thursday (day_of_week = 4)
INSERT INTO nutritionist_availability (nutritionist_id, day_of_week, start_time, end_time, is_available)
VALUES 
(8, 4, '09:00', '10:00', 1),
(8, 4, '10:00', '11:00', 1),
(8, 4, '11:00', '12:00', 1),
(8, 4, '14:00', '15:00', 1),
(8, 4, '15:00', '16:00', 1),
(8, 4, '16:00', '17:00', 1);

-- Friday (day_of_week = 5)
INSERT INTO nutritionist_availability (nutritionist_id, day_of_week, start_time, end_time, is_available)
VALUES 
(8, 5, '09:00', '10:00', 1),
(8, 5, '10:00', '11:00', 1),
(8, 5, '11:00', '12:00', 1),
(8, 5, '14:00', '15:00', 1),
(8, 5, '15:00', '16:00', 1),
(8, 5, '16:00', '17:00', 1);

SELECT 'Availability seeded for nutritionist ID 8' as message;
