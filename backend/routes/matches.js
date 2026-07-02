const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/matches/my — items claimed by the current user
router.get('/my', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        m.id AS match_id,
        m.claimed_at,
        i.id, i.type, i.title, i.description, i.category, i.location,
        i.date_reported, i.contact_name, i.contact_info,
        i.verification_question, i.image_url, i.emoji, i.status,
        i.created_at
      FROM matches m
      JOIN items i ON m.item_id = i.id
      WHERE m.claimed_by = $1
      ORDER BY m.claimed_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/matches/my error:', err);
    res.status(500).json({ error: 'Failed to fetch your claims' });
  }
});

module.exports = router;
