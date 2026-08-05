-- Initial Reference Seed Data for Realyt Platform

-- Ensure admin user exists
INSERT INTO users (email, full_name, password_hash, role, active, created_at)
VALUES ('thatipamulasagar7@gmail.com', 'Sagar Thatipamula', '$2a$10$vDkI8uU8.h4tZfS0G5WzquG5Y5N6Z5N6Z5N6Z5N6Z5N6Z5N6Z5N6', 'ADMIN', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Seed default availability slots if none exist
INSERT INTO availability_slots (slot_date, total_slots, booked_slots, is_available)
VALUES 
  (CURRENT_DATE + INTERVAL '1 day', 5, 0, true),
  (CURRENT_DATE + INTERVAL '2 days', 5, 0, true),
  (CURRENT_DATE + INTERVAL '3 days', 5, 0, true),
  (CURRENT_DATE + INTERVAL '5 days', 5, 0, true),
  (CURRENT_DATE + INTERVAL '7 days', 5, 0, true),
  (CURRENT_DATE + INTERVAL '10 days', 5, 0, true),
  (CURRENT_DATE + INTERVAL '12 days', 5, 0, true),
  (CURRENT_DATE + INTERVAL '15 days', 5, 0, true)
ON CONFLICT (slot_date) DO NOTHING;
