require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { initEmailTransporter } = require('./services/email');

const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const matchesRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// ── Body parsers ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/matches', matchesRoutes);

// ── Global error handler ────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5 MB.' });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Auto-expire job ─────────────────────────────────────────────────
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

async function expireOldItems() {
  try {
    const result = await pool.query(
      "UPDATE items SET status = 'expired' WHERE expires_at < NOW() AND status = 'active'"
    );
    if (result.rowCount > 0) {
      console.log(`⏰  Auto-expired ${result.rowCount} item(s)`);
    }
  } catch (err) {
    console.error('Auto-expire job error:', err);
  }
}

// ── Start server ────────────────────────────────────────────────────
async function start() {
  // Verify database connection
  try {
    await pool.query('SELECT NOW()');
    console.log('🗄️  Database connected');
  } catch (err) {
    console.error('❌  Database connection failed:', err.message);
    console.error('   Make sure DATABASE_URL is set and PostgreSQL is running');
    process.exit(1);
  }

  // Initialize email transporter
  initEmailTransporter();

  // Run expire job once on startup, then every 24 hours
  expireOldItems();
  setInterval(expireOldItems, TWENTY_FOUR_HOURS);

  app.listen(PORT, () => {
    console.log(`\n🚀  CampusClaim API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
}

start();
