const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database setup
let db;
try {
  const dbPath = path.join(process.cwd(), 'db', 'database.sqlite');
  db = new sqlite3.Database(':memory:'); // Using in-memory database for Vercel
  
  // Initialize database with schema and data
  const schemaSQL = fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf8');
  const initSQL = fs.readFileSync(path.join(process.cwd(), 'db', 'init.sql'), 'utf8');

  db.serialize(() => {
    db.exec(schemaSQL, (err) => {
      if (err) {
        console.error('Error creating schema:', err);
      } else {
        console.log('Schema created successfully');
        db.exec(initSQL, (err) => {
          if (err) {
            console.error('Error initializing data:', err);
          } else {
            console.log('Data initialized successfully');
          }
        });
      }
    });
  });
} catch (error) {
  console.error('Database initialization error:', error);
}

// API Routes
// Get all users
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get all events
app.get('/api/events', (req, res) => {
    db.all('SELECT * FROM events ORDER BY date_start', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get responses for an event
app.get('/api/events/:eventId/responses', (req, res) => {
    const { eventId } = req.params;
    db.all(
        `SELECT r.*, u.name as user_name 
         FROM responses r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.event_id = ?`,
        [eventId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Submit a response
app.post('/api/responses', (req, res) => {
    const { user_id, event_id, status, comment } = req.body;
    db.run(
        `INSERT INTO responses (user_id, event_id, status, comment)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, event_id) 
         DO UPDATE SET status = ?, comment = ?`,
        [user_id, event_id, status, comment, status, comment],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Admin routes
// Add new event
app.post('/api/events', (req, res) => {
    const { title, date_start, date_end, location, notes } = req.body;
    db.run(
        'INSERT INTO events (title, date_start, date_end, location, notes) VALUES (?, ?, ?, ?, ?)',
        [title, date_start, date_end, location, notes],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Catch-all route for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = app; 