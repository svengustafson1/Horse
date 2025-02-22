const express = require('express');
const cors = require('cors');
const { sql } = require('@vercel/postgres');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

// API Routes

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const { rows } = await sql`SELECT * FROM users ORDER BY name`;
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const { rows } = await sql`SELECT * FROM events ORDER BY date_start`;
        res.json(rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get responses for an event
app.get('/api/events/:eventId/responses', async (req, res) => {
    const { eventId } = req.params;
    try {
        const { rows } = await sql`
            SELECT r.*, u.name as user_name 
            FROM responses r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.event_id = ${eventId}
        `;
        res.json(rows);
    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({ error: error.message });
    }
});

// Submit a response
app.post('/api/responses', async (req, res) => {
    const { user_id, event_id, status, comment } = req.body;
    try {
        const { rows } = await sql`
            INSERT INTO responses (user_id, event_id, status, comment)
            VALUES (${user_id}, ${event_id}, ${status}, ${comment})
            ON CONFLICT (user_id, event_id) 
            DO UPDATE SET status = ${status}, comment = ${comment}
            RETURNING id
        `;
        res.json({ id: rows[0].id });
    } catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add new event
app.post('/api/events', async (req, res) => {
    const { title, date_start, date_end, location, notes } = req.body;
    try {
        const { rows } = await sql`
            INSERT INTO events (title, date_start, date_end, location, notes)
            VALUES (${title}, ${date_start}, ${date_end}, ${location}, ${notes})
            RETURNING id
        `;
        res.json({ id: rows[0].id });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await sql`DELETE FROM events WHERE id = ${id}`;
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add new user
app.post('/api/users', async (req, res) => {
    const { name } = req.body;
    try {
        const { rows } = await sql`
            INSERT INTO users (name)
            VALUES (${name})
            RETURNING id
        `;
        res.json({ id: rows[0].id });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await sql`DELETE FROM users WHERE id = ${id}`;
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }

    try {
        await sql`UPDATE users SET name = ${name} WHERE id = ${id}`;
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update event
app.put('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    const { title, date_start, date_end, location, notes } = req.body;
    
    if (!title || !date_start || !date_end || !location) {
        res.status(400).json({ error: 'All required fields are required' });
        return;
    }

    try {
        await sql`
            UPDATE events 
            SET title = ${title},
                date_start = ${date_start},
                date_end = ${date_end},
                location = ${location},
                notes = ${notes}
            WHERE id = ${id}
        `;
        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

// Export the Express API
module.exports = app; 