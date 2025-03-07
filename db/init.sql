-- Insert Users
INSERT OR IGNORE INTO users (name) VALUES
('Mia Schissel'),
('Krista Olsen'),
('Kullen Beyer'),
('Ashley Walker'),
('Elena Fayfield'),
('Ann Antonsen'),
('Neda Raeker'),
('Olga Tymouch'),
('Harriet Gustafson'),
('Reilly McCadam'),
('Kelly Johnson'),
('Melissa Rauner');

-- Delete existing events
DELETE FROM events;

-- Insert Events
INSERT OR IGNORE INTO events (title, date_start, date_end, location) VALUES
('WEC Ocala 1', '2026-02-03', '2026-02-08', 'WEC Ocala'),
('WEC Ocala 2', '2026-02-10', '2026-02-15', 'WEC Ocala'),
('WEC Ocala 3', '2026-02-17', '2026-02-22', 'WEC Ocala'),
('WEC Ocala 4', '2026-03-03', '2026-03-08', 'WEC Ocala'),
('WEC Ocala 5', '2026-03-10', '2026-03-15', 'WEC Ocala'),
('WEC Ocala 6', '2026-03-17', '2026-03-22', 'WEC Ocala'),
('WEC Ocala 7', '2026-03-24', '2026-03-29', 'WEC Ocala'),
('WEC Ocala 8', '2026-03-31', '2026-04-05', 'WEC Ocala'),
('KHP Kentucky Spring', '2025-05-07', '2025-05-11', 'Kentucky Horse Park'),
('KHP Kentucky Spring Classic', '2025-05-14', '2025-05-18', 'Kentucky Horse Park'),
('RPHJA Carriage House', '2025-05-30', '2025-06-01', 'Red Pines Hunter Jumper'),
('TC Spring I', '2025-06-04', '2025-06-08', 'Traverse City'),
('TC Spring II', '2025-06-11', '2025-06-15', 'Traverse City'),
('TC Spring III', '2025-06-17', '2025-06-22', 'Traverse City'),
('RPHJA Golden Gate', '2025-06-27', '2025-06-29', 'Red Pines Hunter Jumper'),
('TC GLEF I', '2025-07-02', '2025-07-06', 'Traverse City'),
('TC Equitation Tuesday I', '2025-07-08', '2025-07-08', 'Traverse City'),
('TC GLEF II', '2025-07-09', '2025-07-13', 'Traverse City'),
('TC Equitation Tuesday II', '2025-07-15', '2025-07-15', 'Traverse City'),
('TC GLEF III', '2025-07-16', '2025-07-20', 'Traverse City'),
('TC Equitation Tuesday III', '2025-07-22', '2025-07-22', 'Traverse City'),
('KHP Kentucky Summer', '2025-07-23', '2025-07-27', 'Kentucky Horse Park'),
('TC GLEF IV', '2025-07-23', '2025-07-27', 'Traverse City'),
('RPHJA Stonegate Farm', '2025-07-25', '2025-07-27', 'Red Pines Hunter Jumper'),
('KHP Summer Classic', '2025-07-29', '2025-08-03', 'Kentucky Horse Park'),
('TC FEI North American Youth Championships', '2025-07-29', '2025-08-03', 'Traverse City'),
('Maffitt H/J Two Rivers Summer Festival 1', '2025-07-30', '2025-08-03', 'Other'),
('TC GLEF V', '2025-07-29', '2025-08-03', 'Traverse City'),
('Maffitt H/J Two Rivers Summer Festival 2', '2025-08-06', '2025-08-10', 'Other'),
('TC GLEF VI', '2025-08-06', '2025-08-10', 'Traverse City'),
('KHP Festival Horse Show', '2025-08-12', '2025-08-17', 'Kentucky Horse Park'),
('TC Silver Oak Tournament', '2025-09-03', '2025-09-07', 'Traverse City'),
('TC Traverse City Fall International', '2025-09-10', '2025-09-14', 'Traverse City'),
('TC American Gold Cup', '2025-09-17', '2025-09-21', 'Traverse City'),
('RPHJA Finals @ Simons Arena', '2025-09-26', '2025-09-28', 'Red Pines Hunter Jumper'); 