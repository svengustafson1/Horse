const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
let port = process.env.PORT || 3001;  // Changed to 3001
let server;

// Function to try starting the server
const startServer = (retryPort) => {
  try {
    server = app.listen(retryPort)
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${retryPort} is busy, trying ${retryPort + 1}...`);
          startServer(retryPort + 1);
        } else {
          console.error('Server error:', err);
        }
      })
      .on('listening', () => {
        port = retryPort;  // Update the port number
        console.log(`Server is running on port ${port}`);
      });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Error starting server:', error);
  }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database with schema and data
const schemaSQL = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
const initSQL = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');

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

// Delete event
app.delete('/api/events/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM events WHERE id = ?', [id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Event deleted successfully' });
    });
});

// Add new user
app.post('/api/users', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO users (name) VALUES (?)', [name], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// Update user
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }

    db.run('UPDATE users SET name = ? WHERE id = ?', [name, id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'User updated successfully' });
    });
});

// Update event
app.put('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const { title, date_start, date_end, location, notes } = req.body;
    
    console.log('Received update request for event:', id);
    console.log('Request body:', req.body);
    
    if (!title || !date_start || !date_end || !location) {
        console.log('Validation failed - missing required fields');
        res.status(400).json({ error: 'All required fields are required' });
        return;
    }

    // First, check if notes column exists
    db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='events'", [], (err, result) => {
        if (err) {
            console.error('Error checking table schema:', err);
            res.status(500).json({ error: err.message });
            return;
        }

        const hasNotesColumn = result.sql.toLowerCase().includes('notes text');
        
        if (!hasNotesColumn) {
            // Add notes column if it doesn't exist
            db.run('ALTER TABLE events ADD COLUMN notes TEXT', [], (alterErr) => {
                if (alterErr) {
                    console.error('Error adding notes column:', alterErr);
                    res.status(500).json({ error: alterErr.message });
                    return;
                }
                performUpdate();
            });
        } else {
            performUpdate();
        }
    });

    function performUpdate() {
        db.run(
            'UPDATE events SET title = ?, date_start = ?, date_end = ?, location = ?, notes = ? WHERE id = ?',
            [title, date_start, date_end, location, notes, id],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    res.status(500).json({ error: err.message });
                    return;
                }
                console.log('Event updated successfully');
                res.json({ message: 'Event updated successfully' });
            }
        );
    }
});

// Start server
startServer(port); 