const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8000;

// Disable ETags to force 200 OK responses instead of 304 Not Modified
app.disable('etag');

app.use(cors());
app.use(express.json());

// 1. Database Initialization
const db = new sqlite3.Database('./telemetry.db', (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to SQLite database for telemetry audit.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    method TEXT,
    path TEXT,
    status INTEGER,
    latency INTEGER,
    apiKey TEXT
  )
`);

// 2. Telemetry Audit Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const latency = Date.now() - start;
    const apiKey = req.query.apiKey || req.headers['x-api-key'] || 'NONE';

    // Exclude logging for the telemetry endpoints
    if (!req.path.startsWith('/api/telemetry') && !req.path.startsWith('/api/logs')) {
      db.run(
        `INSERT INTO telemetry (method, path, status, latency, apiKey) VALUES (?, ?, ?, ?, ?)`,
        [req.method, req.path, res.statusCode, latency, apiKey],
        (err) => {
          if (err) console.error('Failed to log request:', err.message);
        }
      );
    }
  });

  next();
});

// 3. Authentication Middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];

  if (!apiKey || apiKey === 'INVALID_KEY') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API Key',
    });
  }

  next();
};

// 4. Rate Limiting Middleware (10 requests/min per key)
const rateLimitMap = new Map();
const REQUEST_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

const rateLimiter = (req, res, next) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'] || req.ip;
  const now = Date.now();

  if (!rateLimitMap.has(apiKey)) {
    rateLimitMap.set(apiKey, []);
  }

  const timestamps = rateLimitMap.get(apiKey).filter((time) => now - time < WINDOW_MS);

  if (timestamps.length >= REQUEST_LIMIT) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${REQUEST_LIMIT} requests per minute allowed.`,
    });
  }

  timestamps.push(now);
  rateLimitMap.set(apiKey, timestamps);
  next();
};

// Apply auth and rate limiting to proxy routes
app.use('/services', authenticateApiKey, rateLimiter);

// 5. Proxy Routes
app.use(
  '/services/users',
  createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: { '^/services/users': '' },
  })
);

app.use(
  '/services/orders',
  createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
    pathRewrite: { '^/services/orders': '' },
  })
);

// 6. Telemetry & Log Control Endpoints
app.get('/api/telemetry', (req, res) => {
  db.all('SELECT * FROM telemetry ORDER BY id DESC LIMIT 50', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/logs', (req, res) => {
  res.redirect('/api/telemetry');
});

app.delete('/api/telemetry', (req, res) => {
  db.run('DELETE FROM telemetry', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Telemetry database cleared' });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
});