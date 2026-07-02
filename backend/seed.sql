-- CampusClaim Seed Data
-- Run after schema.sql: psql -d campusclaim -f seed.sql
-- Note: These items have no reported_by user since they're seed data

INSERT INTO items (type, title, description, category, location, date_reported, contact_name, contact_info, verification_question, secret_answer, emoji, status) VALUES
(
  'lost',
  'MacBook Pro Charger',
  'White Apple charger block with a slightly frayed USB-C cable. Has a small blue sticker on it.',
  'electronics',
  'Library 3rd Floor, near windows',
  '2023-10-24',
  'Alex Johnson',
  'student1@college.edu',
  'What color is the sticker on the charger block?',
  'blue',
  '💻',
  'active'
),
(
  'found',
  'Black North Face Beanie',
  'Standard black knit beanie, North Face logo on the front. Left on a table near the coffee shop.',
  'clothing',
  'Student Union Cafeteria',
  '2023-10-25',
  'Jordan Smith',
  '555-0192',
  'Where was the beanie left?',
  'cafeteria',
  '🧢',
  'active'
),
(
  'lost',
  'Hydro Flask 32oz',
  'Pacific blue color, covered in national park stickers. Dent on the bottom.',
  'accessories',
  'Science Building Room 104',
  '2023-10-26',
  'Sam Rivera',
  'student2@college.edu',
  'Where is the dent on the flask?',
  'bottom',
  '💧',
  'active'
),
(
  'found',
  'Dorm Keys with Lanyard',
  'Two brass keys on a red college lanyard. Found on the grass near the fountain.',
  'keys',
  'Main Quad',
  '2023-10-26',
  'Campus Security',
  'Campus Security',
  'What color is the lanyard?',
  'red',
  '🔑',
  'active'
),
(
  'lost',
  'Sony WH-1000XM4 Headphones',
  'Black over-ear headphones in a black carrying case.',
  'electronics',
  'Gym Weight Room',
  '2023-10-27',
  'Taylor Kim',
  'student3@college.edu',
  'What color is the carrying case?',
  'black',
  '🎧',
  'active'
),
(
  'found',
  'Silver Casio Watch',
  'Vintage style silver digital watch. Band is slightly scratched.',
  'accessories',
  'Art Studio B',
  '2023-10-27',
  'Art Department',
  'artdept@college.edu',
  'What type of watch face is it (digital or analog)?',
  'digital',
  '⌚',
  'active'
);
