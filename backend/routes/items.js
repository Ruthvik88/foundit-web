const express = require('express');
const multer = require('multer');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { uploadImage } = require('../services/cloudinary');
const { sendClaimNotification } = require('../services/email');

const router = express.Router();

// Multer — store in memory for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Columns to SELECT (never includes secret_answer)
const PUBLIC_COLUMNS = `
  id, type, title, description, category, location, date_reported,
  contact_name, contact_info, verification_question, image_url, emoji,
  status, reported_by, expires_at, created_at
`;

// GET /api/items
router.get('/', async (req, res) => {
  try {
    const { type, category, q, status = 'active' } = req.query;

    let query = `SELECT ${PUBLIC_COLUMNS} FROM items WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    // Filter by status
    if (status !== 'all') {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    // Filter by type (lost / found)
    if (type && type !== 'all') {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    // Filter by category
    if (category && category !== 'all') {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    // Full-text search on title + description
    if (q && q.trim()) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
      params.push(`%${q.trim()}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/items error:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} FROM items WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/items/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST /api/items
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      category,
      location,
      contact_info,
      verification_question,
      secret_answer,
      emoji,
      date_reported,
    } = req.body;

    // Validation
    if (!type || !title || !category || !location || !contact_info || !secret_answer) {
      return res.status(400).json({
        error: 'Required fields: type, title, category, location, contact_info, secret_answer',
      });
    }

    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "lost" or "found"' });
    }

    // Upload image to Cloudinary if present
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
    }

    const result = await pool.query(
      `INSERT INTO items
        (type, title, description, category, location, date_reported,
         contact_name, contact_info, verification_question, secret_answer,
         image_url, emoji, reported_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING ${PUBLIC_COLUMNS}`,
      [
        type,
        title.trim(),
        description ? description.trim() : null,
        category,
        location.trim(),
        date_reported || new Date().toISOString().split('T')[0],
        req.user.name,                       // contact_name from auth user
        contact_info.trim(),
        verification_question || null,
        secret_answer.trim(),
        imageUrl,
        emoji || null,
        req.user.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/items error:', err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PATCH /api/items/:id/claim
router.patch('/:id/claim', requireAuth, async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    // Fetch item WITH secret_answer for comparison
    const itemResult = await pool.query(
      'SELECT * FROM items WHERE id = $1',
      [req.params.id]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = itemResult.rows[0];

    if (item.status !== 'active') {
      return res.status(400).json({ error: 'This item has already been claimed or expired' });
    }

    // Case-insensitive answer comparison
    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = (item.secret_answer || '').trim().toLowerCase();

    if (userAnswer !== correctAnswer) {
      return res.status(400).json({ error: 'Incorrect answer' });
    }

    // Mark as claimed
    await pool.query(
      "UPDATE items SET status = 'claimed' WHERE id = $1",
      [item.id]
    );

    // Insert match record
    await pool.query(
      'INSERT INTO matches (item_id, claimed_by) VALUES ($1, $2)',
      [item.id, req.user.id]
    );

    // Send email notification (non-blocking)
    sendClaimNotification(item.contact_info, item.title, req.user.name).catch((err) => {
      console.error('Email notification failed:', err);
    });

    // Return updated item (without secret_answer)
    const updatedItem = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} FROM items WHERE id = $1`,
      [item.id]
    );

    res.json({ success: true, item: updatedItem.rows[0] });
  } catch (err) {
    console.error('PATCH /api/items/:id/claim error:', err);
    res.status(500).json({ error: 'Failed to process claim' });
  }
});

module.exports = router;
