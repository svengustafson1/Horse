-- Clear all responses
DELETE FROM responses;

-- Reset the autoincrement counter for responses
DELETE FROM sqlite_sequence WHERE name='responses';

-- Vacuum the database to reclaim space
VACUUM; 